import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, CreditCard, GraduationCap, UserCheck, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Confirmar } from "@/components/painel/Confirmar";
import { CabecalhoPagina, Cartao, EstadoVazio, EtiquetaMentoria, Filtros } from "@/components/painel/elementos";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDados } from "@/hooks/use-dados";
import { ESTADOS_MENTORIA, METODOS_PAGAMENTO } from "@/lib/catalogo";
import type { EstadoMentoria } from "@/lib/dados/modelos";
import {
  obterBolsa,
  obterPlano,
  obterUtilizador,
  processarAtribuicoes,
  rejeitarPagamento,
  validarPagamento,
} from "@/lib/dados/repositorio";
import { formatarData, formatarKz } from "@/lib/dados/util";

export const Route = createFileRoute("/admin/mentorias")({ component: MentoriasAdmin });

type Filtro = "todas" | EstadoMentoria;

const FILTROS: { valor: Filtro; rotulo: string }[] = [
  { valor: "todas", rotulo: "Todas" },
  ...(Object.keys(ESTADOS_MENTORIA) as EstadoMentoria[]).map((e) => ({ valor: e, rotulo: ESTADOS_MENTORIA[e].rotulo })),
];

const executar = (accao: () => void) => {
  try {
    accao();
  } catch (erro) {
    toast.error(erro instanceof Error ? erro.message : "Não foi possível concluir a acção.");
  }
};

function MentoriasAdmin() {
  const dados = useDados();
  const [filtro, setFiltro] = useState<Filtro>("todas");

  const porValidar = useMemo(
    () => dados.pagamentos.filter((p) => p.estado === "pendente").sort((a, b) => a.dataRegisto.localeCompare(b.dataRegisto)),
    [dados.pagamentos],
  );
  const semMentor = dados.mentorias.filter((m) => m.estado === "pago" && !m.mentorId).length;
  const mentorias = useMemo(
    () =>
      dados.mentorias
        .filter((m) => filtro === "todas" || m.estado === filtro)
        .sort((a, b) => b.dataActualizacao.localeCompare(a.dataActualizacao)),
    [dados.mentorias, filtro],
  );

  const nome = (id: string | null) => (id ? (obterUtilizador(id, dados)?.nome ?? "Conta removida") : "—");

  const validar = (pagamentoId: string) =>
    executar(() => {
      const { mentor } = validarPagamento(pagamentoId);
      if (mentor) toast.success(`Pagamento validado. Mentor atribuído: ${mentor.nome}.`);
      else toast.warning("Pagamento validado. Não há mentores activos: o pedido fica a aguardar atribuição.");
    });

  const atribuir = () =>
    executar(() => {
      const n = processarAtribuicoes();
      if (n > 0) toast.success(`${n} mentoria${n > 1 ? "s" : ""} atribuída${n > 1 ? "s" : ""}.`);
      else toast.info("Nada para atribuir: não há mentorias pagas sem mentor ou não há mentores activos.");
    });

  return (
    <div className="space-y-8">
      <CabecalhoPagina
        titulo="Mentorias e pagamentos"
        descricao="Valide os pagamentos simulados. O mentor só é atribuído depois da validação."
        accao={
          <Button variant="outline" onClick={atribuir} disabled={semMentor === 0}>
            <UserCheck /> Atribuir pendentes{semMentor > 0 && ` (${semMentor})`}
          </Button>
        }
      />

      <Cartao titulo={`Pagamentos por validar (${porValidar.length})`}>
        {porValidar.length === 0 ? (
          <EstadoVazio icone={CreditCard} titulo="Nenhum pagamento por validar" />
        ) : (
          <ul className="divide-y divide-border">
            {porValidar.map((p) => {
              const mentoria = dados.mentorias.find((m) => m.id === p.mentoriaId);
              return (
                <li key={p.id} className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 md:flex-row md:items-center md:justify-between">
                  <div className="text-sm">
                    <p className="font-medium">
                      {nome(p.clienteId)} · {obterPlano(mentoria?.planoId ?? "")?.titulo ?? "Mentoria"}
                    </p>
                    <p className="text-muted-foreground">
                      {formatarKz(p.valor)} · {METODOS_PAGAMENTO[p.metodo]} · Ref. {p.referencia} · {formatarData(p.dataRegisto)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Confirmar
                      titulo="Rejeitar este pagamento?"
                      descricao="A mentoria volta ao estado «Aguarda pagamento» e o cliente pode registar um novo pagamento."
                      confirmar="Rejeitar"
                      perigo
                      onConfirmar={() => executar(() => {
                        rejeitarPagamento(p.id);
                        toast.success("Pagamento rejeitado.");
                      })}
                    >
                      <Button variant="outline" size="sm">
                        <X /> Rejeitar
                      </Button>
                    </Confirmar>
                    <Confirmar
                      titulo="Validar este pagamento?"
                      descricao={`Confirma que recebeu ${formatarKz(p.valor)} (ref. ${p.referencia})? A mentoria passa a paga e é atribuída automaticamente ao mentor activo com menos clientes.`}
                      confirmar="Validar pagamento"
                      onConfirmar={() => validar(p.id)}
                    >
                      <Button size="sm">
                        <Check /> Validar
                      </Button>
                    </Confirmar>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Cartao>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Todas as mentorias</h2>
        <Filtros opcoes={FILTROS} valor={filtro} onChange={setFiltro} />
        {mentorias.length === 0 ? (
          <EstadoVazio icone={GraduationCap} titulo="Nenhuma mentoria neste estado" />
        ) : (
          <div className="rounded-2xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">Plano e bolsa</TableHead>
                  <TableHead className="hidden sm:table-cell">Mentor</TableHead>
                  <TableHead className="pr-5 text-right">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mentorias.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="pl-5">
                      <Link to="/admin/utilizadores/$id" params={{ id: m.clienteId }} className="font-medium hover:text-primary">
                        {nome(m.clienteId)}
                      </Link>
                      <p className="text-xs text-muted-foreground">{formatarData(m.dataActualizacao)}</p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <p>{obterPlano(m.planoId)?.titulo ?? m.planoId}</p>
                      <p className="text-xs text-muted-foreground">{obterBolsa(m.bolsaId, dados)?.titulo ?? "Sem bolsa"}</p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{nome(m.mentorId)}</TableCell>
                    <TableCell className="pr-5 text-right">
                      <EtiquetaMentoria estado={m.estado} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
