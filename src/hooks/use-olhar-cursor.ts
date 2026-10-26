import { useEffect, type RefObject } from "react";

// Faz a cabeça do personagem do assistente "olhar" para o cursor.
// A posição muda dezenas de vezes por segundo, por isso não passa pelo estado
// do React (seria um re-render por frame): escrevemos o `transform` directamente
// no elemento, dentro de um ciclo requestAnimationFrame que pára quando acaba.

export interface Olhar {
  x: number; // -1 (esquerda) a 1 (direita)
  y: number; // -1 (cima) a 1 (baixo)
}

interface Ponto {
  x: number;
  y: number;
}

interface Limites {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const NEUTRO: Olhar = { x: 0, y: 0 };
// Sem mexer o rato durante este tempo, a cabeça volta ao centro.
const PAUSA_MS = 1200;
// Constantes de tempo da suavização: rápida a seguir, mais lenta a voltar.
const TAU_SEGUIR_MS = 120;
const TAU_VOLTAR_MS = 350;

const limitar = (valor: number) => Math.max(-1, Math.min(1, valor));

// Direcção do centro da cabeça para o cursor, de -1 a 1 em cada eixo.
// Cada lado divide pela distância até à borda da área desse lado: a cabeça está
// perto do canto, e assim chegar à borda esquerda ou à direita dá o máximo.
export function calcularOlhar(cursor: Ponto, centro: Ponto, area: Limites): Olhar {
  const dx = cursor.x - centro.x;
  const dy = cursor.y - centro.y;
  const alcanceX = dx >= 0 ? area.right - centro.x : centro.x - area.left;
  const alcanceY = dy >= 0 ? area.bottom - centro.y : centro.y - area.top;
  return {
    x: limitar(dx / Math.max(alcanceX, 1)),
    y: limitar(dy / Math.max(alcanceY, 1)),
  };
}

// Amplitudes pequenas de propósito: a imagem é plana, e acima disto a cara deforma
// ou abre-se uma fresta no pescoço (o prolongamento por trás do queixo foi testado
// até ~2% de deslocamento e 3° de inclinação).
export function transformarCabeca({ x, y }: Olhar): string {
  const r = (n: number) => +n.toFixed(3);
  return `perspective(500px) translate(${r(x * 2)}%, ${r(y * 1.5)}%) rotateY(${r(x * 9)}deg) rotateX(${r(-y * 6)}deg) rotate(${r(x * 2.5)}deg)`;
}

/**
 * @param areaRef zona onde o cursor é seguido (o painel do chat)
 * @param cabecaRef camada da cabeça; o elemento pai, que não roda, serve de referência
 * @param centro centro da cabeça em fracções da largura e altura do elemento pai
 */
export function useOlharCursor(
  areaRef: RefObject<HTMLElement | null>,
  cabecaRef: RefObject<HTMLElement | null>,
  centro: Ponto,
  activo: boolean,
) {
  const { x: centroX, y: centroY } = centro;

  useEffect(() => {
    const area = areaRef.current;
    const cabeca = cabecaRef.current;
    const referencia = cabeca?.parentElement;
    if (!activo || !area || !cabeca || !referencia) return;
    // Em ecrãs tácteis não há cursor permanente; com movimento reduzido, nada mexe.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let alvo = NEUTRO;
    const actual = { ...NEUTRO };
    let ultimoMovimento = 0;
    let anterior = 0;
    let frame = 0;

    function passo(agora: number) {
      const dt = anterior ? agora - anterior : 16;
      anterior = agora;
      if (agora - ultimoMovimento > PAUSA_MS) alvo = NEUTRO;
      const aVoltar = alvo === NEUTRO;

      // Aproxima-se do alvo uma fracção que depende do tempo passado, por isso a
      // velocidade é a mesma a 60 ou a 144 frames por segundo.
      const k = 1 - Math.exp(-dt / (aVoltar ? TAU_VOLTAR_MS : TAU_SEGUIR_MS));
      actual.x += (alvo.x - actual.x) * k;
      actual.y += (alvo.y - actual.y) * k;

      if (aVoltar && Math.abs(actual.x) < 0.002 && Math.abs(actual.y) < 0.002) {
        cabeca!.style.transform = "";
        frame = 0;
        anterior = 0;
        return;
      }
      cabeca!.style.transform = transformarCabeca(actual);
      frame = requestAnimationFrame(passo);
    }

    function arrancar() {
      if (!frame) frame = requestAnimationFrame(passo);
    }

    function aoMover(evento: PointerEvent) {
      if (evento.pointerType === "touch") return;
      const caixa = referencia!.getBoundingClientRect();
      alvo = calcularOlhar(
        { x: evento.clientX, y: evento.clientY },
        { x: caixa.left + caixa.width * centroX, y: caixa.top + caixa.height * centroY },
        area!.getBoundingClientRect(),
      );
      ultimoMovimento = performance.now();
      arrancar();
    }

    function aoSair() {
      alvo = NEUTRO;
      arrancar();
    }

    area.addEventListener("pointermove", aoMover);
    area.addEventListener("pointerleave", aoSair);
    return () => {
      area.removeEventListener("pointermove", aoMover);
      area.removeEventListener("pointerleave", aoSair);
      cancelAnimationFrame(frame);
      cabeca.style.transform = "";
    };
  }, [areaRef, cabecaRef, centroX, centroY, activo]);
}
