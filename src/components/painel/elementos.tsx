import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { ESTADOS_MENTORIA, ESTADOS_PAGAMENTO, ETIQUETA_TIPO, NOME_TIPO } from "@/lib/catalogo";
import type { EstadoMentoria, EstadoPagamento, TipoUtilizador } from "@/lib/dados/modelos";
import { cn } from "@/lib/utils";

// Peças visuais repetidas nas dashboards, no estilo de docs/ESTILOS.md.

export function CabecalhoPagina({
  titulo,
  descricao,
  accao,
}: {
  titulo: string;
  descricao?: ReactNode;
  accao?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl font-semibold md:text-4xl">{titulo}</h1>
        {descricao && <p className="mt-2 text-muted-foreground">{descricao}</p>}
      </div>
      {accao && <div className="flex shrink-0 flex-wrap gap-3">{accao}</div>}
    </div>
  );
}

export function Indicador({ rotulo, valor, icone: Icone }: { rotulo: string; valor: ReactNode; icone: LucideIcon }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        {rotulo}
        <Icone aria-hidden className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-3 font-display text-3xl font-semibold">{valor}</p>
    </div>
  );
}

export function Cartao({ titulo, accao, children, className }: { titulo?: string; accao?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card p-6", className)}>
      {(titulo || accao) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {titulo && <h2 className="font-display text-xl font-semibold">{titulo}</h2>}
          {accao}
        </div>
      )}
      {children}
    </section>
  );
}

export function EstadoVazio({ icone: Icone, titulo, children }: { icone: LucideIcon; titulo: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-muted text-primary">
        <Icone aria-hidden className="h-5 w-5" />
      </span>
      <p className="mt-4 font-medium">{titulo}</p>
      {children && <div className="mt-2 max-w-sm text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}

const etiqueta = "inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium";

export const EtiquetaTipo = ({ tipo }: { tipo: TipoUtilizador }) => (
  <span className={cn(etiqueta, ETIQUETA_TIPO[tipo])}>{NOME_TIPO[tipo]}</span>
);

export const EtiquetaMentoria = ({ estado }: { estado: EstadoMentoria }) => (
  <span className={cn(etiqueta, ESTADOS_MENTORIA[estado].classe)}>{ESTADOS_MENTORIA[estado].rotulo}</span>
);

export const EtiquetaPagamento = ({ estado }: { estado: EstadoPagamento }) => (
  <span className={cn(etiqueta, ESTADOS_PAGAMENTO[estado].classe)}>{ESTADOS_PAGAMENTO[estado].rotulo}</span>
);

// Lista de pares termo/valor (detalhes de utilizador, resumo de bolsa…).
export function ListaDados({ itens }: { itens: [string, ReactNode][] }) {
  return (
    <dl className="divide-y divide-border text-sm">
      {itens.map(([termo, valor]) => (
        <div key={termo} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:justify-between sm:gap-6">
          <dt className="text-muted-foreground">{termo}</dt>
          <dd className="font-medium sm:text-right">{valor}</dd>
        </div>
      ))}
    </dl>
  );
}

// Botões de filtro (mesmo padrão da página de bolsas).
export function Filtros<T extends string>({
  opcoes,
  valor,
  onChange,
}: {
  opcoes: { valor: T; rotulo: string }[];
  valor: T;
  onChange: (valor: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {opcoes.map((o) => (
        <button
          key={o.valor}
          type="button"
          aria-pressed={valor === o.valor}
          onClick={() => onChange(o.valor)}
          className={`rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            valor === o.valor
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
          }`}
        >
          {o.rotulo}
        </button>
      ))}
    </div>
  );
}
