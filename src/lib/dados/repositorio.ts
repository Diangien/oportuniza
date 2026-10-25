import { mentorias as planos } from "@/lib/mock";

import { apagarFavoritosAnonimos, lerFavoritosAnonimos } from "./armazenamento";
import { obterEstado, recarregarEstado, transaccao } from "./estado";
import { escreverDadosDemonstracao } from "./inicializar";
import type {
  BaseDados,
  EstadoMentoria,
  Mentoria,
  MetodoPagamento,
  Pagamento,
  TipoUtilizador,
  Utilizador,
  UtilizadorCliente,
  UtilizadorMentor,
} from "./modelos";
import { agora, gerarId, normalizarEmail } from "./util";

// Operações da "base de dados". A interface só usa estas funções (e o estado
// via useDados), nunca o localStorage directamente. Para ligar a uma API real,
// basta reimplementá-las.

export class ErroDados extends Error {
  constructor(
    mensagem: string,
    readonly campo?: string,
  ) {
    super(mensagem);
  }
}

// ---------- Consultas (funcionam sobre o estado passado ou o actual) ----------

export const listarUtilizadores = (dados = obterEstado()) => dados.utilizadores;

export const obterUtilizador = (id: string, dados = obterEstado()) =>
  dados.utilizadores.find((u) => u.id === id) ?? null;

export const obterPorEmail = (email: string, dados = obterEstado()) =>
  dados.utilizadores.find((u) => u.email.toLowerCase() === normalizarEmail(email)) ?? null;

export function emailEmUso(email: string, excluirId?: string, dados = obterEstado()) {
  const existente = obterPorEmail(email, dados);
  return existente !== null && existente.id !== excluirId;
}

export function utilizadorDaSessao(dados = obterEstado()): Utilizador | null {
  return dados.sessao ? obterUtilizador(dados.sessao.utilizadorId, dados) : null;
}

export const obterBolsa = (id: string | null, dados = obterEstado()) =>
  (id && dados.bolsas.find((b) => b.id === id)) || null;

export const obterPlano = (id: string) => planos.find((p) => p.id === id) ?? null;

export const mentoriasDoCliente = (clienteId: string, dados = obterEstado()) =>
  dados.mentorias.filter((m) => m.clienteId === clienteId);

export const mentoriasDoMentor = (mentorId: string, dados = obterEstado()) =>
  dados.mentorias.filter((m) => m.mentorId === mentorId);

// ---------- Utilizadores ----------

type Opcional<T> = T | undefined;

export type DadosNovoUtilizador = {
  nome: string;
  email: string;
  senha: string;
  fotoPerfil?: Opcional<string | null>;
} & (
  | { tipo: "cliente"; areasInteresse?: Opcional<string[]>; grauAcademico?: Opcional<string | null> }
  | { tipo: "mentor"; ativo?: Opcional<boolean> }
  | { tipo: "admin" }
);

export function criarUtilizador(dados: DadosNovoUtilizador): Utilizador {
  return transaccao((db) => {
    const email = normalizarEmail(dados.email);
    if (emailEmUso(email, undefined, db)) throw new ErroDados("Este e-mail já está registado.", "email");

    const comum = {
      id: gerarId(),
      nome: dados.nome.trim(),
      email,
      senha: dados.senha,
      fotoPerfil: dados.fotoPerfil ?? null,
      dataCriacao: agora(),
    };
    let novo: Utilizador;
    if (dados.tipo === "cliente") {
      novo = {
        ...comum,
        tipo: "cliente",
        areasInteresse: dados.areasInteresse ?? [],
        grauAcademico: dados.grauAcademico || null,
        bolsasFavoritas: [],
        bolsasAssociadas: [],
        mentorias: [],
      };
    } else if (dados.tipo === "mentor") {
      novo = { ...comum, tipo: "mentor", ativo: dados.ativo ?? true, clientesOrientados: [] };
    } else {
      novo = { ...comum, tipo: "admin" };
    }
    db.utilizadores.push(novo);
    // Um mentor novo pode receber pedidos pagos que estavam à espera.
    if (novo.tipo === "mentor") atribuirPendentes(db);
    return novo;
  });
}

