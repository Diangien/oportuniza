import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { Bolsa } from "@/lib/mock";

export function EtiquetaBolsa({ b }: { b: Bolsa }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${b.tipo === "interna" ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"}`}>
      {b.tipo === "interna" ? "Interna" : "Externa"} · {b.pais}
    </span>
  );
}

// `accoes` substitui os botões por omissão (usado na área do cliente).
export function BolsaCard({ b, accoes }: { b: Bolsa; accoes?: ReactNode }) {
  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-card">
      <div className="flex items-center justify-between text-xs">
        <EtiquetaBolsa b={b} />
        <span className="text-muted-foreground">Prazo: {b.prazo}</span>
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold">{b.titulo}</h3>
      <p className="text-sm text-muted-foreground">{b.entidade} · {b.nivel}</p>
      <p className="mt-3 flex-1 text-sm">{b.resumo}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {accoes ?? (
          <>
            <Button asChild>
              <Link to="/bolsas/$id" params={{ id: b.id }}>Ver detalhes</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/mentorias">Pedir mentoria</Link>
            </Button>
          </>
        )}
      </div>
    </article>
  );
}
