import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { BolsaCard } from "@/components/BolsaCard";
import { bolsas } from "@/lib/mock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BolsaAngola — Bolsas de estudo e mentorias" },
      { name: "description", content: "Encontre bolsas de estudo internas e externas para angolanos e receba mentoria na sua candidatura." },
      { property: "og:title", content: "BolsaAngola — Bolsas de estudo e mentorias" },
      { property: "og:description", content: "Bolsas internas e externas para angolanos, com mentoria paga." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-5 py-20">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">Para estudantes angolanos</p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl font-semibold leading-tight md:text-6xl">
          A sua próxima bolsa de estudo, <em className="text-primary">em Angola ou no mundo.</em>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Descubra bolsas internas e externas num só lugar e conte com mentores para preparar uma candidatura vencedora.
        </p>
        <div className="mt-8 flex gap-3">
          <Link to="/bolsas" className="rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground">Ver bolsas</Link>
          <Link to="/mentorias" className="rounded-full border border-border px-6 py-3 font-medium">Mentorias</Link>
        </div>
        <div className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-6">
          {[["120+", "Bolsas"], ["18", "Países"], ["900+", "Estudantes"]].map(([n, l]) => (
            <div key={l}><div className="font-display text-3xl font-semibold">{n}</div><div className="text-sm text-muted-foreground">{l}</div></div>
          ))}
        </div>
      </section>
      <section className="bg-muted py-16">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="font-display text-3xl font-semibold">Bolsas em destaque</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {bolsas.slice(0, 3).map((b) => <BolsaCard key={b.id} b={b} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
