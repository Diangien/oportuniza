import { bolsas } from "@/lib/mock";

import type { Mentoria, Pagamento, Utilizador, UtilizadorAdmin } from "./modelos";
import { copiar } from "./util";

// Dados de demonstração. Os ids são fixos para as relações entre registos
// (cliente ↔ mentor ↔ mentoria ↔ pagamento) serem sempre as mesmas.
// Todas as contas usam a palavra-passe "1234" (lista no README).

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

export const ADMIN_PADRAO_EMAIL = "admin@gmail.com";

export const IDS = {
  admin: id(1),
  ana: id(11),
  pedro: id(12),
  rosa: id(13),
  joana: id(21),
  carlos: id(22),
  marta: id(23),
  nelson: id(24),
  mentoria1: id(31),
  mentoria2: id(32),
  mentoria3: id(33),
  mentoria4: id(34),
  mentoria5: id(35),
  pagamento2: id(42),
  pagamento3: id(43),
  pagamento4: id(44),
  pagamento5: id(45),
};

export const adminPadrao: UtilizadorAdmin = {
  id: IDS.admin,
  nome: "Administrador do Sistema",
  email: ADMIN_PADRAO_EMAIL,
  senha: "1234",
  tipo: "admin",
  fotoPerfil: null,
  dataCriacao: "2026-09-01T09:00:00.000Z",
};

export function sementeUtilizadores(): Utilizador[] {
  return [
    adminPadrao,
    {
      id: IDS.ana,
      nome: "Ana Lucas",
      email: "ana.lucas@bolsaangola.ao",
      senha: "1234",
      tipo: "mentor",
      fotoPerfil: null,
      ativo: true,
      clientesOrientados: [IDS.joana, IDS.carlos],
      dataCriacao: "2026-09-02T10:00:00.000Z",
    },
    {
      id: IDS.pedro,
      nome: "Pedro Kiala",
      email: "pedro.kiala@bolsaangola.ao",
      senha: "1234",
      tipo: "mentor",
      fotoPerfil: null,
      ativo: true,
      clientesOrientados: [IDS.marta],
      dataCriacao: "2026-09-03T10:00:00.000Z",
    },
    {
      id: IDS.rosa,
      nome: "Rosa Manuel",
      email: "rosa.manuel@bolsaangola.ao",
      senha: "1234",
      tipo: "mentor",
      fotoPerfil: null,
      ativo: false,
      clientesOrientados: [],
      dataCriacao: "2026-09-04T10:00:00.000Z",
    },
    {
      id: IDS.joana,
      nome: "Joana Bento",
      email: "joana.bento@exemplo.ao",
      senha: "1234",
      tipo: "cliente",
      fotoPerfil: null,
      areasInteresse: ["Gestão", "Ciências Sociais"],
      grauAcademico: "Licenciatura",
      bolsasFavoritas: ["3", "5"],
      bolsasAssociadas: ["3"],
      mentorias: [IDS.mentoria3],
      dataCriacao: "2026-09-10T14:00:00.000Z",
    },
    {
      id: IDS.carlos,
      nome: "Carlos Domingos",
      email: "carlos.domingos@exemplo.ao",
      senha: "1234",
      tipo: "cliente",
      fotoPerfil: null,
      areasInteresse: ["Engenharia"],
      grauAcademico: "Ensino Médio",
      bolsasFavoritas: ["4"],
      bolsasAssociadas: ["4"],
      mentorias: [IDS.mentoria4],
      dataCriacao: "2026-09-12T15:00:00.000Z",
    },
    {
      id: IDS.marta,
      nome: "Marta Sebastião",
      email: "marta.sebastiao@exemplo.ao",
      senha: "1234",
      tipo: "cliente",
      fotoPerfil: null,
      areasInteresse: ["Saúde", "Ciências Exactas"],
      grauAcademico: "Mestrado",
      bolsasFavoritas: ["6", "1"],
      bolsasAssociadas: ["6"],
      mentorias: [IDS.mentoria5],
      dataCriacao: "2026-09-15T11:00:00.000Z",
    },
    {
      id: IDS.nelson,
      nome: "Nelson Tavares",
      email: "nelson.tavares@exemplo.ao",
      senha: "1234",
      tipo: "cliente",
      fotoPerfil: null,
      areasInteresse: ["Tecnologia"],
      grauAcademico: "Licenciatura",
      bolsasFavoritas: ["1"],
      bolsasAssociadas: ["1", "3"],
      mentorias: [IDS.mentoria1, IDS.mentoria2],
      dataCriacao: "2026-10-01T09:30:00.000Z",
    },
  ];
}