export type AlteracoesUtilizador = {
  nome?: Opcional<string>;
  email?: Opcional<string>;
  senha?: Opcional<string>;
  fotoPerfil?: Opcional<string | null>;
  areasInteresse?: Opcional<string[]>;
  grauAcademico?: Opcional<string | null>;
  ativo?: Opcional<boolean>;
};

// Actualiza só os campos indicados. O id, o tipo e as relações (favoritas,
// mentorias, clientes orientados) mantêm-se sempre.
export function actualizarUtilizador(id: string, alteracoes: AlteracoesUtilizador): Utilizador {
  return transaccao((db) => {
    const u = obterUtilizador(id, db);
    if (!u) throw new ErroDados("Utilizador não encontrado.");

    if (alteracoes.email !== undefined) {
      const email = normalizarEmail(alteracoes.email);
      if (emailEmUso(email, id, db)) throw new ErroDados("Este e-mail já pertence a outro utilizador.", "email");
      u.email = email;
    }
    if (alteracoes.nome !== undefined) u.nome = alteracoes.nome.trim();
    if (alteracoes.senha) u.senha = alteracoes.senha;
    if (alteracoes.fotoPerfil !== undefined) u.fotoPerfil = alteracoes.fotoPerfil;

    if (u.tipo === "cliente") {
      if (alteracoes.areasInteresse !== undefined) u.areasInteresse = alteracoes.areasInteresse;
      if (alteracoes.grauAcademico !== undefined) u.grauAcademico = alteracoes.grauAcademico || null;
    }
    if (u.tipo === "mentor" && alteracoes.ativo !== undefined) {
      const reactivado = !u.ativo && alteracoes.ativo;
      u.ativo = alteracoes.ativo;
      if (reactivado) atribuirPendentes(db);
    }
    return u;
  });
}

export function alterarSenha(id: string, actual: string, nova: string) {
  transaccao((db) => {
    const u = obterUtilizador(id, db);
    if (!u) throw new ErroDados("Utilizador não encontrado.");
    if (u.senha !== actual) throw new ErroDados("A palavra-passe actual não está correcta.", "senhaActual");
    u.senha = nova;
  });
}

// ---------- Sessão ----------

export function iniciarSessao(email: string, senha: string): Utilizador | null {
  const u = obterPorEmail(email);
  if (!u || u.senha !== senha) return null;
  transaccao((db) => {
    db.sessao = { utilizadorId: u.id, inicio: agora() };
    if (u.tipo === "cliente") migrarFavoritosAnonimos(db, u.id);
  });
  return obterUtilizador(u.id);
}

// Termina só a sessão: utilizadores e restantes dados ficam guardados.
export function terminarSessao() {
  transaccao((db) => {
    db.sessao = null;
  });
}

// Favoritos guardados antes de haver contas passam para o primeiro cliente
// que entrar neste browser, sem duplicar.
function migrarFavoritosAnonimos(db: BaseDados, clienteId: string) {
  const anonimos = lerFavoritosAnonimos();
  if (anonimos.length === 0) return;
  const cliente = obterCliente(db, clienteId);
  const validos = anonimos.filter((id) => obterBolsa(id, db));
  cliente.bolsasFavoritas = [...new Set([...cliente.bolsasFavoritas, ...validos])];
  apagarFavoritosAnonimos();
}

// ---------- Cliente: favoritas e bolsas associadas ----------

function obterCliente(db: BaseDados, id: string): UtilizadorCliente {
  const u = obterUtilizador(id, db);
  if (!u || u.tipo !== "cliente") throw new ErroDados("Esta acção é apenas para clientes.");
  return u;
}

function obterMentor(db: BaseDados, id: string): UtilizadorMentor {
  const u = obterUtilizador(id, db);
  if (!u || u.tipo !== "mentor") throw new ErroDados("Mentor não encontrado.");
  return u;
}

const alternar = (lista: string[], valor: string) =>
  lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor];

