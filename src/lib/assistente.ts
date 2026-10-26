// Conteúdo do assistente virtual (ver src/components/AssistenteChat.tsx).
// Só dados: as respostas são fixas e aprovadas, não há IA nem servidor.

export type Bloco =
  | { tipo: "paragrafo"; texto: string }
  | { tipo: "lista"; itens: { titulo: string; texto: string }[] };

export interface Accao {
  texto: string;
  para: "/mentorias" | "/registo";
}

export interface Pergunta {
  id: string;
  pergunta: string;
  resposta: Bloco[];
  accao?: Accao;
}

export const BOAS_VINDAS = {
  titulo: "Olá! Sou o assistente da BolsaAngola.",
  mensagem:
    "Queres estudar em Angola ou no estrangeiro? Estou aqui para te ajudar a encontrar bolsas e oportunidades académicas.",
  auxiliar: "Escolhe uma pergunta para começar:",
};

export const PERGUNTAS: Pergunta[] = [
  {
    id: "bolsa-perfil",
    pergunta: "Como posso encontrar uma bolsa de estudo adequada ao meu perfil?",
    resposta: [
      {
        tipo: "paragrafo",
        texto:
          "Queremos ajudar-te a encontrar bolsas de estudo que correspondam aos teus interesses e objetivos académicos!",
      },
      {
        tipo: "paragrafo",
        texto:
          "Para teres uma experiência mais personalizada, recomendamos que cries uma conta na BolsaAngola. Depois do registo, poderás selecionar as tuas áreas de interesse e os tipos de bolsas que gostarias de encontrar.",
      },
      {
        tipo: "paragrafo",
        texto:
          "Assim, poderás explorar oportunidades mais alinhadas com aquilo que procuras e tornar a tua pesquisa mais simples.",
      },
      {
        tipo: "paragrafo",
        texto:
          "Ainda não tens uma conta? Regista-te e começa a descobrir oportunidades para o teu futuro académico! 🎓",
      },
    ],
    accao: { texto: "Criar conta", para: "/registo" },
  },
  {
    id: "mentorias",
    pergunta: "Como funcionam as mentorias e quanto custam?",
    resposta: [
      {
        tipo: "paragrafo",
        texto:
          "Na BolsaAngola, temos três modalidades de mentoria para te ajudar na tua candidatura a uma bolsa de estudo:",
      },
      {
        tipo: "lista",
        itens: [
          {
            titulo: "Elaboração de carta de motivação",
            texto: "ajudamos-te a preparar uma carta que apresente as tuas motivações e os teus objetivos académicos.",
          },
          {
            titulo: "Mentoria completa",
            texto: "acompanhamos-te na preparação de todos os documentos necessários para a candidatura.",
          },
          {
            titulo: "Preparação para entrevistas",
            texto: "ajudamos-te a preparar e a ganhar confiança para uma entrevista relacionada com uma bolsa de estudo.",
          },
        ],
      },
      {
        tipo: "paragrafo",
        texto:
          "Queres saber quanto custa cada modalidade? Basta acederes à secção Mentoria, no menu de navegação do site, onde encontrarás os preços.",
      },
      {
        tipo: "paragrafo",
        texto:
          "Depois de efetuares o pagamento, serás associado a um dos nossos mentores verificados, que ficará responsável por te acompanhar durante o serviço contratado.",
      },
      {
        tipo: "paragrafo",
        texto: "Estamos aqui para te ajudar a dar o próximo passo rumo ao teu futuro académico! 😊",
      },
    ],
    accao: { texto: "Ver mentorias e preços", para: "/mentorias" },
  },
];

// As áreas privadas têm o seu próprio painel; o assistente é só para as páginas públicas.
const AREAS_PRIVADAS = ["/admin", "/cliente", "/mentor"];

export function mostraAssistente(caminho: string): boolean {
  return !AREAS_PRIVADAS.some((area) => caminho === area || caminho.startsWith(`${area}/`));
}
