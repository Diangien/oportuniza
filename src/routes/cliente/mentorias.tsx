import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CreditCard, GraduationCap, Info, Mail, Plus } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { MensagemErro, propsErro } from "@/components/formulario/MensagemErro";
import { AvatarUtilizador } from "@/components/painel/AvatarUtilizador";
import { CabecalhoPagina, EstadoVazio, EtiquetaMentoria, EtiquetaPagamento } from "@/components/painel/elementos";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { useCliente } from "@/hooks/use-dados";
import { ESTADOS_MENTORIA, METODOS_PAGAMENTO } from "@/lib/catalogo";
import type { Mentoria, MetodoPagamento, UtilizadorCliente } from "@/lib/dados/modelos";
import {
  mentoriasDoCliente,
  obterBolsa,
  obterPlano,
  obterUtilizador,
  registarPagamento,
  solicitarMentoria,
} from "@/lib/dados/repositorio";
import { formatarData, formatarKz } from "@/lib/dados/util";
import { mentorias as planos } from "@/lib/mock";
import { cn } from "@/lib/utils";
import { erroDeCampo, esquemaPagamento, validar, type ErrosDe } from "@/lib/validacao";

type Pesquisa = { plano?: string; bolsa?: string; nova?: boolean };

// O router converte "?bolsa=5" no número 5: aceita texto ou número.
const comoTexto = (valor: unknown) =>
  typeof valor === "string" || typeof valor === "number" ? String(valor) : undefined;

export const Route = createFileRoute("/cliente/mentorias")({
  // ?plano=m2 e ?bolsa=3 abrem o pedido já preenchido (vindos das páginas públicas).
  validateSearch: (p: Record<string, unknown>): Pesquisa => {
    const plano = comoTexto(p["plano"]);
    const bolsa = comoTexto(p["bolsa"]);
    return {
      ...(plano && { plano }),
      ...(bolsa && { bolsa }),
      ...((p["nova"] === true || p["nova"] === "true") && { nova: true }),
    };
  },
  component: MentoriasCliente,
});

