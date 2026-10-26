import { describe, expect, it } from "vitest";

import { calcularOlhar, transformarCabeca } from "@/hooks/use-olhar-cursor";

// Painel de 400×600 com a cabeça perto do canto superior esquerdo, como no chat.
const area = { left: 0, top: 0, right: 400, bottom: 600 };
const centro = { x: 100, y: 100 };

describe("calcularOlhar", () => {
  it("dá 0 com o cursor no centro da cabeça", () => {
    expect(calcularOlhar(centro, centro, area)).toEqual({ x: 0, y: 0 });
  });

  it.each([
    ["direita", { x: 250, y: 100 }, { x: 0.5, y: 0 }],
    ["esquerda", { x: 50, y: 100 }, { x: -0.5, y: 0 }],
    ["cima", { x: 100, y: 50 }, { x: 0, y: -0.5 }],
    ["baixo", { x: 100, y: 350 }, { x: 0, y: 0.5 }],
    ["diagonal", { x: 400, y: 0 }, { x: 1, y: -1 }],
  ])("olha para a %s", (_, cursor, esperado) => {
    expect(calcularOlhar(cursor, centro, area)).toEqual(esperado);
  });

  it("chega ao máximo na borda mais próxima, apesar de a cabeça estar no canto", () => {
    expect(calcularOlhar({ x: 0, y: 100 }, centro, area).x).toBe(-1);
    expect(calcularOlhar({ x: 400, y: 100 }, centro, area).x).toBe(1);
  });

  it("nunca passa de -1 a 1, mesmo com o cursor fora da área", () => {
    const { x, y } = calcularOlhar({ x: 5000, y: -5000 }, centro, area);
    expect(x).toBe(1);
    expect(y).toBe(-1);
  });
});

describe("transformarCabeca", () => {
  it("roda para o lado do cursor dentro de amplitudes pequenas", () => {
    expect(transformarCabeca({ x: 1, y: 1 })).toBe(
      "perspective(500px) translate(2%, 1.5%) rotateY(9deg) rotateX(-6deg) rotate(2.5deg)",
    );
    expect(transformarCabeca({ x: -1, y: -1 })).toContain("rotateY(-9deg) rotateX(6deg)");
  });
});
