import { createFileRoute, Link } from "@tanstack/react-router";
import { BookmarkCheck, BookmarkPlus, Heart, HeartOff } from "lucide-react";
import { toast } from "sonner";

import { BolsaCard } from "@/components/BolsaCard";
import { CabecalhoPagina, EstadoVazio } from "@/components/painel/elementos";
import { Button } from "@/components/ui/button";
import { useCliente } from "@/hooks/use-dados";
import { alternarFavorita, associarBolsa, obterBolsa } from "@/lib/dados/repositorio";

export const Route = createFileRoute("/cliente/favoritas")({ component: Favoritas });

function Favoritas() {
  const { cliente, dados } = useCliente();
  if (!cliente) return null;
  const bolsas = cliente.bolsasFavoritas.flatMap((id) => obterBolsa(id, dados) ?? []);

  return (
    <div className="space-y-6">
      <CabecalhoPagina
        titulo="Bolsas favoritas"
        descricao="Bolsas que guardou. Associe-as para acompanhar a candidatura e os prazos."
      />
      {bolsas.length === 0 ? (
        <EstadoVazio icone={Heart} titulo="Ainda não tem favoritas">
          Na página de cada bolsa, use «Adicionar aos favoritos».{" "}
          <Link to="/bolsas" className="text-primary hover:underline">
            Ver bolsas
          </Link>
        </EstadoVazio>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {bolsas.map((b) => {
            const associada = cliente.bolsasAssociadas.includes(b.id);
            return (
              <BolsaCard
                key={b.id}
                b={b}
                accoes={
                  <>
                    <Button asChild size="sm">
                      <Link to="/bolsas/$id" params={{ id: b.id }}>Ver detalhes</Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={associada}
                      onClick={() => {
                        associarBolsa(cliente.id, b.id);
                        toast.success("Bolsa associada. Acompanhe-a em «Bolsas associadas».");
                      }}
                    >
                      {associada ? <BookmarkCheck /> : <BookmarkPlus />}
                      {associada ? "Associada" : "Acompanhar"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        alternarFavorita(cliente.id, b.id);
                        toast.success("Removida dos favoritos.");
                      }}
                    >
                      <HeartOff /> Remover
                    </Button>
                  </>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