// Devolve true se a bolsa ficou nos favoritos.
export function alternarFavorita(clienteId: string, bolsaId: string): boolean {
  return transaccao((db) => {
    const cliente = obterCliente(db, clienteId);
    cliente.bolsasFavoritas = alternar(cliente.bolsasFavoritas, bolsaId);
    return cliente.bolsasFavoritas.includes(bolsaId);
  });
}

export function associarBolsa(clienteId: string, bolsaId: string) {
  transaccao((db) => {
    const cliente = obterCliente(db, clienteId);
    if (!obterBolsa(bolsaId, db)) throw new ErroDados("Bolsa não encontrada.");
    if (!cliente.bolsasAssociadas.includes(bolsaId)) cliente.bolsasAssociadas.push(bolsaId);
  });
}

export function desassociarBolsa(clienteId: string, bolsaId: string) {
  transaccao((db) => {
    const cliente = obterCliente(db, clienteId);
    cliente.bolsasAssociadas = cliente.bolsasAssociadas.filter((id) => id !== bolsaId);
  });
}

// ---------- Mentorias e pagamentos ----------

function obterMentoria(db: BaseDados, id: string): Mentoria {
  const m = db.mentorias.find((x) => x.id === id);
  if (!m) throw new ErroDados("Mentoria não encontrada.");
  return m;
}

function obterPagamento(db: BaseDados, id: string): Pagamento {
  const p = db.pagamentos.find((x) => x.id === id);
  if (!p) throw new ErroDados("Pagamento não encontrado.");
  return p;
}

export function solicitarMentoria(clienteId: string, planoId: string, bolsaId: string | null): Mentoria {
  return transaccao((db) => {
    const cliente = obterCliente(db, clienteId);
    if (!obterPlano(planoId)) throw new ErroDados("Escolha um plano de mentoria.", "planoId");
    if (bolsaId && !obterBolsa(bolsaId, db)) throw new ErroDados("Bolsa não encontrada.", "bolsaId");

    const data = agora();
    const mentoria: Mentoria = {
      id: gerarId(),
      clienteId,
      mentorId: null,
      planoId,
      bolsaId: bolsaId || null,
      estado: "aguardando_pagamento",
      pagamentoId: null,
      dataCriacao: data,
      dataActualizacao: data,
    };
    db.mentorias.push(mentoria);
    cliente.mentorias.push(mentoria.id);
    if (bolsaId && !cliente.bolsasAssociadas.includes(bolsaId)) cliente.bolsasAssociadas.push(bolsaId);
    return mentoria;
  });
}

// Regista o pagamento simulado. Fica por validar: ainda NÃO atribui mentor.
export function registarPagamento(
  mentoriaId: string,
  clienteId: string,
  dados: { metodo: MetodoPagamento; referencia: string },
): Pagamento {
  return transaccao((db) => {
    const mentoria = obterMentoria(db, mentoriaId);
    if (mentoria.clienteId !== clienteId) throw new ErroDados("Esta mentoria pertence a outro cliente.");
    if (mentoria.estado !== "aguardando_pagamento")
      throw new ErroDados("Esta mentoria já tem um pagamento registado.");

    const pagamento: Pagamento = {
      id: gerarId(),
      mentoriaId,
      clienteId,
      valor: obterPlano(mentoria.planoId)?.valor ?? 0,
      metodo: dados.metodo,
      referencia: dados.referencia.trim(),
      estado: "pendente",
      dataRegisto: agora(),
      dataValidacao: null,
    };
    db.pagamentos.push(pagamento);
    mentoria.pagamentoId = pagamento.id;
    mentoria.estado = "pagamento_pendente_validacao";
    mentoria.dataActualizacao = pagamento.dataRegisto;
    return pagamento;
  });
}

