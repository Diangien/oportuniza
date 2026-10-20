import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { BolsaCard } from "@/components/BolsaCard";
import { bolsas } from "@/lib/mock";
import estudante from "@/assets/estudante.jpg";

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
      <section className="mx-auto max-w-6xl px-5 py-14 md:py-20">
        <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_340px] md:gap-12 lg:grid-cols-[minmax(0,1fr)_430px] lg:gap-14">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-primary">Para estudantes angolanos</p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
              A sua próxima bolsa de estudo, <em className="text-primary">em Angola ou no mundo.</em>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Descubra bolsas internas e externas num só lugar e conte com mentores para preparar uma candidatura vencedora.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/bolsas" className="rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">Ver bolsas</Link>
              <Link to="/mentorias" className="rounded-full border border-border px-6 py-3 font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">Mentorias</Link>
            </div>
          </div>
          <img
            src={estudante}
            alt="Estudante angolana com um caderno, à espera junto à janela"
            width={912}
            height={1200}
            fetchPriority="high"
            className="mx-auto aspect-[4/5] w-full max-w-[360px] rounded-tl-[5rem] rounded-tr-xl rounded-br-[5rem] rounded-bl-xl object-cover object-top shadow-[var(--shadow-card)] transition-transform duration-500 ease-out motion-reduce:transition-none md:max-w-none md:motion-safe:hover:scale-[1.015]"
          />
        </div>
        <div className="mt-12 grid max-w-xl grid-cols-3 gap-4 border-t border-border pt-6 sm:gap-6 md:mt-14">
          {[["120+", "Bolsas"], ["18", "Países"], ["900+", "Estudantes"]].map(([n, l]) => (
            <div key={l}><div className="font-display text-3xl font-semibold">{n}</div><div className="text-sm text-muted-foreground">{l}</div></div>
          ))}
        </div>
      </section>
      <section className="border-y border-border bg-muted py-16">
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
