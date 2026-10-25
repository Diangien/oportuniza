import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, CreditCard, GraduationCap, Hourglass, RotateCcw, ShieldCheck, Users } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

import { AvatarUtilizador } from "@/components/painel/AvatarUtilizador";
import { Confirmar } from "@/components/painel/Confirmar";
import { CabecalhoPagina, Cartao, EtiquetaTipo, Indicador } from "@/components/painel/elementos";
import { Button } from "@/components/ui/button";
import { useDados } from "@/hooks/use-dados";
import { reporDadosDemonstracao } from "@/lib/dados/repositorio";
import { formatarData } from "@/lib/dados/util";

export const Route = createFileRoute("/admin/")({ component: VisaoGeralAdmin });

function VisaoGeralAdmin() {
  const dados = useDados();

  // Indicadores calculados a partir dos dados guardados, não valores fixos.
  const n = useMemo(() => {
    const porTipo = (tipo: string) => dados.utilizadores.filter((u) => u.tipo === tipo).length;
    return {
      total: dados.utilizadores.length,
      clientes: porTipo("cliente"),
      mentores: porTipo("mentor"),
      admins: porTipo("admin"),
      porValidar: dados.pagamentos.filter((p) => p.estado === "pendente").length,
      semMentor: dados.mentorias.filter((m) => m.estado === "pago" && !m.mentorId).length,
    };
  }, [dados]);

  const recentes = useMemo(
    () => [...dados.utilizadores].sort((a, b) => b.dataCriacao.localeCompare(a.dataCriacao)).slice(0, 5),
    [dados.utilizadores],
  );

  const repor = () => {
    reporDadosDemonstracao();
    toast.success("Dados de demonstração repostos.");
  };

  return (
    <div className="space-y-8">
      <CabecalhoPagina titulo="Visão geral" descricao="Resumo da plataforma com os dados guardados neste browser." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Indicador rotulo="Utilizadores" valor={n.total} icone={Users} />
        <Indicador rotulo="Clientes" valor={n.clientes} icone={GraduationCap} />
        <Indicador rotulo="Mentores" valor={n.mentores} icone={BadgeCheck} />
        <Indicador rotulo="Administradores" valor={n.admins} icone={ShieldCheck} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <Cartao
          titulo="Utilizadores recentes"
          accao={
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/utilizadores">Ver todos</Link>
            </Button>
          }
        >
          <ul className="divide-y divide-border">
            {recentes.map((u) => (
              <li key={u.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <AvatarUtilizador utilizador={u} />
                <div className="min-w-0 flex-1 text-sm">
                  <Link to="/admin/utilizadores/$id" params={{ id: u.id }} className="block truncate font-medium hover:text-primary">
                    {u.nome}
                  </Link>
                  <p className="truncate text-muted-foreground">{formatarData(u.dataCriacao)}</p>
                </div>
                <EtiquetaTipo tipo={u.tipo} />
              </li>
            ))}
          </ul>
        </Cartao>

        <div className="space-y-6">
          <Cartao titulo="Mentorias">
            <div className="space-y-3 text-sm">
              <p className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <CreditCard className="h-4 w-4 text-primary" /> Pagamentos por validar
                </span>
                <strong className="font-display text-xl">{n.porValidar}</strong>
              </p>
              <p className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Hourglass className="h-4 w-4 text-primary" /> Pagas sem mentor
                </span>
                <strong className="font-display text-xl">{n.semMentor}</strong>
              </p>
            </div>
            <Button asChild className="mt-5 w-full">
              <Link to="/admin/mentorias">Gerir mentorias e pagamentos</Link>
            </Button>
          </Cartao>

          <Cartao titulo="Dados de demonstração">
            <p className="text-sm text-muted-foreground">
              Os dados vivem no <code>localStorage</code> deste browser (simulação, sem segurança real). Repor apaga as
              alterações e volta aos dados de exemplo.
            </p>
            <Confirmar
              titulo="Repor os dados de demonstração?"
              descricao="Todos os utilizadores, mentorias e pagamentos criados neste browser serão substituídos pelos dados de exemplo. Esta acção não pode ser desfeita."
              confirmar="Repor dados"
              perigo
              onConfirmar={repor}
            >
              <Button variant="outline" className="mt-4 w-full">
                <RotateCcw /> Repor dados
              </Button>
            </Confirmar>
          </Cartao>
        </div>
      </div>
    </div>
  );
}
