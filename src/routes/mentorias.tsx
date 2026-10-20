import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { mentorias } from "@/lib/mock";

export const Route = createFileRoute("/mentorias")({
  head: () => ({
    meta: [
      { title: "Mentorias pagas — BolsaAngola" },
      { name: "description", content: "Mentorias para preparar a sua candidatura a bolsas de estudo. Pagamento por Multicaixa ou transferência." },
      { property: "og:title", content: "Mentorias pagas — BolsaAngola" },
      { property: "og:description", content: "Prepare a sua candidatura com mentores experientes." },
    ],
  }),
  component: Mentorias,
});

function Mentorias() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-12">
        <h1 className="font-display text-4xl font-semibold">Mentorias</h1>
        <p className="mt-2 text-muted-foreground">Pagamento por Multicaixa Express ou transferência bancária.</p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {mentorias.map((m) => (
            <article key={m.id} className="flex flex-col rounded-2xl border border-border bg-card p-6">
              <h3 className="font-display text-xl font-semibold">{m.titulo}</h3>
              <p className="text-sm text-muted-foreground">{m.duracao}</p>
              <p className="mt-3 flex-1 text-sm">{m.descricao}</p>
              <div className="mt-5 font-display text-3xl font-semibold text-primary">{m.preco}</div>
              <Button className="mt-4">Reservar</Button>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
