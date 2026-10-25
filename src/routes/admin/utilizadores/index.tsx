import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, Pencil, Plus, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { AvatarUtilizador } from "@/components/painel/AvatarUtilizador";
import { CabecalhoPagina, EstadoVazio, EtiquetaTipo, Filtros } from "@/components/painel/elementos";
import { DialogUtilizador } from "@/components/painel/FormUtilizador";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDados } from "@/hooks/use-dados";
import type { TipoUtilizador, Utilizador } from "@/lib/dados/modelos";
import { formatarData } from "@/lib/dados/util";

export const Route = createFileRoute("/admin/utilizadores/")({ component: Utilizadores });

type Filtro = "todos" | TipoUtilizador;

const FILTROS: { valor: Filtro; rotulo: string }[] = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "cliente", rotulo: "Clientes" },
  { valor: "mentor", rotulo: "Mentores" },
  { valor: "admin", rotulo: "Administradores" },
];

function Utilizadores() {
  const { utilizadores } = useDados();
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [pesquisa, setPesquisa] = useState("");
  const [dialogo, setDialogo] = useState<{ aberto: boolean; utilizador?: Utilizador | undefined }>({ aberto: false });

  const lista = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase();
    return utilizadores
      .filter((u) => filtro === "todos" || u.tipo === filtro)
      .filter((u) => !termo || u.nome.toLowerCase().includes(termo) || u.email.includes(termo))
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt"));
  }, [utilizadores, filtro, pesquisa]);

  return (
    <div className="space-y-6">
      <CabecalhoPagina
        titulo="Utilizadores"
        descricao={`${utilizadores.length} contas registadas na plataforma.`}
        accao={
          <Button onClick={() => setDialogo({ aberto: true })}>
            <Plus /> Novo utilizador
          </Button>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Filtros opcoes={FILTROS} valor={filtro} onChange={setFiltro} />
        <label className="relative block lg:w-72">
          <span className="sr-only">Pesquisar por nome ou e-mail</span>
          <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            placeholder="Pesquisar nome ou e-mail"
            className="rounded-full py-2 pl-10"
          />
        </label>
      </div>

      {lista.length === 0 ? (
        <EstadoVazio icone={Users} titulo="Nenhum utilizador encontrado">
          Experimente outro filtro ou outra pesquisa.
        </EstadoVazio>
      ) : (
        <div className="rounded-2xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Nome</TableHead>
                <TableHead className="hidden md:table-cell">E-mail</TableHead>
                <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                <TableHead className="hidden lg:table-cell">Criado em</TableHead>
                <TableHead className="pr-5 text-right">Acções</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="pl-5">
                    <div className="flex items-center gap-3">
                      <AvatarUtilizador utilizador={u} className="hidden sm:flex" />
                      <div className="min-w-0">
                        <p className="font-medium">{u.nome}</p>
                        {/* No telemóvel, o e-mail e o tipo aparecem por baixo do nome. */}
                        <p className="truncate text-xs text-muted-foreground md:hidden">{u.email}</p>
                        <span className="mt-1 inline-block sm:hidden">
                          <EtiquetaTipo tipo={u.tipo} />
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">{u.email}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <EtiquetaTipo tipo={u.tipo} />
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">{formatarData(u.dataCriacao)}</TableCell>
                  <TableCell className="pr-5">
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="icon" aria-label={`Ver ${u.nome}`}>
                        <Link to="/admin/utilizadores/$id" params={{ id: u.id }}>
                          <Eye />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" aria-label={`Editar ${u.nome}`} onClick={() => setDialogo({ aberto: true, utilizador: u })}>
                        <Pencil />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <DialogUtilizador
        aberto={dialogo.aberto}
        utilizador={dialogo.utilizador}
        onAbertoChange={(aberto) => setDialogo((d) => ({ ...d, aberto }))}
      />
    </div>
  );
}
