import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

// Baseado no "Slide Up Text" da Spell UI (spell.sh), refeito em CSS.
// A versão original escondia o texto no HTML do servidor e só o mostrava depois
// de o JavaScript carregar e o React hidratar a página, por isso às vezes
// demorava ou nem chegava a animar. Com @keyframes (ver --animate-slide-up em
// src/styles.css) a animação arranca assim que o browser lê o HTML e o CSS.

type Origem = "first" | "last" | "center";

interface SlideUpTextProps {
  children: string;
  split?: "words" | "characters";
  delay?: number;
  stagger?: number;
  duration?: number;
  from?: Origem;
  className?: string;
  wordClass?: string;
}

function divideEmLetras(texto: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmentador = new Intl.Segmenter("pt", { granularity: "grapheme" });
    return Array.from(segmentador.segment(texto), ({ segment }) => segment);
  }
  return Array.from(texto);
}

// Atraso, em segundos, da peça número `indice` (a contar de 0) num total de
// `total` peças. `from` diz de onde parte a onda: da primeira peça, da última
// ou do centro para as pontas. `delay` soma-se a tudo.
export function atrasoDe(
  indice: number,
  total: number,
  { from, stagger, delay }: { from: Origem; stagger: number; delay: number },
): number {
  //Com "center", o meio é (total - 1) / 2: com um número par de peças fica entre
  // as duas do meio, e a onda abre de forma simétrica (as duas arrancam juntas).
  const origem = from === "last" ? total - 1 : from === "center" ? (total - 1) / 2 : 0;
  return delay + Math.abs(indice - origem) * stagger;
}

export function SlideUpText({
  children,
  split = "words",
  delay = 0,
  stagger = 0.1,
  duration = 0.5,
  from = "first",
  className,
  wordClass,
}: SlideUpTextProps) {
  const palavras = children.split(" ");

  // Cada palavra é um grupo que não se parte entre linhas. O espaço vai dentro
  // da última peça do grupo: num contentor flex, espaços soltos desaparecem.
  const grupos = palavras.map((palavra, i) => {
    const espaco = i < palavras.length - 1 ? " " : "";
    if (split === "characters") return espaco ? [...divideEmLetras(palavra), espaco] : divideEmLetras(palavra);
    return [palavra + espaco];
  });
  const total = grupos.reduce((soma, pecas) => soma + pecas.length, 0);

  let indice = 0;
  return (
    <span className={cn("flex flex-wrap", className)}>
      <span className="sr-only">{children}</span>
      {grupos.map((pecas, g) => (
        <span key={g} aria-hidden className={cn("inline-flex overflow-hidden", wordClass)}>
          {pecas.map((peca, p) => {
            const estilo: CSSProperties = {
              animationDelay: `${+atrasoDe(indice++, total, { from, stagger, delay }).toFixed(3)}s`,
              animationDuration: `${duration}s`,
            };
            return (
              <span
                key={p}
                className="inline-block animate-slide-up whitespace-pre motion-reduce:animate-none"
                style={estilo}
              >
                {peca}
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}
