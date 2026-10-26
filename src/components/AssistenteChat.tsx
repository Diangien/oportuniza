import { Link, useLocation } from "@tanstack/react-router";
import { MessageCircle, RotateCcw, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type RefObject } from "react";

import cabeca from "@/assets/assistente/cabeca.webp";
import corpo from "@/assets/assistente/corpo.webp";
import { Button } from "@/components/ui/button";
import { useOlharCursor } from "@/hooks/use-olhar-cursor";
import { BOAS_VINDAS, PERGUNTAS, mostraAssistente, type Pergunta } from "@/lib/assistente";
import { cn } from "@/lib/utils";

// Assistente virtual das páginas públicas. Está montado uma só vez em
// src/routes/__root.tsx e nunca desmonta ao mudar de página, por isso a
// conversa sobrevive a fechar o painel e a navegar pelo site.

const bolha = "max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed";
const entrada = "animate-in fade-in slide-in-from-bottom-1 duration-300 motion-reduce:animate-none";

// Medidas das camadas em src/assets/assistente (as duas têm o mesmo tamanho).
// O pivô é o ponto do pescoço à volta do qual a cabeça roda; o centro é o
// ponto da cara de onde se calcula a direcção do olhar. Ambos em fracções.
const PERSONAGEM = { largura: 384, altura: 357 };
const PIVO = { x: 0.485, y: 0.644 };
const CENTRO_CABECA = { x: 0.485, y: 0.351 };

export function AssistenteChat() {
  const { pathname } = useLocation();
  const [aberto, setAberto] = useState(false);
  // Ids das perguntas escolhidas, pela ordem em que o utilizador as fez.
  const [conversa, setConversa] = useState<string[]>([]);

  const idPainel = useId();
  const idTitulo = useId();
  const botaoRef = useRef<HTMLButtonElement>(null);
  const painelRef = useRef<HTMLDivElement>(null);
  const cabecaRef = useRef<HTMLImageElement>(null);
  const corpoRef = useRef<HTMLDivElement>(null);
  const ultimaPerguntaRef = useRef<HTMLDivElement>(null);
  const primeiraOpcaoRef = useRef<HTMLButtonElement>(null);
  // Só devolvemos o foco ao botão quando o utilizador fecha o painel (X ou Escape),
  // não quando segue um link para outra página.
  const focarBotao = useRef(false);

  useEffect(() => {
    if (aberto) {
      primeiraOpcaoRef.current?.focus();
    } else if (focarBotao.current) {
      focarBotao.current = false;
      botaoRef.current?.focus();
    }
  }, [aberto]);

  // Leva o scroll ao início da última pergunta, para a resposta ler-se de cima.
  useEffect(() => {
    const corpo = corpoRef.current;
    const ultima = ultimaPerguntaRef.current;
    if (!aberto || !corpo || !ultima) return;
    corpo.scrollTop = ultima.offsetTop - 12;
  }, [aberto, conversa.length]);

  useOlharCursor(painelRef, cabecaRef, CENTRO_CABECA, aberto);

  if (!mostraAssistente(pathname)) return null;

  function fechar() {
    focarBotao.current = true;
    setAberto(false);
  }

  function aoPremirTecla(evento: KeyboardEvent<HTMLDivElement>) {
    if (evento.key === "Escape") {
      evento.stopPropagation();
      fechar();
    }
  }

  return (
    <>
      <Button
        ref={botaoRef}
        type="button"
        size="icon"
        aria-label="Abrir assistente da BolsaAngola"
        aria-expanded={aberto}
        aria-controls={idPainel}
        onClick={() => setAberto(true)}
        className={cn(
          "fixed bottom-4 right-4 z-40 h-14 w-14 shadow-card transition-transform hover:scale-105 motion-reduce:hover:scale-100 sm:bottom-6 sm:right-6 [&_svg]:size-6",
          aberto && "hidden",
        )}
      >
        <MessageCircle aria-hidden />
      </Button>

      {aberto && (
        <div
          ref={painelRef}
          id={idPainel}
          role="dialog"
          aria-labelledby={idTitulo}
          onKeyDown={aoPremirTecla}
          className="fixed bottom-4 right-4 z-40 flex max-h-[min(38rem,calc(100dvh-2rem))] w-[calc(100vw-2rem)] origin-bottom-right flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-card animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-200 motion-reduce:animate-none sm:bottom-6 sm:right-6 sm:w-96"
        >
          <header className="flex items-start gap-3 bg-card px-4 pt-3">
            <h2 id={idTitulo} className="flex-1 font-display text-base font-semibold leading-snug">
              <span aria-hidden>👋 </span>
              {BOAS_VINDAS.titulo}
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Fechar assistente"
              onClick={fechar}
              className="-mr-2 -mt-1 shrink-0"
            >
              <X aria-hidden />
            </Button>
          </header>

          {/* Fora da zona com scroll, para o personagem estar à vista durante a conversa. */}
          {/* Em ecrãs baixos (portáteis com escala a 150% ficam com ~560 px) o
              personagem encolhe; só desaparece quando já não sobra espaço para a conversa. */}
          <div className="flex items-end gap-3 border-b border-border bg-linear-to-b from-card to-accent/30 px-4 pt-2 [@media(max-height:479px)]:pb-3">
            <Personagem
              cabecaRef={cabecaRef}
              className="w-24 shrink-0 sm:w-28 [@media(max-height:639px)]:w-20! [@media(max-height:479px)]:hidden"
            />
            <p className={cn(bolha, "mb-3 min-w-0 flex-1 rounded-bl-sm border border-border bg-card [@media(max-height:479px)]:mb-0")}>
              {BOAS_VINDAS.mensagem}
            </p>
          </div>

          <div
            ref={corpoRef}
            aria-live="polite"
            className="relative min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 empty:py-0"
          >
            {conversa.map((id, i) => {
              const pergunta = PERGUNTAS.find((p) => p.id === id);
              if (!pergunta) return null;
              const ultima = i === conversa.length - 1;
              return (
                <div key={i} ref={ultima ? ultimaPerguntaRef : undefined} className={cn("space-y-3", entrada)}>
                  <p className={cn(bolha, "ml-auto w-fit rounded-br-sm bg-primary text-primary-foreground")}>
                    {pergunta.pergunta}
                  </p>
                  <Resposta pergunta={pergunta} aoSeguirLink={() => setAberto(false)} />
                </div>
              );
            })}
          </div>

          <footer className="space-y-2 border-t border-border bg-background px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">
                {conversa.length === 0 ? BOAS_VINDAS.auxiliar : "Tens outra dúvida?"}
              </p>
              {conversa.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Este botão desaparece ao limpar; o foco passa para as perguntas.
                    setConversa([]);
                    primeiraOpcaoRef.current?.focus();
                  }}
                  className="-mr-2 text-muted-foreground"
                >
                  <RotateCcw aria-hidden />
                  Recomeçar
                </Button>
              )}
            </div>
            <ul className="space-y-2">
              {PERGUNTAS.map((p, i) => (
                <li key={p.id}>
                  <Button
                    ref={i === 0 ? primeiraOpcaoRef : undefined}
                    type="button"
                    variant="outline"
                    onClick={() => setConversa((atual) => [...atual, p.id])}
                    className="h-auto w-full justify-start whitespace-normal rounded-xl bg-card px-3 py-2 text-left hover:border-primary/40 hover:bg-muted"
                  >
                    {p.pergunta}
                  </Button>
                </li>
              ))}
            </ul>
          </footer>
        </div>
      )}
    </>
  );
}

