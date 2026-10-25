export type Bolsa = {
  id: string;
  titulo: string;
  entidade: string;
  pais: string;
  tipo: "interna" | "externa";
  nivel: string;
  area: string;
  prazo: string;
  resumo: string;
  descricao: string;
  requisitos: string[];
  documentos: string[];
  beneficios: string[];
  instrucoes: string[];
};

export const bolsas: Bolsa[] = [
  {
    id: "1",
    titulo: "Mestrado no Exterior",
    entidade: "INAGBE",
    pais: "Portugal",
    tipo: "externa",
    nivel: "Mestrado",
    area: "Todas as áreas",
    prazo: "15 Dez 2026",
    resumo: "Propinas, subsídio mensal e passagem aérea.",
    descricao:
      "Programa do Instituto Nacional de Gestão de Bolsas de Estudo para licenciados angolanos que pretendem fazer o mestrado numa universidade portuguesa reconhecida.",
    requisitos: [
      "Nacionalidade angolana",
      "Licenciatura concluída com média final igual ou superior a 14 valores",
      "Idade máxima de 35 anos à data da candidatura",
      "Carta de aceitação, ou pedido de admissão em curso, numa universidade portuguesa",
    ],
    documentos: [
      "Bilhete de identidade e passaporte válidos",
      "Certificado de licenciatura com notas",
      "Carta de motivação",
      "Duas cartas de recomendação",
      "Atestado médico",
    ],
    beneficios: [
      "Pagamento integral das propinas",
      "Subsídio mensal de manutenção",
      "Passagem aérea de ida e regresso",
      "Seguro de saúde",
    ],
    instrucoes: [
      "Crie a sua conta no portal do INAGBE",
      "Preencha o formulário de candidatura online",
      "Carregue os documentos digitalizados em PDF",
      "Aguarde a publicação da lista de seleccionados no portal",
    ],
  },
  {
    id: "2",
    titulo: "Licenciatura Interna",
    entidade: "INAGBE",
    pais: "Angola",
    tipo: "interna",
    nivel: "Licenciatura",
    area: "Todas as áreas",
    prazo: "30 Nov 2026",
    resumo: "Subsídio mensal e apoio a propinas em IES angolanas.",
    descricao:
      "Bolsa para estudantes que frequentam ou vão ingressar numa instituição de ensino superior angolana, pública ou privada.",
    requisitos: [
      "Nacionalidade angolana",
      "Matrícula numa instituição de ensino superior angolana",
      "Média do ensino médio, ou do ano anterior, igual ou superior a 12 valores",
    ],
    documentos: [
      "Bilhete de identidade",
      "Comprovativo de matrícula",
      "Certificado do ensino médio ou declaração de notas",
      "Declaração de rendimentos do agregado familiar",
    ],
    beneficios: ["Subsídio mensal", "Apoio no pagamento de propinas", "Apoio para material didáctico"],
    instrucoes: [
      "Registe-se no portal do INAGBE",
      "Seleccione a modalidade de bolsa interna",
      "Submeta os documentos pedidos",
      "Acompanhe o estado da candidatura no portal",
    ],
  },
  {
    id: "3",
    titulo: "Chevening Scholarship",
    entidade: "Governo do Reino Unido",
    pais: "Reino Unido",
    tipo: "externa",
    nivel: "Mestrado",
    area: "Todas as áreas",
    prazo: "05 Nov 2026",
    resumo: "Mestrado de um ano totalmente financiado.",
    descricao:
      "Programa de bolsas do Governo britânico para futuros líderes, com um mestrado de um ano numa universidade do Reino Unido e uma rede global de antigos bolseiros.",
    requisitos: [
      "Licenciatura concluída",
      "Pelo menos dois anos de experiência profissional",
      "Compromisso de regressar a Angola durante dois anos após o curso",
      "Candidatura a três cursos elegíveis no Reino Unido",
    ],
    documentos: [
      "Passaporte válido",
      "Certificado e notas da licenciatura",
      "Quatro ensaios: liderança, networking, escolha de cursos e plano de carreira",
      "Duas cartas de referência",
    ],
    beneficios: [
      "Propinas integrais",
      "Subsídio mensal de manutenção",
      "Passagens aéreas de ida e regresso",
      "Subsídio de chegada e de partida",
    ],
    instrucoes: [
      "Confirme a elegibilidade no site oficial do Chevening",
      "Escolha três cursos de mestrado elegíveis",
      "Escreva e submeta os quatro ensaios online",
      "Se for pré-seleccionado, prepare-se para a entrevista na embaixada",
    ],
  },
  {
    id: "4",
    titulo: "Bolsa de Excelência",
    entidade: "Sonangol",
    pais: "Angola",
    tipo: "interna",
    nivel: "Licenciatura",
    area: "Engenharia e Geociências",
    prazo: "20 Jan 2027",
    resumo: "Propinas, estágio e possibilidade de emprego.",
    descricao:
      "Bolsa para os melhores estudantes de cursos ligados ao sector petrolífero, com estágio na empresa durante o curso.",
    requisitos: [
      "Nacionalidade angolana",
      "Matrícula em Engenharia de Petróleos, Química, Mecânica ou Geologia",
      "Média igual ou superior a 15 valores",
      "Idade máxima de 25 anos",
    ],
    documentos: [
      "Bilhete de identidade",
      "Declaração de matrícula",
      "Declaração de notas actualizada",
      "Carta de motivação",
    ],
    beneficios: [
      "Pagamento das propinas",
      "Estágio remunerado nas férias",
      "Possibilidade de contratação no fim do curso",
    ],
    instrucoes: [
      "Aceda à página de bolsas da Sonangol",
      "Preencha o formulário e anexe os documentos",
      "Realize a prova de conhecimentos para os pré-seleccionados",
      "Participe na entrevista final",
    ],
  },
  {
    id: "5",
    titulo: "MasterCard Scholars",
    entidade: "MasterCard Foundation",
    pais: "Vários",
    tipo: "externa",
    nivel: "Licenciatura",
    area: "Todas as áreas",
    prazo: "01 Fev 2027",
    resumo: "Bolsa integral com mentoria e rede de alumni.",
    descricao:
      "Programa para jovens africanos com talento académico e poucos recursos, em universidades parceiras em África e noutros continentes.",
    requisitos: [
      "Nacionalidade de um país africano",
      "Excelente aproveitamento no ensino médio",
      "Comprovada necessidade financeira",
      "Envolvimento em actividades comunitárias ou de liderança",
    ],
    documentos: [
      "Passaporte",
      "Certificado do ensino médio",
      "Comprovativo de rendimentos da família",
      "Ensaio pessoal",
      "Cartas de recomendação",
    ],
    beneficios: [
      "Propinas, alojamento e alimentação",
      "Passagens aéreas e material de estudo",
      "Mentoria e programas de liderança",
      "Acesso à rede de alumni",
    ],
    instrucoes: [
      "Escolha uma universidade parceira do programa",
      "Candidate-se ao curso e à bolsa no portal da universidade",
      "Submeta o ensaio e as cartas de recomendação",
      "Aguarde o contacto para a entrevista",
    ],
  },
  {
    id: "6",
    titulo: "PEC-PG Doutoramento",
    entidade: "CAPES",
    pais: "Brasil",
    tipo: "externa",
    nivel: "Doutoramento",
    area: "Todas as áreas",
    prazo: "01 Dez 2026",
    resumo: "Subsídio mensal e isenção de propinas.",
    descricao:
      "Programa de cooperação do Governo brasileiro para doutoramentos em universidades públicas brasileiras, destinado a países em desenvolvimento.",
    requisitos: [
      "Mestrado concluído",
      "Aceitação num programa de doutoramento brasileiro",
      "Proficiência em língua portuguesa",
      "Compromisso de regressar a Angola após o doutoramento",
    ],
    documentos: [
      "Passaporte",
      "Diploma e notas do mestrado",
      "Carta de aceitação da universidade",
      "Projecto de investigação",
      "Curriculum vitae",
    ],
    beneficios: ["Subsídio mensal", "Isenção de propinas", "Passagem aérea de regresso"],
    instrucoes: [
      "Obtenha a carta de aceitação num programa de doutoramento",
      "Submeta a candidatura na plataforma da CAPES",
      "Entregue os documentos na embaixada do Brasil em Luanda",
      "Aguarde o resultado da selecção",
    ],
  },
];

export type PlanoMentoria = {
  id: string;
  titulo: string;
  preco: string;
  valor: number;
  duracao: string;
  descricao: string;
};

export const mentorias: PlanoMentoria[] = [
  { id: "m1", titulo: "Revisão de Carta de Motivação", preco: "15.000 Kz", valor: 15000, duracao: "Entrega em 3 dias", descricao: "Feedback detalhado para destacar a sua candidatura." },
  { id: "m2", titulo: "Mentoria Completa", preco: "60.000 Kz", valor: 60000, duracao: "4 sessões de 1h", descricao: "Do início ao fim: escolha, documentos, cartas e entrevista." },
  { id: "m3", titulo: "Preparação para Entrevista", preco: "25.000 Kz", valor: 25000, duracao: "1 sessão de 1h30", descricao: "Simulação real com plano de melhoria." },
];
