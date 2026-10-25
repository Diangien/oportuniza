import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SlideUpText, atrasoDe } from "@/components/slide-up-text";

const opcoes = { stagger: 0.1, delay: 0 };
// Arredonda para evitar diferenças de vírgula flutuante (0.1 * 3 = 0.30000000000000004).
const arredonda = (valores: number[]) => valores.map((v) => Math.round(v * 1000) / 1000);

describe("SlideUpText", () => {
  it("mantém o texto inteiro para leitores de ecrã e cria uma peça por palavra", () => {
    const { container } = render(<SlideUpText>A sua próxima bolsa</SlideUpText>);

    expect(container.querySelector(".sr-only")?.textContent).toBe("A sua próxima bolsa");
    expect(container.querySelectorAll(".animate-slide-up")).toHaveLength(4);
  });

  it("anima só com CSS, sem esconder o texto com estilos inline", () => {
    const { container } = render(<SlideUpText delay={0.6}>em Angola</SlideUpText>);
    const pecas = [...container.querySelectorAll<HTMLElement>(".animate-slide-up")];

    expect(pecas.every((p) => !p.style.transform)).toBe(true);
    expect(pecas[0]?.style.animationDelay).toBe("0.6s");
  });
});

describe("atrasoDe", () => {
  it("from=first: a onda parte da primeira peça", () => {
    expect(arredonda([0, 1, 2, 3].map((i) => atrasoDe(i, 4, { ...opcoes, from: "first" })))).toEqual([0, 0.1, 0.2, 0.3]);
  });

  it("from=last: a onda parte da última peça", () => {
    expect(arredonda([0, 1, 2, 3].map((i) => atrasoDe(i, 4, { ...opcoes, from: "last" })))).toEqual([0.3, 0.2, 0.1, 0]);
  });

  it("from=center: a onda parte do centro para as pontas", () => {
    expect(arredonda([0, 1, 2, 3, 4].map((i) => atrasoDe(i, 5, { ...opcoes, from: "center" })))).toEqual([0.2, 0.1, 0, 0.1, 0.2]);
  });

  it("soma o delay inicial", () => {
    expect(atrasoDe(2, 4, { stagger: 0.1, delay: 0.6, from: "first" })).toBeCloseTo(0.8);
  });
});
