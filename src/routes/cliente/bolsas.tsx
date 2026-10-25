import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, BookmarkMinus, GraduationCap } from "lucide-react";
import { toast } from "sonner";

import { BolsaCard } from "@/components/BolsaCard";
import { CabecalhoPagina, EstadoVazio } from "@/components/painel/elementos";
import { Button } from "@/components/ui/button";
import { useCliente } from "@/hooks/use-dados";
import { desassociarBolsa, obterBolsa } from "@/lib/dados/repositorio";
import { prazoParaData } from "@/lib/dados/util";

export const Route = createFileRoute("/cliente/bolsas")({ component: BolsasAssociadas });

function BolsasAssociadas() {
  const { cliente, dados } = useCliente();
  if (!cliente) return null;
  // Ordenadas pelo prazo, para se ver primeiro o que acaba mais cedo.
  const bolsas = cliente.bolsasAssociadas
    .flatMap((id) => obterBolsa(id, dados) ?? [])
    .sort((a, b) => (prazoParaData(a.prazo)?.getTime() ?? Infinity) - (prazoParaData(b.prazo)?.getTime() ?? Infinity));

  return (
    <div className="space-y-6">
      <CabecalhoPagina
        titulo="Bolsas associadas"
        descricao="As bolsas a que se está a candidatar, ordenadas pelo prazo."
      />
      {bolsas.length === 0 ? (
        <EstadoVazio icone={Bookmark} titulo="Nenhuma bolsa associada">
          Associe bolsas a partir dos favoritos, ou ao pedir uma mentoria para uma bolsa.{" "}
          <Link to="/cliente/favoritas" className="text-primary hover:underline">
            Ver favoritas
          </Link>
        </EstadoVazio>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {bolsas.map((b) => (
            <BolsaCard
              key={b.id}
              b={b}
              accoes={
                <>
                  <Button asChild size="sm">
                    <Link to="/cliente/mentorias" search={{ bolsa: b.id }}>
                      <GraduationCap /> Pedir mentoria
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      desassociarBolsa(cliente.id, b.id);
                      toast.success("Deixou de acompanhar esta bolsa.");
                    }}
                  >
                    <BookmarkMinus /> Deixar de acompanhar
                  </Button>
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