// O rapaz em duas camadas alinhadas: o corpo fica parado e só a cabeça roda
// (ver src/hooks/use-olhar-cursor.ts). É decorativo, por isso fica escondido
// dos leitores de ecrã.
function Personagem({ cabecaRef, className }: { cabecaRef: RefObject<HTMLImageElement | null>; className?: string }) {
  const camada = "absolute inset-0 h-full w-full";
  return (
    <div
      aria-hidden
      className={cn("relative select-none", className)}
      style={{ aspectRatio: `${PERSONAGEM.largura} / ${PERSONAGEM.altura}` }}
    >
      <img src={corpo} alt="" draggable={false} className={camada} />
      <img
        ref={cabecaRef}
        src={cabeca}
        alt=""
        draggable={false}
        className={cn(camada, "will-change-transform")}
        style={{ transformOrigin: `${PIVO.x * 100}% ${PIVO.y * 100}%` }}
      />
    </div>
  );
}

function Resposta({ pergunta, aoSeguirLink }: { pergunta: Pergunta; aoSeguirLink: () => void }) {
  return (
    <div className={cn(bolha, "space-y-2 rounded-bl-sm border border-border bg-card")}>
      {pergunta.resposta.map((bloco, i) =>
        bloco.tipo === "paragrafo" ? (
          <p key={i}>{bloco.texto}</p>
        ) : (
          <ul key={i} className="list-disc space-y-1 pl-5 marker:text-primary">
            {bloco.itens.map((item) => (
              <li key={item.titulo}>
                <strong className="font-semibold">{item.titulo}:</strong> {item.texto}
              </li>
            ))}
          </ul>
        ),
      )}
      {pergunta.accao && (
        <Button asChild size="sm" className="mt-1">
          <Link to={pergunta.accao.para} onClick={aoSeguirLink}>
            {pergunta.accao.texto}
          </Link>
        </Button>
      )}
    </div>
  );
}