// Validação pelo administrador. Só aqui a mentoria passa a "pago" e só então
// se tenta atribuir um mentor. Devolve o mentor atribuído, ou null se não
// havia nenhum activo (o pedido fica pago, à espera).
export function validarPagamento(pagamentoId: string): { mentoria: Mentoria; mentor: UtilizadorMentor | null } {
  return transaccao((db) => {
    const pagamento = obterPagamento(db, pagamentoId);
    if (pagamento.estado !== "pendente") throw new ErroDados("Este pagamento já foi tratado.");
    const mentoria = obterMentoria(db, pagamento.mentoriaId);

    pagamento.estado = "validado";
    pagamento.dataValidacao = agora();
    mentoria.estado = "pago";
    mentoria.dataActualizacao = pagamento.dataValidacao;

    atribuirPendentes(db);
    const mentor = mentoria.mentorId ? obterMentor(db, mentoria.mentorId) : null;
    return { mentoria, mentor };
  });
}

export function rejeitarPagamento(pagamentoId: string) {
  transaccao((db) => {
    const pagamento = obterPagamento(db, pagamentoId);
    if (pagamento.estado !== "pendente") throw new ErroDados("Este pagamento já foi tratado.");
    const mentoria = obterMentoria(db, pagamento.mentoriaId);
    pagamento.estado = "rejeitado";
    pagamento.dataValidacao = agora();
    // O cliente pode voltar a registar um pagamento; o rejeitado fica no histórico.
    mentoria.estado = "aguardando_pagamento";
    mentoria.pagamentoId = null;
    mentoria.dataActualizacao = pagamento.dataValidacao;
  });
}

// Atribui um mentor a cada mentoria paga que ainda não o tem. Só considera
// pagamentos validados e só mexe em mentorias sem mentor, por isso pode correr
// as vezes que for preciso sem atribuir o mesmo pedido duas vezes.
function atribuirPendentes(db: BaseDados): number {
  let atribuidas = 0;
  for (const mentoria of db.mentorias) {
    if (mentoria.estado !== "pago" || mentoria.mentorId !== null) continue;
    const pagamento = db.pagamentos.find((p) => p.id === mentoria.pagamentoId);
    if (pagamento?.estado !== "validado") continue;

    const mentor = escolherMentor(db);
    if (!mentor) break; // Sem mentores activos: os pedidos ficam pagos, à espera.

    mentoria.mentorId = mentor.id;
    mentoria.estado = "mentor_atribuido";
    mentoria.dataActualizacao = agora();
    if (!mentor.clientesOrientados.includes(mentoria.clienteId)) mentor.clientesOrientados.push(mentoria.clienteId);
    atribuidas++;
  }
  return atribuidas;
}

// Mentor activo com menos clientes; em empate, o mais antigo.
function escolherMentor(db: BaseDados): UtilizadorMentor | null {
  const activos = db.utilizadores.filter((u): u is UtilizadorMentor => u.tipo === "mentor" && u.ativo);
  activos.sort(
    (a, b) => a.clientesOrientados.length - b.clientesOrientados.length || a.dataCriacao.localeCompare(b.dataCriacao),
  );
  return activos[0] ?? null;
}

export function processarAtribuicoes(): number {
  return transaccao(atribuirPendentes);
}

const PROXIMO_ESTADO: Partial<Record<EstadoMentoria, EstadoMentoria>> = {
  mentor_atribuido: "em_andamento",
  em_andamento: "concluida",
};

// O mentor atribuído avança a mentoria: atribuída → em andamento → concluída.
export function avancarMentoria(mentoriaId: string, mentorId: string): Mentoria {
  return transaccao((db) => {
    const mentoria = obterMentoria(db, mentoriaId);
    if (mentoria.mentorId !== mentorId) throw new ErroDados("Esta mentoria está atribuída a outro mentor.");
    const proximo = PROXIMO_ESTADO[mentoria.estado];
    if (!proximo) throw new ErroDados("Esta mentoria não pode avançar mais.");
    mentoria.estado = proximo;
    mentoria.dataActualizacao = agora();
    return mentoria;
  });
}

// ---------- Demonstração ----------

// Repõe os dados de exemplo (só a pedido do administrador). A sessão mantém-se
// se a conta continuar a existir; caso contrário, a pessoa volta ao login.
export function reporDadosDemonstracao() {
  escreverDadosDemonstracao();
  recarregarEstado();
}

export type { TipoUtilizador };
