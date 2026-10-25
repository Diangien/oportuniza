import { beforeEach, describe, expect, it } from "vitest";

import { destinoAposLogin } from "@/lib/auth";
import { CHAVES } from "@/lib/dados/armazenamento";
import { _reiniciarParaTestes, obterEstado } from "@/lib/dados/estado";
import { garantirDados } from "@/lib/dados/inicializar";
import {
  actualizarUtilizador,
  avancarMentoria,
  criarUtilizador,
  ErroDados,
  iniciarSessao,
  processarAtribuicoes,
  registarPagamento,
  rejeitarPagamento,
  solicitarMentoria,
  terminarSessao,
  utilizadorDaSessao,
  validarPagamento,
} from "@/lib/dados/repositorio";
import { IDS } from "@/lib/dados/semente";

function arrancar() {
  _reiniciarParaTestes();
  return obterEstado();
}

beforeEach(() => {
  localStorage.clear();
  _reiniciarParaTestes();
});

describe("inicialização", () => {
  it("cria os dados de demonstração e o admin padrão uma só vez", () => {
    const antes = arrancar().utilizadores.length;
    garantirDados();
    garantirDados();
    const depois = arrancar();

    expect(depois.utilizadores).toHaveLength(antes);
    expect(depois.utilizadores.filter((u) => u.email === "admin@gmail.com")).toHaveLength(1);
  });

  it("não apaga dados criados depois", () => {
    arrancar();
    criarUtilizador({ tipo: "cliente", nome: "Nova Pessoa", email: "nova@exemplo.ao", senha: "abcd" });
    const total = obterEstado().utilizadores.length;

    garantirDados();
    expect(arrancar().utilizadores).toHaveLength(total);
  });

  it("repõe só o admin padrão se tiver sido apagado", () => {
    localStorage.setItem(CHAVES.utilizadores, "[]");
    const estado = arrancar();
    expect(estado.utilizadores.map((u) => u.email)).toEqual(["admin@gmail.com"]);
  });

  it("não rebenta com JSON corrompido e guarda uma cópia", () => {
    localStorage.setItem(CHAVES.mentorias, "{isto não é json");
    const estado = arrancar();
    expect(Array.isArray(estado.mentorias)).toBe(true);
    expect(localStorage.getItem(`${CHAVES.mentorias}_corrompido`)).toBe("{isto não é json");
  });
});

describe("utilizadores e sessão", () => {
  it("rejeita e-mails repetidos, mesmo com maiúsculas", () => {
    arrancar();
    expect(() =>
      criarUtilizador({ tipo: "mentor", nome: "Outro Admin", email: "ADMIN@gmail.com ", senha: "1234" }),
    ).toThrow(ErroDados);
  });

  it("inicia e termina sessão sem apagar dados", () => {
    arrancar();
    expect(iniciarSessao("admin@gmail.com", "errada")).toBeNull();
    expect(iniciarSessao("admin@gmail.com", "1234")?.tipo).toBe("admin");
    expect(utilizadorDaSessao()?.id).toBe(IDS.admin);

    const total = obterEstado().utilizadores.length;
    terminarSessao();
    expect(utilizadorDaSessao()).toBeNull();
    expect(arrancar().utilizadores).toHaveLength(total);
  });

  it("editar mantém o id e as relações", () => {
    arrancar();
    const antes = obterEstado().utilizadores.find((u) => u.id === IDS.joana);
    actualizarUtilizador(IDS.joana, { nome: "Joana B. Bento", email: "joana.nova@exemplo.ao" });
    const depois = arrancar().utilizadores.find((u) => u.id === IDS.joana);

    expect(depois?.nome).toBe("Joana B. Bento");
    expect(depois?.email).toBe("joana.nova@exemplo.ao");
    if (antes?.tipo !== "cliente" || depois?.tipo !== "cliente") throw new Error("esperava um cliente");
    expect(depois.mentorias).toEqual(antes.mentorias);
    expect(depois.bolsasFavoritas).toEqual(antes.bolsasFavoritas);
  });

  it("não deixa usar o e-mail de outro utilizador ao editar", () => {
    arrancar();
    expect(() => actualizarUtilizador(IDS.joana, { email: "admin@gmail.com" })).toThrow(ErroDados);
  });
});

