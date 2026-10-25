import { createFileRoute, Link } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import ilustracao from "@/assets/termos.svg";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos e condições — BolsaAngola" },
      { name: "description", content: "Termos de utilização e política de privacidade da plataforma BolsaAngola (versão provisória)." },
      { property: "og:title", content: "Termos e condições — BolsaAngola" },
      { property: "og:description", content: "Termos de utilização e política de privacidade do BolsaAngola." },
    ],
  }),
  component: Termos,
});

// Texto genérico e provisório. Tudo o que depende de decisões da entidade
// responsável fica marcado com [ESPECIFICAR: ...] até à revisão jurídica.
const SECCOES = [
  {
    id: "objecto",
    titulo: "Objecto e entidade responsável",
    paragrafos: [
      "Estes termos regulam o acesso e a utilização da plataforma BolsaAngola, que divulga bolsas de estudo nacionais e internacionais e disponibiliza serviços de mentoria para apoio a candidaturas.",
      "A plataforma é gerida por [ESPECIFICAR: nome e identificação da entidade responsável pela plataforma].",
    ],
  },
  {
    id: "utilizacao",
    titulo: "Utilização da plataforma",
    paragrafos: [
      "A consulta das bolsas publicadas pode ser feita sem conta. Funcionalidades como guardar bolsas, acompanhar candidaturas ou pedir mentoria exigem o registo de uma conta.",
      "A informação sobre cada bolsa é recolhida de fontes externas, como as entidades que as atribuem. Prazos, requisitos e benefícios podem mudar sem aviso, pelo que o utilizador deve confirmar sempre os dados na fonte oficial antes de se candidatar.",
      "A plataforma não atribui bolsas nem decide sobre candidaturas, que são da exclusiva responsabilidade das entidades que as oferecem.",
    ],
  },
  {
    id: "responsabilidades",
    titulo: "Responsabilidades do utilizador",
    paragrafos: [
      "O utilizador compromete-se a fornecer informação verdadeira e actualizada no registo e a mantê-la correcta.",
      "A palavra-passe é pessoal. O utilizador é responsável por mantê-la em segurança e pela actividade realizada na sua conta.",
      "Não é permitido utilizar a plataforma para fins ilícitos, publicar conteúdo ofensivo, falso ou que viole direitos de terceiros, nem tentar aceder a áreas ou dados sem autorização.",
      "O incumprimento destas regras pode levar à suspensão ou ao encerramento da conta, nos termos a definir em [ESPECIFICAR: procedimento de suspensão e encerramento de contas].",
    ],
  },
  {
    id: "privacidade",
    titulo: "Privacidade e dados pessoais",
    paragrafos: [
      "Os dados pessoais devem ser tratados apenas na medida necessária ao funcionamento da plataforma e com respeito pela privacidade de cada utilizador.",
      "Dados recolhidos, finalidades do tratamento e prazos de conservação: [ESPECIFICAR: dados recolhidos, finalidades e prazos de conservação].",
      "Direitos dos titulares dos dados e forma de os exercer: [ESPECIFICAR: direitos dos titulares e procedimento para os exercer].",
      "Legislação de protecção de dados aplicável: [ESPECIFICAR: legislação de protecção de dados aplicável].",
    ],
  },
  {
    id: "mentorias",
    titulo: "Mentorias e pagamentos",
    paragrafos: [
      "As mentorias são serviços pagos, prestados por mentores associados à plataforma depois da confirmação do pagamento.",
      "Condições de pagamento, cancelamento e reembolso: [ESPECIFICAR: condições de pagamento, cancelamento e reembolso].",
    ],
  },
  {
    id: "alteracoes",
    titulo: "Alterações aos termos",
    paragrafos: [
      "Estes termos podem ser revistos. A data da última actualização é indicada no topo desta página, e as alterações relevantes devem ser comunicadas aos utilizadores através de [ESPECIFICAR: meio de comunicação das alterações].",
    ],
  },
  {
    id: "aceitacao",
    titulo: "Aceitação dos termos",
    paragrafos: [
      "Ao criar uma conta e marcar a caixa de aceitação no formulário de registo, o utilizador declara que leu e aceita estes termos e a política de privacidade.",
      "Quem não concordar com os termos não deve criar conta nem utilizar as funcionalidades que a exigem.",
    ],
  },
  {
    id: "lei-contactos",
    titulo: "Lei aplicável e contactos",
    paragrafos: [
      "Lei aplicável e foro competente: [ESPECIFICAR: lei aplicável e foro competente].",
      "Questões sobre estes termos: [ESPECIFICAR: contacto para questões sobre os termos e a privacidade].",
    ],
  },
];

// Destaca os marcadores [ESPECIFICAR: ...] para não passarem despercebidos.
function comMarcadores(texto: string) {
  return texto.split(/(\[ESPECIFICAR:[^\]]*\])/).map((parte, i) =>
    parte.startsWith("[ESPECIFICAR:") ? (
      <mark key={i} className="rounded bg-accent/50 px-1 text-accent-foreground">
        {parte}
      </mark>
    ) : (
      parte
    ),
  );
}

function Termos() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-12">
        <header className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-primary">BolsaAngola</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-5xl">Termos e condições</h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Termos de utilização e política de privacidade da plataforma.
            </p>
            <div role="note" className="mt-6 flex max-w-xl gap-3 rounded-2xl border border-accent bg-accent/20 p-4 text-sm">
              <TriangleAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-accent-foreground" />
              <p>
                <strong className="font-semibold">Versão provisória, sujeita a revisão jurídica.</strong> Este texto é
                genérico e não garante conformidade legal.
              </p>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Última actualização: {comMarcadores("[ESPECIFICAR: data da última actualização]")}
            </p>
          </div>
          <img
            src={ilustracao}
            alt="Ilustração de um documento de termos com uma marca de verificação"
            width={320}
            height={360}
            className="mx-auto w-full max-w-[260px]"
          />
        </header>

        <div className="mt-14 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
          <nav aria-label="Secções dos termos" className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Nesta página</p>
            <ol className="mt-4 space-y-2 text-sm">
              {SECCOES.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="flex gap-2 text-muted-foreground transition-colors hover:text-foreground">
                    <span className="font-display text-primary">{String(i + 1).padStart(2, "0")}</span>
                    {s.titulo}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="max-w-3xl space-y-10">
            {SECCOES.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="font-display text-2xl font-semibold">
                  <span className="mr-2 text-primary">{String(i + 1).padStart(2, "0")}</span>
                  {s.titulo}
                </h2>
                <div className="mt-4 space-y-3 leading-relaxed text-muted-foreground">
                  {s.paragrafos.map((p) => (
                    <p key={p}>{comMarcadores(p)}</p>
                  ))}
                </div>
              </section>
            ))}

            <div className="border-t border-border pt-8">
              <Button asChild variant="outline">
                <Link to="/registo">Voltar ao registo</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
