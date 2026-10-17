import type { Bolsa } from "@/lib/mock";

export function BolsaCard({ b }: { b: Bolsa }) {
  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between text-xs">
        <span className={`rounded-full px-3 py-1 font-medium ${b.tipo === "interna" ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"}`}>
          {b.tipo === "interna" ? "Interna" : "Externa"} · {b.pais}
        </span>
        <span className="text-muted-foreground">Prazo: {b.prazo}</span>
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold">{b.titulo}</h3>
      <p className="text-sm text-muted-foreground">{b.entidade} · {b.nivel}</p>
      <p className="mt-3 flex-1 text-sm">{b.resumo}</p>
      <div className="mt-5 flex gap-2">
        <button className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Candidatar</button>
        <button className="rounded-full border border-border px-4 py-2 text-sm">Pedir mentoria</button>
      </div>
    </article>
  );
}
