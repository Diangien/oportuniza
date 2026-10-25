import { Check } from "lucide-react";

import { AREAS } from "@/lib/catalogo";

// Áreas de interesse em botões de filtro (o mesmo padrão dos filtros de bolsas).
export function SeletorAreas({
  valor,
  onChange,
  titulo = "Áreas de interesse",
}: {
  valor: string[];
  onChange: (areas: string[]) => void;
  titulo?: string;
}) {
  const alterna = (area: string) =>
    onChange(valor.includes(area) ? valor.filter((a) => a !== area) : [...valor, area]);

  return (
    <fieldset>
      <legend className="mb-1.5 flex w-full items-baseline justify-between gap-3 text-sm font-medium">
        {titulo}
        <span className="text-xs font-normal text-muted-foreground">
          {valor.length > 0 ? `${valor.length} selecionada${valor.length > 1 ? "s" : ""}` : "escolha uma ou mais"}
        </span>
      </legend>
      <div className="mt-1 flex flex-wrap gap-2">
        {AREAS.map((area) => {
          const activa = valor.includes(area);
          return (
            <button
              key={area}
              type="button"
              aria-pressed={activa}
              onClick={() => alterna(area)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                activa
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {activa && <Check className="h-3.5 w-3.5" />}
              {area}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
