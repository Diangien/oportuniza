import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard, UserRound, Users } from "lucide-react";

import { PainelLayout, type ItemMenu } from "@/components/painel/PainelLayout";
import { exigirPerfil } from "@/lib/auth";

const ITENS: ItemMenu[] = [
  { to: "/mentor", rotulo: "Visão geral", icone: LayoutDashboard, exacto: true },
  { to: "/mentor/clientes", rotulo: "Clientes", icone: Users },
  { to: "/mentor/perfil", rotulo: "Perfil", icone: UserRound },
];

export const Route = createFileRoute("/mentor")({
  ssr: false,
  beforeLoad: ({ location }) => exigirPerfil(["mentor"], location),
  head: () => ({ meta: [{ title: "Área do mentor — BolsaAngola" }, { name: "robots", content: "noindex" }] }),
  component: () => <PainelLayout tipo="mentor" titulo="Área do mentor" itens={ITENS} />,
});