export function sementeMentorias(): Mentoria[] {
  return [
    {
      id: IDS.mentoria1,
      clienteId: IDS.nelson,
      mentorId: null,
      planoId: "m1",
      bolsaId: "3",
      estado: "aguardando_pagamento",
      pagamentoId: null,
      dataCriacao: "2026-10-15T10:00:00.000Z",
      dataActualizacao: "2026-10-15T10:00:00.000Z",
    },
    {
      id: IDS.mentoria2,
      clienteId: IDS.nelson,
      mentorId: null,
      planoId: "m3",
      bolsaId: "1",
      estado: "pagamento_pendente_validacao",
      pagamentoId: IDS.pagamento2,
      dataCriacao: "2026-10-16T10:00:00.000Z",
      dataActualizacao: "2026-10-17T08:00:00.000Z",
    },
    {
      id: IDS.mentoria3,
      clienteId: IDS.joana,
      mentorId: IDS.ana,
      planoId: "m2",
      bolsaId: "3",
      estado: "mentor_atribuido",
      pagamentoId: IDS.pagamento3,
      dataCriacao: "2026-10-05T10:00:00.000Z",
      dataActualizacao: "2026-10-06T09:00:00.000Z",
    },
    {
      id: IDS.mentoria4,
      clienteId: IDS.carlos,
      mentorId: IDS.ana,
      planoId: "m1",
      bolsaId: "4",
      estado: "em_andamento",
      pagamentoId: IDS.pagamento4,
      dataCriacao: "2026-09-20T10:00:00.000Z",
      dataActualizacao: "2026-09-25T09:00:00.000Z",
    },
    {
      id: IDS.mentoria5,
      clienteId: IDS.marta,
      mentorId: IDS.pedro,
      planoId: "m3",
      bolsaId: "6",
      estado: "concluida",
      pagamentoId: IDS.pagamento5,
      dataCriacao: "2026-09-18T10:00:00.000Z",
      dataActualizacao: "2026-10-02T17:00:00.000Z",
    },
  ];
}

export function sementePagamentos(): Pagamento[] {
  const pagamento = (
    id: string,
    mentoriaId: string,
    clienteId: string,
    valor: number,
    estado: Pagamento["estado"],
    dataRegisto: string,
  ): Pagamento => ({
    id,
    mentoriaId,
    clienteId,
    valor,
    metodo: "multicaixa_express",
    referencia: `DEMO-${id.slice(-4)}`,
    estado,
    dataRegisto,
    dataValidacao: estado === "validado" ? dataRegisto : null,
  });
  return [
    pagamento(IDS.pagamento2, IDS.mentoria2, IDS.nelson, 25000, "pendente", "2026-10-17T08:00:00.000Z"),
    pagamento(IDS.pagamento3, IDS.mentoria3, IDS.joana, 60000, "validado", "2026-10-06T09:00:00.000Z"),
    pagamento(IDS.pagamento4, IDS.mentoria4, IDS.carlos, 15000, "validado", "2026-09-21T09:00:00.000Z"),
    pagamento(IDS.pagamento5, IDS.mentoria5, IDS.marta, 25000, "validado", "2026-09-19T09:00:00.000Z"),
  ];
}

export function sementeBolsas() {
  return copiar(bolsas);
}
