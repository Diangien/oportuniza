import { z } from "zod";

// Esquemas dos dados guardados no localStorage. Servem para duas coisas: os
// tipos TypeScript saem daqui (z.infer) e o que se lê do browser é validado
// contra eles, porque o localStorage guarda texto que pode estar corrompido.

export const TIPOS_UTILIZADOR = ["admin", "mentor", "cliente"] as const;
export type TipoUtilizador = (typeof TIPOS_UTILIZADOR)[number];

const base = {
  id: z.string().min(1),
  nome: z.string(),
  email: z.string(),
  // Credencial simulada: o localStorage não protege nada (ver README).
  senha: z.string(),
  fotoPerfil: z.string().nullable(),
  dataCriacao: z.string(),
};

export const esquemaCliente = z.object({
  ...base,
  tipo: z.literal("cliente"),
  areasInteresse: z.array(z.string()),
  grauAcademico: z.string().nullable(),
  bolsasFavoritas: z.array(z.string()),
  bolsasAssociadas: z.array(z.string()),
  mentorias: z.array(z.string()),
});

export const esquemaMentor = z.object({
  ...base,
  tipo: z.literal("mentor"),
  ativo: z.boolean(),
  clientesOrientados: z.array(z.string()),
});

export const esquemaAdmin = z.object({
  ...base,
  tipo: z.literal("admin"),
});

export const esquemaUtilizador = z.discriminatedUnion("tipo", [esquemaCliente, esquemaMentor, esquemaAdmin]);

export type UtilizadorCliente = z.infer<typeof esquemaCliente>;
export type UtilizadorMentor = z.infer<typeof esquemaMentor>;
export type UtilizadorAdmin = z.infer<typeof esquemaAdmin>;
export type Utilizador = z.infer<typeof esquemaUtilizador>;

export const ESTADOS_MENTORIA = [
  "aguardando_pagamento",
  "pagamento_pendente_validacao",
  "pago",
  "mentor_atribuido",
  "em_andamento",
  "concluida",
] as const;
export type EstadoMentoria = (typeof ESTADOS_MENTORIA)[number];

export const esquemaMentoria = z.object({
  id: z.string().min(1),
  clienteId: z.string(),
  mentorId: z.string().nullable(),
  planoId: z.string(),
  bolsaId: z.string().nullable(),
  estado: z.enum(ESTADOS_MENTORIA),
  pagamentoId: z.string().nullable(),
  dataCriacao: z.string(),
  dataActualizacao: z.string(),
});
export type Mentoria = z.infer<typeof esquemaMentoria>;

export const METODOS_PAGAMENTO = ["multicaixa_express", "transferencia"] as const;
export type MetodoPagamento = (typeof METODOS_PAGAMENTO)[number];
export const ESTADOS_PAGAMENTO = ["pendente", "validado", "rejeitado"] as const;
export type EstadoPagamento = (typeof ESTADOS_PAGAMENTO)[number];

export const esquemaPagamento = z.object({
  id: z.string().min(1),
  mentoriaId: z.string(),
  clienteId: z.string(),
  valor: z.number(),
  metodo: z.enum(METODOS_PAGAMENTO),
  referencia: z.string(),
  estado: z.enum(ESTADOS_PAGAMENTO),
  dataRegisto: z.string(),
  dataValidacao: z.string().nullable(),
});
export type Pagamento = z.infer<typeof esquemaPagamento>;

export const esquemaBolsa = z.object({
  id: z.string().min(1),
  titulo: z.string(),
  entidade: z.string(),
  pais: z.string(),
  tipo: z.enum(["interna", "externa"]),
  nivel: z.string(),
  area: z.string(),
  prazo: z.string(),
  resumo: z.string(),
  descricao: z.string(),
  requisitos: z.array(z.string()),
  documentos: z.array(z.string()),
  beneficios: z.array(z.string()),
  instrucoes: z.array(z.string()),
});

export const esquemaSessao = z.object({
  utilizadorId: z.string(),
  inicio: z.string(),
});
export type Sessao = z.infer<typeof esquemaSessao>;

export type BaseDados = {
  utilizadores: Utilizador[];
  bolsas: z.infer<typeof esquemaBolsa>[];
  mentorias: Mentoria[];
  pagamentos: Pagamento[];
  sessao: Sessao | null;
};
