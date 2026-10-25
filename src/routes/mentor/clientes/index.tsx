import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Users } from "lucide-react";

import { AvatarUtilizador } from "@/components/painel/AvatarUtilizador";
import { CabecalhoPagina, EstadoVazio, EtiquetaMentoria } from "@/components/painel/elementos";
import { useMentor } from "@/hooks/use-dados";
import { mentoriasDoMentor, obterUtilizador } from "@/lib/dados/repositorio";

export const Route = createFileRoute("/mentor/clientes/")({ component: ClientesMentor });

function ClientesMentor() {
  const { mentor, dados } = useMentor();
  if (!mentor) return null;
  const mentorias = mentoriasDoMentor(mentor.id, dados);

  // Só os clientes atribuídos a este mentor; nunca a lista global.
  const clientes = mentor.clientesOrientados.flatMap((id) => {
    const c = obterUtilizador(id, dados);
    if (!c || c.tipo !== "cliente") return [];
    const ultima = mentorias
      .filter((m) => m.clienteId === id)
      .sort((a, b) => b.dataActualizacao.localeCompare(a.dataActualizacao))[0];
    return [{ cliente: c, ultima }];
  });

  return (
    <div className="space-y-6">
      <CabecalhoPagina titulo="Clientes" descricao="Clientes que lhe foram atribuídos." />
      {clientes.length === 0 ? (
        <EstadoVazio icone={Users} titulo="Ainda sem clientes">
          Os clientes são atribuídos automaticamente depois de o pagamento da mentoria ser validado.
        </EstadoVazio>
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
          {clientes.map(({ cliente, ultima }) => (
            <li key={cliente.id}>
              <Link
                to="/mentor/clientes/$id"
                params={{ id: cliente.id }}
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
              >
                <AvatarUtilizador utilizador={cliente} />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-medium">{cliente.nome}</p>
                  <p className="truncate text-muted-foreground">
                    {cliente.grauAcademico ?? "Grau não indicado"}
                    {cliente.areasInteresse.length > 0 && ` · ${cliente.areasInteresse.join(", ")}`}
                  </p>
                </div>
                {ultima && (
                  <span className="hidden sm:block">
                    <EtiquetaMentoria estado={ultima.estado} />
                  </span>
                )}
                <ChevronRight aria-hidden className="h-4 w-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
