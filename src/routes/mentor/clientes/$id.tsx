import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, PlayCircle } from "lucide-react";
import { toast } from "sonner";

import { AvatarUtilizador } from "@/components/painel/AvatarUtilizador";
import { Confirmar } from "@/components/painel/Confirmar";
import { Cartao, EtiquetaMentoria, ListaDados } from "@/components/painel/elementos";
import { Button } from "@/components/ui/button";
import { useMentor } from "@/hooks/use-dados";
import type { Mentoria } from "@/lib/dados/modelos";
import { avancarMentoria, mentoriasDoMentor, obterBolsa, obterPlano, obterUtilizador } from "@/lib/dados/repositorio";
import { formatarData } from "@/lib/dados/util";

export const Route = createFileRoute("/mentor/clientes/$id")({ component: DetalheClienteMentor });

function DetalheClienteMentor() {
  const { id } = Route.useParams();
  const { mentor, dados } = useMentor();
  if (!mentor) return null;

  const cliente = obterUtilizador(id, dados);
  // Um mentor só vê os clientes que lhe foram atribuídos.
  if (!cliente || cliente.tipo !== "cliente" || !mentor.clientesOrientados.includes(id)) {
    return <Navigate to="/mentor/clientes" replace />;
  }

  const mentorias = mentoriasDoMentor(mentor.id, dados).filter((m) => m.clienteId === id);

  const avancar = (m: Mentoria) => {
    try {
      const actualizada = avancarMentoria(m.id, mentor.id);
      toast.success(actualizada.estado === "concluida" ? "Mentoria concluída." : "Mentoria iniciada.");
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível actualizar a mentoria.");
    }
  };

  return (
    <div className="space-y-6">
      <Link to="/mentor/clientes" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar aos clientes
      </Link>

      <div className="flex items-center gap-4">
        <AvatarUtilizador utilizador={cliente} className="h-16 w-16 text-base" />
        <div>
          <h1 className="font-display text-3xl font-semibold">{cliente.nome}</h1>
          <a href={`mailto:${cliente.email}`} className="text-sm text-muted-foreground hover:text-primary">
            {cliente.email}
          </a>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start">
        <div className="space-y-6">
          <Cartao titulo="Perfil académico">
            <ListaDados
              itens={[
                ["Grau académico", cliente.grauAcademico ?? "—"],
                ["Áreas de interesse", cliente.areasInteresse.length ? cliente.areasInteresse.join(", ") : "—"],
              ]}
            />
          </Cartao>
          <Cartao titulo="Bolsas associadas">
            {cliente.bolsasAssociadas.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem bolsas associadas.</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {cliente.bolsasAssociadas.map((bolsaId) => {
                  const b = obterBolsa(bolsaId, dados);
                  return b ? (
                    <li key={bolsaId}>
                      <Link to="/bolsas/$id" params={{ id: b.id }} className="font-medium hover:text-primary">
                        {b.titulo}
                      </Link>
                      <p className="text-muted-foreground">
                        {b.entidade} · prazo {b.prazo}
                      </p>
                    </li>
                  ) : null;
                })}
              </ul>
            )}
          </Cartao>
        </div>

        <Cartao titulo="Mentorias comigo">
          <ul className="divide-y divide-border">
            {mentorias.map((m) => (
              <li key={m.id} className="space-y-3 py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="text-sm">
                    <p className="font-medium">{obterPlano(m.planoId)?.titulo}</p>
                    <p className="text-muted-foreground">
                      {obterBolsa(m.bolsaId, dados)?.titulo ?? "Sem bolsa"} · actualizada em {formatarData(m.dataActualizacao)}
                    </p>
                  </div>
                  <EtiquetaMentoria estado={m.estado} />
                </div>
                {m.estado === "mentor_atribuido" && (
                  <Confirmar
                    titulo="Iniciar esta mentoria?"
                    descricao="O cliente passa a ver a mentoria como «Em andamento»."
                    confirmar="Iniciar"
                    onConfirmar={() => avancar(m)}
                  >
                    <Button size="sm">
                      <PlayCircle /> Iniciar mentoria
                    </Button>
                  </Confirmar>
                )}
                {m.estado === "em_andamento" && (
                  <Confirmar
                    titulo="Concluir esta mentoria?"
                    descricao="A mentoria fica marcada como concluída para si e para o cliente."
                    confirmar="Concluir"
                    onConfirmar={() => avancar(m)}
                  >
                    <Button size="sm" variant="outline">
                      <CheckCircle2 /> Concluir mentoria
                    </Button>
                  </Confirmar>
                )}
              </li>
            ))}
          </ul>
        </Cartao>
      </div>
    </div>
  );
}
