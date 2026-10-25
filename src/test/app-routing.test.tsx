import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("matches the scholarship details page for /bolsas/1", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/bolsas/1");

    expect(matches.at(-1)?.routeId).toBe("/bolsas/$id");
    expect(matches.at(-1)?.params).toMatchObject({ id: "1" });
  });

  it.each([
    ["/admin", "/admin/"],
    ["/admin/utilizadores/abc", "/admin/utilizadores/$id"],
    ["/mentor/clientes/abc", "/mentor/clientes/$id"],
    ["/cliente/mentorias", "/cliente/mentorias"],
  ])("matches the private area page for %s", (caminho, rota) => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    expect(router.matchRoutes(caminho).at(-1)?.routeId).toBe(rota);
  });

  it("matches the terms page for /termos", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/termos");

    expect(matches.at(-1)?.routeId).toBe("/termos");
  });
});
