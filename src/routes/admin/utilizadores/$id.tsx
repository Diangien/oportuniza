import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Pencil, UserX } from "lucide-react";
import { useState } from "react";

import { AvatarUtilizador } from "@/components/painel/AvatarUtilizador";
import { Cartao, EstadoVazio, EtiquetaMentoria, EtiquetaTipo, ListaDados } from "@/components/painel/elementos";
import { DialogUtilizador } from "@/components/painel/FormUtilizador";
import { Button } from "@/components/ui/button";
import { useDados } from "@/hooks/use-dados";
import { NOME_TIPO } from "@/lib/catalogo";
import type { BaseDados, UtilizadorCliente, UtilizadorMentor } from "@/lib/dados/modelos";
import { mentoriasDoCliente, obterBolsa, obterPlano, obterUtilizador } from "@/lib/dados/repositorio";
import { formatarData } from "@/lib/dados/util";

export const Route = createFileRoute("/admin/utilizadores/$id")({ component: DetalheUtilizador });

function DetalheUtilizador() {
  const { id } = Route.useParams();
  const dados = useDados();
  const [aEditar, setAEditar] = useState(false);
  const u = obterUtilizador(id, dados);

  const voltar = (
    <Link to="/admin/utilizadores" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
      <ArrowLeft className="h-4 w-4" /> Voltar aos utilizadores
    </Link>
  );

  if (!u)
    return (
      <div className="space-y-6">
        {voltar}
        <EstadoVazio icone={UserX} titulo="Utilizador não encontrado">
          A conta pode ter sido removida ao repor os dados de demonstração.
        </EstadoVazio>
      </div>
    );

  return (
    <div className="space-y-6">
      {voltar}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <AvatarUtilizador utilizador={u} className="h-16 w-16 text-base" />
          <div>
            <h1 className="font-display text-3xl font-semibold">{u.nome}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <EtiquetaTipo tipo={u.tipo} />
              {u.tipo === "mentor" && <span>{u.ativo ? "Activo" : "Inactivo"}</span>}
            </div>
          </div>
        </div>
        <Button onClick={() => setAEditar(true)}>
          <Pencil /> Editar
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
        {/* A palavra-passe nunca é mostrada. */}
        <Cartao titulo="Dados pessoais">
          <ListaDados
            itens={[
              ["E-mail", u.email],
              ["Tipo de conta", NOME_TIPO[u.tipo]],
              ["Conta criada em", formatarData(u.dataCriacao)],
              ...(u.tipo === "cliente"
                ? ([
                    ["Grau académico", u.grauAcademico ?? "—"],
                    ["Áreas de interesse", u.areasInteresse.length ? u.areasInteresse.join(", ") : "—"],
                  ] as [string, string][])
                : []),
            ]}
          />
        </Cartao>

        {u.tipo === "cliente" && <DetalhesCliente cliente={u} dados={dados} />}
        {u.tipo === "mentor" && <DetalhesMentor mentor={u} dados={dados} />}
        {u.tipo === "admin" && (
          <Cartao titulo="Permissões">
            <p className="text-sm text-muted-foreground">
              Administradores gerem utilizadores, validam pagamentos e supervisionam as mentorias.
            </p>
          </Cartao>
        )}
      </div>

      <DialogUtilizador aberto={aEditar} onAbertoChange={setAEditar} utilizador={u} />
    </div>
  );
}

function ListaBolsas({ ids, dados, vazio }: { ids: string[]; dados: BaseDados; vazio: string }) {
  if (ids.length === 0) return <p className="text-sm text-muted-foreground">{vazio}</p>;
  return (
    <ul className="space-y-2 text-sm">
      {ids.map((id) => {
        const b = obterBolsa(id, dados);
        return (
          <li key={id} className="flex items-center justify-between gap-3">
            <span className="font-medium">{b?.titulo ?? `Bolsa ${id} (removida)`}</span>
            {b && <span className="shrink-0 text-muted-foreground">{b.prazo}</span>}
          </li>
        );
      })}
    </ul>
  );
}

function DetalhesCliente({ cliente, dados }: { cliente: UtilizadorCliente; dados: BaseDados }) {
  const mentorias = mentoriasDoCliente(cliente.id, dados);
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Cartao titulo="Bolsas favoritas">
          <ListaBolsas ids={cliente.bolsasFavoritas} dados={dados} vazio="Sem bolsas favoritas." />
        </Cartao>
        <Cartao titulo="Bolsas associadas">
          <ListaBolsas ids={cliente.bolsasAssociadas} dados={dados} vazio="Sem bolsas associadas." />
        </Cartao>
      </div>
      <Cartao titulo="Mentorias">
        {mentorias.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ainda não pediu mentorias.</p>
        ) : (
          <ul className="divide-y divide-border">
            {mentorias.map((m) => {
              const mentor = m.mentorId ? obterUtilizador(m.mentorId, dados) : null;
              return (
                <li key={m.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm">
                    <p className="font-medium">{obterPlano(m.planoId)?.titulo ?? m.planoId}</p>
                    <p className="text-muted-foreground">
                      {obterBolsa(m.bolsaId, dados)?.titulo ?? "Sem bolsa associada"} · Mentor: {mentor?.nome ?? "—"}
                    </p>
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

function DetalhesMentor({ mentor, dados }: { mentor: UtilizadorMentor; dados: BaseDados }) {
  return (
    <Cartao titulo={`Clientes atribuídos (${mentor.clientesOrientados.length})`}>
      {mentor.clientesOrientados.length === 0 ? (
        <p className="text-sm text-muted-foreground">Ainda sem clientes atribuídos.</p>
      ) : (
        <ul className="divide-y divide-border">
          {mentor.clientesOrientados.map((id) => {
            const c = obterUtilizador(id, dados);
            return (
              <li key={id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                {c ? (
                  <>
                    <AvatarUtilizador utilizador={c} />
                    <div className="min-w-0 text-sm">
                      <Link to="/admin/utilizadores/$id" params={{ id }} className="font-medium hover:text-primary">
                        {c.nome}
                      </Link>
                      <p className="truncate text-muted-foreground">{c.email}</p>
                    </div>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">Cliente removido</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Cartao>
  );
}
