import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { BolsaCard } from "@/components/BolsaCard";
import { Input } from "@/components/ui/input";
import { bolsas } from "@/lib/mock";

export const Route = createFileRoute("/bolsas")({
  head: () => ({
    meta: [
      { title: "Bolsas de estudo — BolsaAngola" },
      { name: "description", content: "Lista de bolsas de estudo internas e externas para angolanos." },
      { property: "og:title", content: "Bolsas de estudo — BolsaAngola" },
      { property: "og:description", content: "Bolsas internas e externas para angolanos." },
    ],
  }),
  component: Bolsas,
});

function Bolsas() {
  const [tipo, setTipo] = useState<"todas" | "interna" | "externa">("todas");
  const [q, setQ] = useState("");
  const lista = bolsas.filter(
    (b) => (tipo === "todas" || b.tipo === tipo) && (b.titulo + b.entidade + b.pais).toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-12">
        <h1 className="font-display text-4xl font-semibold">Bolsas de estudo</h1>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {(["todas", "interna", "externa"] as const).map((t) => (
            <button key={t} onClick={() => setTipo(t)} aria-pressed={tipo === t}
              className={`rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                tipo === t
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}>
              {t === "todas" ? "Todas" : t === "interna" ? "Internas" : "Externas"}
            </button>
          ))}
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar..."
            className="ml-auto rounded-full py-2 md:w-64" />
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {lista.map((b) => <BolsaCard key={b.id} b={b} />)}
        </div>
      </main>
    </div>
  );
}
