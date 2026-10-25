import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, PlayCircle, Sparkles, Users } from "lucide-react";
import { useMemo } from "react";

import { AvatarUtilizador } from "@/components/painel/AvatarUtilizador";
import { CabecalhoPagina, Cartao, EstadoVazio, EtiquetaMentoria, Indicador } from "@/components/painel/elementos";
import { useMentor } from "@/hooks/use-dados";
import { mentoriasDoMentor, obterBolsa, obterPlano, obterUtilizador } from "@/lib/dados/repositorio";

export const Route = createFileRoute("/mentor/")({ component: VisaoGeralMentor });

function VisaoGeralMentor() {
  const { mentor, dados } = useMentor();

  const mentorias = useMemo(() => (mentor ? mentoriasDoMentor(mentor.id, dados) : []), [mentor, dados]);
  if (!mentor) return null;

  const conta = (estado: string) => mentorias.filter((m) => m.estado === estado).length;
  const porComecar = mentorias.filter((m) => m.estado === "mentor_atribuido" || m.estado === "em_andamento");

  return (
    <div className="space-y-8">
      <CabecalhoPagina
        titulo={`Olá, ${mentor.nome.split(" ")[0]}`}
        descricao={mentor.ativo ? "Está activo e pode receber novos clientes." : "Está inactivo: não recebe novos clientes."}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Indicador rotulo="Clientes" valor={mentor.clientesOrientados.length} icone={Users} />
        <Indicador rotulo="Por começar" valor={conta("mentor_atribuido")} icone={Sparkles} />
        <Indicador rotulo="Em andamento" valor={conta("em_andamento")} icone={PlayCircle} />
        <Indicador rotulo="Concluídas" valor={conta("concluida")} icone={CheckCircle2} />
      </div>

      <Cartao titulo="Mentorias activas">
        {porComecar.length === 0 ? (
          <EstadoVazio icone={Users} titulo="Sem mentorias activas">
            Quando um pagamento for validado, o cliente aparece aqui automaticamente.
          </EstadoVazio>
        ) : (
          <ul className="divide-y divide-border">
            {porComecar.map((m) => {
              const cliente = obterUtilizador(m.clienteId, dados);
              return (
                <li key={m.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    {cliente && <AvatarUtilizador utilizador={cliente} />}
                    <div className="text-sm">
                      <Link to="/mentor/clientes/$id" params={{ id: m.clienteId }} className="font-medium hover:text-primary">
                        {cliente?.nome ?? "Cliente removido"}
                      </Link>
                      <p className="text-muted-foreground">
                        {obterPlano(m.planoId)?.titulo} · {obterBolsa(m.bolsaId, dados)?.titulo ?? "Sem bolsa"}
                      </p>
                    </div>
                  </div>
                  <EtiquetaMentoria estado={m.estado} />
                </li>
              );
            })}
          </ul>
        )}
      </Cartao>
    </div>
  );
}
