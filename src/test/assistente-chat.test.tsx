import { act, fireEvent, render, screen } from "@testing-library/react";
import { RouterProvider, createMemoryHistory, createRootRoute, createRouter } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { AssistenteChat } from "@/components/AssistenteChat";
import { mostraAssistente } from "@/lib/assistente";

// Router mínimo só com o assistente: o routeTree real carregaria páginas,
// dados e estilos que este teste não precisa.
async function renderAssistente() {
  const router = createRouter({
    routeTree: createRootRoute({ component: AssistenteChat }),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  render(<RouterProvider router={router} />);
  return screen.findByRole("button", { name: "Abrir assistente da BolsaAngola" });
}

describe("mostraAssistente", () => {
  it.each(["/", "/bolsas", "/bolsas/1", "/mentorias", "/registo", "/termos", "/mentorias-extra"])(
    "aparece na página pública %s",
    (caminho) => expect(mostraAssistente(caminho)).toBe(true),
  );

  it.each(["/admin", "/admin/utilizadores/x", "/cliente", "/cliente/perfil", "/mentor", "/mentor/clientes/x"])(
    "não aparece na área privada %s",
    (caminho) => expect(mostraAssistente(caminho)).toBe(false),
  );
});

describe("AssistenteChat", () => {
  it("começa só com o botão flutuante e abre com as boas-vindas e as perguntas", async () => {
    const botao = await renderAssistente();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(botao).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(botao);

    const painel = screen.getByRole("dialog", { name: /Olá! Sou o assistente da BolsaAngola/ });
    expect(painel).toHaveTextContent("Queres estudar em Angola ou no estrangeiro?");
    expect(painel).toHaveTextContent("Escolhe uma pergunta para começar:");
    expect(screen.getByRole("button", { name: /encontrar uma bolsa de estudo/ })).toHaveFocus();
  });

  it("responde à pergunta escolhida e mantém a conversa ao fechar e reabrir", async () => {
    fireEvent.click(await renderAssistente());

    fireEvent.click(screen.getByRole("button", { name: "Como funcionam as mentorias e quanto custam?" }));

    expect(screen.getByText(/três modalidades de mentoria/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver mentorias e preços" })).toHaveAttribute("href", "/mentorias");

    fireEvent.click(screen.getByRole("button", { name: "Fechar assistente" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Abrir assistente da BolsaAngola" })).toHaveFocus();

    fireEvent.click(screen.getByRole("button", { name: "Abrir assistente da BolsaAngola" }));
    expect(screen.getByText(/três modalidades de mentoria/)).toBeInTheDocument();
  });

  it("mostra a ligação para o registo na pergunta sobre bolsas", async () => {
    fireEvent.click(await renderAssistente());

    fireEvent.click(screen.getByRole("button", { name: /encontrar uma bolsa de estudo/ }));

    expect(screen.getByText(/recomendamos que cries uma conta/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute("href", "/registo");
  });

  it("mostra o personagem e deixa a cabeça parada sem rato (ecrã táctil)", async () => {
    // No setup dos testes, matchMedia responde sempre "não": é como um telemóvel.
    fireEvent.click(await renderAssistente());
    const painel = screen.getByRole("dialog");
    const cabeca = painel.querySelector<HTMLImageElement>('img[src*="cabeca"]');

    expect(cabeca).toBeInTheDocument();
    expect(cabeca?.closest("[aria-hidden]")).not.toBeNull();

    fireEvent.pointerMove(painel, { clientX: 300, clientY: 300 });
    expect(cabeca?.style.transform).toBe("");
  });

  it("fecha com Escape e recomeça a conversa", async () => {
    fireEvent.click(await renderAssistente());
    fireEvent.click(screen.getByRole("button", { name: /encontrar uma bolsa de estudo/ }));

    fireEvent.click(screen.getByRole("button", { name: "Recomeçar" }));
    expect(screen.queryByText(/recomendamos que cries uma conta/)).not.toBeInTheDocument();

    act(() => {
      fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
