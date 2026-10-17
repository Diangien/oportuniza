export type Bolsa = {
  id: string;
  titulo: string;
  entidade: string;
  pais: string;
  tipo: "interna" | "externa";
  nivel: string;
  prazo: string;
  resumo: string;
};

export const bolsas: Bolsa[] = [
  { id: "1", titulo: "Mestrado no Exterior", entidade: "INAGBE", pais: "Portugal", tipo: "externa", nivel: "Mestrado", prazo: "15 Dez 2026", resumo: "Propinas, subsídio mensal e passagem aérea." },
  { id: "2", titulo: "Licenciatura Interna", entidade: "INAGBE", pais: "Angola", tipo: "interna", nivel: "Licenciatura", prazo: "30 Nov 2026", resumo: "Subsídio mensal e apoio a propinas em IES angolanas." },
  { id: "3", titulo: "Chevening Scholarship", entidade: "Governo do Reino Unido", pais: "Reino Unido", tipo: "externa", nivel: "Mestrado", prazo: "05 Nov 2026", resumo: "Mestrado de um ano totalmente financiado." },
  { id: "4", titulo: "Bolsa de Excelência", entidade: "Sonangol", pais: "Angola", tipo: "interna", nivel: "Licenciatura", prazo: "20 Jan 2027", resumo: "Propinas, estágio e possibilidade de emprego." },
  { id: "5", titulo: "MasterCard Scholars", entidade: "MasterCard Foundation", pais: "Vários", tipo: "externa", nivel: "Licenciatura", prazo: "01 Fev 2027", resumo: "Bolsa integral com mentoria e rede de alumni." },
  { id: "6", titulo: "PEC-PG Doutoramento", entidade: "CAPES", pais: "Brasil", tipo: "externa", nivel: "Doutoramento", prazo: "01 Dez 2026", resumo: "Subsídio mensal e isenção de propinas." },
];

export const mentorias = [
  { id: "m1", titulo: "Revisão de Carta de Motivação", preco: "15.000 Kz", duracao: "Entrega em 3 dias", descricao: "Feedback detalhado para destacar a sua candidatura." },
  { id: "m2", titulo: "Mentoria Completa", preco: "60.000 Kz", duracao: "4 sessões de 1h", descricao: "Do início ao fim: escolha, documentos, cartas e entrevista." },
  { id: "m3", titulo: "Preparação para Entrevista", preco: "25.000 Kz", duracao: "1 sessão de 1h30", descricao: "Simulação real com plano de melhoria." },
];
