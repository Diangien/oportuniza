import type { EstadoMentoria, EstadoPagamento, MetodoPagamento, TipoUtilizador } from "@/lib/dados/modelos";

export const GRAUS = ["Licenciatura", "Mestrado", "Doutoramento", "Phd", "Ensino Médio"];

export const AREAS = [
  "Tecnologia",
  "Engenharia",
  "Saúde",
  "Gestão",
  "Educação",
  "Direito",
  "Ciências Sociais",
  "Ambiente",
  "Artes",
  "Ciências Exactas",
];

export const ROTA_POR_TIPO = {
  admin: "/admin",
  mentor: "/mentor",
  cliente: "/cliente",
} as const satisfies Record<TipoUtilizador, string>;

export const NOME_TIPO: Record<TipoUtilizador, string> = {
  admin: "Administrador",
  mentor: "Mentor",
  cliente: "Cliente",
};

// Mesma família de etiquetas do BolsaCard (rounded-full, text-xs).
export const ETIQUETA_TIPO: Record<TipoUtilizador, string> = {
  admin: "bg-foreground text-background",
  mentor: "bg-accent text-accent-foreground",
  cliente: "bg-secondary text-secondary-foreground",
};

export const ESTADOS_MENTORIA: Record<EstadoMentoria, { rotulo: string; classe: string; descricao: string }> = {
  aguardando_pagamento: {
    rotulo: "Aguarda pagamento",
    classe: "bg-accent text-accent-foreground",
    descricao: "Registe o pagamento para avançar.",
  },
  pagamento_pendente_validacao: {
    rotulo: "Pagamento em validação",
    classe: "bg-secondary text-secondary-foreground",
    descricao: "A equipa está a confirmar o pagamento.",
  },
  pago: {
    rotulo: "Pago · aguarda mentor",
    classe: "bg-secondary text-secondary-foreground",
    descricao: "Pagamento confirmado. A aguardar um mentor disponível.",
  },
  mentor_atribuido: {
    rotulo: "Mentor atribuído",
    classe: "bg-primary/10 text-primary",
    descricao: "O mentor vai contactá-lo para começar.",
  },
  em_andamento: {
    rotulo: "Em andamento",
    classe: "bg-primary text-primary-foreground",
    descricao: "A mentoria está a decorrer.",
  },
  concluida: {
    rotulo: "Concluída",
    classe: "border border-border bg-muted text-muted-foreground",
    descricao: "Mentoria terminada.",
  },
};

export const ESTADOS_PAGAMENTO: Record<EstadoPagamento, { rotulo: string; classe: string }> = {
  pendente: { rotulo: "Por validar", classe: "bg-accent text-accent-foreground" },
  validado: { rotulo: "Validado", classe: "bg-primary/10 text-primary" },
  rejeitado: { rotulo: "Rejeitado", classe: "bg-destructive/10 text-destructive" },
};

export const METODOS_PAGAMENTO: Record<MetodoPagamento, string> = {
  multicaixa_express: "Multicaixa Express",
  transferencia: "Transferência bancária",
};
