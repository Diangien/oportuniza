import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Utilizador } from "@/lib/dados/modelos";
import { cn } from "@/lib/utils";

const iniciais = (nome: string) =>
  nome
    .split(/\s+/)
    .filter(Boolean)
    .map((parte) => parte[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export function AvatarUtilizador({
  utilizador,
  className,
}: {
  utilizador: Pick<Utilizador, "nome" | "fotoPerfil">;
  className?: string;
}) {
  return (
    <Avatar className={cn("h-9 w-9", className)}>
      {utilizador.fotoPerfil && <AvatarImage src={utilizador.fotoPerfil} alt="" className="object-cover" />}
      <AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">
        {iniciais(utilizador.nome)}
      </AvatarFallback>
    </Avatar>
  );
}
