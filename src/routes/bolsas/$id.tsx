import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, FileText, Heart, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { EtiquetaBolsa } from "@/components/BolsaCard";
import { Button } from "@/components/ui/button";
import { useFavoritos } from "@/hooks/use-favoritos";
import { bolsas } from "@/lib/mock";

export const Route = createFileRoute("/bolsas/$id")({
  loader: ({ params }) => {
    const bolsa = bolsas.find((b) => b.id === params.id);
    if (!bolsa) throw notFound();
    return bolsa;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.titulo} — BolsaAngola` },
          { name: "description", content: loaderData.descricao },
          { property: "og:title", content: `${loaderData.titulo} — BolsaAngola` },
          { property: "og:description", content: loaderData.resumo },
        ]
      : [{ title: "Bolsa não encontrada — BolsaAngola" }],
  }),
  component: DetalheBolsa,
  notFoundComponent: BolsaNaoEncontrada,
});

function DetalheBolsa() {
  const b = Route.useLoaderData();
  const { eFavorita, alterna, precisaSessao, temSessao } = useFavoritos();
  const navigate = useNavigate();
  const favorita = eFavorita(b.id);

  // Os favoritos ficam na conta do cliente: sem sessão, vai ao login e volta.
  const alternaFavorita = () => {
    if (temSessao && precisaSessao) {
      toast.info("Os favoritos estão disponíveis para contas de cliente.");
    } else if (precisaSessao) {
      toast.info("Inicie sessão para guardar bolsas nos favoritos.");
      void navigate({ to: "/login", search: { redirect: `/bolsas/${b.id}` } });
    } else {
      toast.success(alterna(b.id) ? "Bolsa adicionada aos favoritos." : "Bolsa removida dos favoritos.");
    }
  };

  const resumo = [
    ["Tipo", b.tipo === "interna" ? "Interna" : "Externa"],
    ["País", b.pais],
    ["Nível", b.nivel],
    ["Área", b.area],
    ["Entidade", b.entidade],
  ];

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-12">
        <Link
          to="/bolsas"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar às bolsas
        </Link>

        <header className="mt-6 max-w-3xl">
          <EtiquetaBolsa b={b} />
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-5xl">{b.titulo}</h1>
          <p className="mt-2 text-muted-foreground">
            {b.entidade} · {b.nivel}
          </p>
          <p className="mt-6 text-lg leading-relaxed">{b.descricao}</p>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="space-y-8">
            <Seccao titulo="Requisitos de elegibilidade">
              <Lista itens={b.requisitos} icone={Check} />
            </Seccao>
            <Seccao titulo="Documentos necessários">
              <Lista itens={b.documentos} icone={FileText} />
            </Seccao>
            <Seccao titulo="Benefícios">
              <Lista itens={b.beneficios} icone={Check} />
            </Seccao>
            <Seccao titulo="Como se candidatar">
              <ol className="space-y-4 text-sm">
                {b.instrucoes.map((passo, i) => (
                  <li key={passo} className="flex gap-3">
                    <span className="font-display text-primary">{String(i + 1).padStart(2, "0")}</span>
                    <span>{passo}</span>
                  </li>
                ))}
              </ol>
            </Seccao>
          </div>

          <aside className="rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-24">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Prazo de candidatura</p>
            <p className="mt-2 font-display text-3xl font-semibold text-primary">{b.prazo}</p>
            <dl className="mt-6 space-y-4 border-t border-border pt-6 text-sm">
              {resumo.map(([termo, valor]) => (
                <div key={termo} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{termo}</dt>
                  <dd className="text-right font-medium">{valor}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        <section className="mt-12 flex flex-col gap-6 rounded-3xl bg-muted p-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-md">
            <h2 className="font-display text-2xl font-semibold">Quer ajuda com esta candidatura?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Guarde a bolsa para não perder o prazo ou peça apoio a um mentor que já passou pelo mesmo processo.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="lg"
              aria-pressed={favorita}
              onClick={alternaFavorita}
              className="bg-card hover:border-primary/40 hover:bg-card"
            >
              <Heart className={favorita ? "fill-primary text-primary" : undefined} />
              {favorita ? "Guardada nos favoritos" : "Adicionar aos favoritos"}
            </Button>
            <Button asChild size="lg">
              {/* Sem sessão, a área do cliente manda para o login e volta aqui. */}
              <Link to="/cliente/mentorias" search={{ bolsa: b.id }}>
                Receber mentoria
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}

function Seccao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl font-semibold">{titulo}</h2>
      <div className="mt-4 rounded-2xl border border-border bg-card p-6">{children}</div>
    </section>
  );
}

function Lista({ itens, icone: Icone }: { itens: string[]; icone: LucideIcon }) {
  return (
    <ul className="space-y-3 text-sm">
      {itens.map((item) => (
        <li key={item} className="flex gap-3">
          <Icone aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function BolsaNaoEncontrada() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-md px-5 py-24 text-center">
        <h1 className="font-display text-4xl font-semibold">Bolsa não encontrada</h1>
        <p className="mt-2 text-muted-foreground">Esta bolsa pode ter sido removida ou o endereço está incorrecto.</p>
        <Button asChild className="mt-8">
          <Link to="/bolsas">Ver todas as bolsas</Link>
        </Button>
      </main>
    </div>
  );
}