function MentoriasCliente() {
  const { cliente, dados } = useCliente();
  const pesquisa = Route.useSearch();
  const navigate = useNavigate();
  const [pedirAberto, setPedirAberto] = useState(Boolean(pesquisa.plano || pesquisa.bolsa || pesquisa.nova));
  const [aPagar, setAPagar] = useState<Mentoria | null>(null);

  const mentorias = useMemo(
    () =>
      cliente
        ? mentoriasDoCliente(cliente.id, dados).sort((a, b) => b.dataCriacao.localeCompare(a.dataCriacao))
        : [],
    [cliente, dados],
  );

  if (!cliente) return null;

  const fecharPedido = (aberto: boolean) => {
    setPedirAberto(aberto);
    // Limpa ?plano/?bolsa para o diálogo não voltar a abrir ao recarregar.
    if (!aberto) void navigate({ to: "/cliente/mentorias", search: {}, replace: true });
  };

  return (
    <div className="space-y-6">
      <CabecalhoPagina
        titulo="Mentorias"
        descricao="Peça uma mentoria, registe o pagamento e acompanhe o estado."
        accao={
          <Button onClick={() => setPedirAberto(true)}>
            <Plus /> Solicitar mentoria
          </Button>
        }
      />

      <p className="flex gap-3 rounded-2xl border border-accent bg-accent/20 p-4 text-sm">
        <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-accent-foreground" />
        Pagamentos simulados para demonstração: nenhum valor é cobrado. Depois de a equipa validar o pagamento, é-lhe
        atribuído automaticamente um mentor.
      </p>

      {mentorias.length === 0 ? (
        <EstadoVazio icone={GraduationCap} titulo="Ainda não pediu mentorias">
          Escolha um plano para começar a preparar a sua candidatura com um mentor.
        </EstadoVazio>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {mentorias.map((m) => (
            <CartaoMentoria key={m.id} mentoria={m} dados={dados} onPagar={() => setAPagar(m)} />
          ))}
        </div>
      )}

      <Dialog open={pedirAberto} onOpenChange={fecharPedido}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Solicitar mentoria</DialogTitle>
            <DialogDescription>Escolha o plano e, se quiser, a bolsa para a qual precisa de ajuda.</DialogDescription>
          </DialogHeader>
          <FormPedido
            cliente={cliente}
            dados={dados}
            planoInicial={pesquisa.plano}
            bolsaInicial={pesquisa.bolsa}
            onCriada={(m) => {
              fecharPedido(false);
              setAPagar(m);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={aPagar !== null} onOpenChange={(aberto) => !aberto && setAPagar(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Pagamento simulado</DialogTitle>
            <DialogDescription>
              {aPagar && `${obterPlano(aPagar.planoId)?.titulo} · ${formatarKz(obterPlano(aPagar.planoId)?.valor ?? 0)}`}
            </DialogDescription>
          </DialogHeader>
          {aPagar && <FormPagamento key={aPagar.id} mentoria={aPagar} clienteId={cliente.id} onPago={() => setAPagar(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CartaoMentoria({
  mentoria: m,
  dados,
  onPagar,
}: {
  mentoria: Mentoria;
  dados: ReturnType<typeof useCliente>["dados"];
  onPagar: () => void;
}) {
  const plano = obterPlano(m.planoId);
  const bolsa = obterBolsa(m.bolsaId, dados);
  const mentor = m.mentorId ? obterUtilizador(m.mentorId, dados) : null;
  const pagamento = dados.pagamentos.find((p) => p.id === m.pagamentoId);

  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold">{plano?.titulo ?? "Mentoria"}</h2>
          <p className="text-sm text-muted-foreground">
            {bolsa?.titulo ?? "Sem bolsa associada"} · pedida em {formatarData(m.dataCriacao)}
          </p>
        </div>
        <EtiquetaMentoria estado={m.estado} />
      </div>
      <p className="mt-3 flex-1 text-sm">{ESTADOS_MENTORIA[m.estado].descricao}</p>

      {pagamento && (
        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          Pagamento: {formatarKz(pagamento.valor)} · {METODOS_PAGAMENTO[pagamento.metodo]}
          <EtiquetaPagamento estado={pagamento.estado} />
        </p>
      )}

      {mentor && (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-muted p-3">
          <AvatarUtilizador utilizador={mentor} />
          <div className="min-w-0 text-sm">
            <p className="font-medium">{mentor.nome}</p>
            <a href={`mailto:${mentor.email}`} className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary">
              <Mail className="h-3.5 w-3.5" /> {mentor.email}
            </a>
          </div>
        </div>
      )}

      {m.estado === "aguardando_pagamento" && (
        <Button className="mt-5 self-start" onClick={onPagar}>
          <CreditCard /> Pagar {plano && formatarKz(plano.valor)}
        </Button>
      )}
    </article>
  );
}

function FormPedido({
  cliente,
  dados,
  planoInicial,
  bolsaInicial,
  onCriada,
}: {
  cliente: UtilizadorCliente;
  dados: ReturnType<typeof useCliente>["dados"];
  planoInicial?: string | undefined;
  bolsaInicial?: string | undefined;
  onCriada: (m: Mentoria) => void;
}) {
  const [plano, setPlano] = useState(planoInicial && planos.some((p) => p.id === planoInicial) ? planoInicial : "");
  // Controlado: as opções podem chegar depois do primeiro render (hidratação),
  // e um defaultValue perderia a bolsa que veio no link.
  const [bolsa, setBolsa] = useState(bolsaInicial ?? "");
  const [erro, setErro] = useState("");
  // Bolsas que fazem sentido escolher: associadas, favoritas e a que veio no link.
  const ids = [...new Set([...(bolsaInicial ? [bolsaInicial] : []), ...cliente.bolsasAssociadas, ...cliente.bolsasFavoritas])];
  const opcoes = ids.flatMap((id) => obterBolsa(id, dados) ?? []);

  const aoSubmeter = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!plano) return setErro("Escolha um plano de mentoria.");
    try {
      const m = solicitarMentoria(cliente.id, plano, bolsa || null);
      toast.success("Mentoria solicitada. Registe o pagamento para avançar.");
      onCriada(m);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível solicitar a mentoria.");
    }
  };

  return (
    <form onSubmit={aoSubmeter} noValidate className="space-y-5">
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Plano</legend>
        <div className="space-y-2">
          {planos.map((p) => (
            <label
              key={p.id}
              className={cn(
                "flex cursor-pointer items-start justify-between gap-4 rounded-xl border p-4 text-sm transition-colors focus-within:ring-2 focus-within:ring-ring",
                plano === p.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
              )}
            >
              <span className="flex gap-3">
                <input
                  type="radio"
                  name="plano"
                  value={p.id}
                  checked={plano === p.id}
                  onChange={() => {
                    setPlano(p.id);
                    setErro("");
                  }}
                  className="mt-0.5 h-4 w-4 accent-primary"
                />
                <span>
                  <span className="block font-medium">{p.titulo}</span>
                  <span className="text-muted-foreground">{p.duracao}</span>
                </span>
              </span>
              <span className="shrink-0 font-display text-lg font-semibold text-primary">{p.preco}</span>
            </label>
          ))}
        </div>
        <MensagemErro id="plano-erro">{erro}</MensagemErro>
      </fieldset>

      <label className="block text-sm font-medium">
        Bolsa <span className="font-normal text-muted-foreground">(opcional)</span>
        <NativeSelect name="bolsa" value={bolsa} onChange={(e) => setBolsa(e.target.value)} className="mt-1.5">
          <option value="">Sem bolsa específica</option>
          {opcoes.map((b) => (
            <option key={b.id} value={b.id}>
              {b.titulo} — {b.entidade}
            </option>
          ))}
        </NativeSelect>
      </label>

      <Button type="submit" className="w-full">
        Solicitar mentoria
      </Button>
    </form>
  );
}

function FormPagamento({ mentoria, clienteId, onPago }: { mentoria: Mentoria; clienteId: string; onPago: () => void }) {
  const [erros, setErros] = useState<ErrosDe<typeof esquemaPagamento>>({});

  const aoSubmeter = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const campos = new FormData(e.currentTarget);
    const resultado = validar(esquemaPagamento, { metodo: campos.get("metodo"), referencia: campos.get("referencia") });
    if (!resultado.ok) return setErros(resultado.erros);
    try {
      registarPagamento(mentoria.id, clienteId, resultado.dados);
      toast.success("Pagamento registado. Fica a aguardar validação pela equipa.");
      onPago();
    } catch (erro) {
      setErros(erroDeCampo("referencia", erro instanceof Error ? erro.message : "Não foi possível registar."));
    }
  };

  return (
    <form onSubmit={aoSubmeter} noValidate className="space-y-5">
      <label className="block text-sm font-medium">
        Método de pagamento
        <NativeSelect name="metodo" defaultValue="multicaixa_express" className="mt-1.5" {...propsErro("pg-metodo", erros.metodo)}>
          {(Object.keys(METODOS_PAGAMENTO) as MetodoPagamento[]).map((m) => (
            <option key={m} value={m}>
              {METODOS_PAGAMENTO[m]}
            </option>
          ))}
        </NativeSelect>
        <MensagemErro id="pg-metodo-erro">{erros.metodo}</MensagemErro>
      </label>
      <label className="block text-sm font-medium">
        Referência da transacção
        <Input
          name="referencia"
          placeholder="ex.: DEMO-2026-001"
          autoComplete="off"
          className="mt-1.5"
          {...propsErro("pg-referencia", erros.referencia)}
        />
        <MensagemErro id="pg-referencia-erro">{erros.referencia}</MensagemErro>
        <span className="mt-1.5 block text-xs font-normal text-muted-foreground">
          Simulação: escreva qualquer referência. Não introduza dados bancários reais.
        </span>
      </label>
      <Button type="submit" className="w-full">
        Registar pagamento
      </Button>
    </form>
  );
}