describe("destino após login", () => {
  it("só aceita endereços internos da área do próprio perfil", () => {
    arrancar();
    const cliente = obterEstado().utilizadores.find((u) => u.id === IDS.joana)!;
    expect(destinoAposLogin(cliente, "/bolsas/3")).toBe("/bolsas/3");
    expect(destinoAposLogin(cliente, "/cliente/mentorias")).toBe("/cliente/mentorias");
    expect(destinoAposLogin(cliente, "/admin/utilizadores")).toBe("/cliente");
    expect(destinoAposLogin(cliente, "//site-externo.com")).toBe("/cliente");
    expect(destinoAposLogin(cliente)).toBe("/cliente");
  });
});

describe("fluxo de mentoria", () => {
  it("só atribui mentor depois de o pagamento ser validado", () => {
    arrancar();
    const mentoria = solicitarMentoria(IDS.nelson, "m2", "5");
    expect(mentoria.estado).toBe("aguardando_pagamento");

    const pagamento = registarPagamento(mentoria.id, IDS.nelson, { metodo: "transferencia", referencia: "TESTE-001" });
    let actual = obterEstado().mentorias.find((m) => m.id === mentoria.id);
    expect(actual?.estado).toBe("pagamento_pendente_validacao");
    expect(actual?.mentorId).toBeNull();

    // Processar atribuições antes da validação não pode atribuir nada.
    processarAtribuicoes();
    expect(obterEstado().mentorias.find((m) => m.id === mentoria.id)?.mentorId).toBeNull();

    const { mentor } = validarPagamento(pagamento.id);
    // Pedro tem 1 cliente e Ana tem 2: escolhe o que tem menos.
    expect(mentor?.id).toBe(IDS.pedro);
    actual = obterEstado().mentorias.find((m) => m.id === mentoria.id);
    expect(actual?.estado).toBe("mentor_atribuido");

    const pedro = obterEstado().utilizadores.find((u) => u.id === IDS.pedro);
    expect(pedro?.tipo === "mentor" && pedro.clientesOrientados).toContain(IDS.nelson);
  });

  it("repetir o processamento não atribui duas vezes", () => {
    arrancar();
    const m = solicitarMentoria(IDS.nelson, "m1", null);
    const p = registarPagamento(m.id, IDS.nelson, { metodo: "multicaixa_express", referencia: "TESTE-002" });
    validarPagamento(p.id);
    const depoisDaValidacao = JSON.stringify(obterEstado().mentorias);

    expect(processarAtribuicoes()).toBe(0);
    expect(processarAtribuicoes()).toBe(0);
    expect(JSON.stringify(obterEstado().mentorias)).toBe(depoisDaValidacao);
  });

  it("sem mentores activos, fica paga à espera e é atribuída ao reactivar um", () => {
    arrancar();
    actualizarUtilizador(IDS.ana, { ativo: false });
    actualizarUtilizador(IDS.pedro, { ativo: false });

    const m = solicitarMentoria(IDS.nelson, "m3", null);
    const p = registarPagamento(m.id, IDS.nelson, { metodo: "transferencia", referencia: "TESTE-003" });
    expect(validarPagamento(p.id).mentor).toBeNull();

    let actual = obterEstado().mentorias.find((x) => x.id === m.id);
    expect(actual?.estado).toBe("pago");
    expect(obterEstado().pagamentos.find((x) => x.id === p.id)?.estado).toBe("validado");

    actualizarUtilizador(IDS.rosa, { ativo: true });
    actual = obterEstado().mentorias.find((x) => x.id === m.id);
    expect(actual?.mentorId).toBe(IDS.rosa);
  });

  it("um pagamento rejeitado volta a permitir pagar", () => {
    arrancar();
    rejeitarPagamento(IDS.pagamento2);
    const m = obterEstado().mentorias.find((x) => x.id === IDS.mentoria2);
    expect(m?.estado).toBe("aguardando_pagamento");
    expect(() =>
      registarPagamento(IDS.mentoria2, IDS.nelson, { metodo: "transferencia", referencia: "TESTE-004" }),
    ).not.toThrow();
  });

  it("só o mentor atribuído avança a mentoria", () => {
    arrancar();
    expect(() => avancarMentoria(IDS.mentoria3, IDS.pedro)).toThrow(ErroDados);
    expect(avancarMentoria(IDS.mentoria3, IDS.ana).estado).toBe("em_andamento");
  });
});
