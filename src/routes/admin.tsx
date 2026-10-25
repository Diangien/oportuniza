import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, LayoutDashboard, UserRound, Users } from "lucide-react";

import { PainelLayout, type ItemMenu } from "@/components/painel/PainelLayout";
import { exigirPerfil } from "@/lib/auth";

const ITENS: ItemMenu[] = [
  { to: "/admin", rotulo: "Visão geral", icone: LayoutDashboard, exacto: true },
  { to: "/admin/utilizadores", rotulo: "Utilizadores", icone: Users },
  { to: "/admin/mentorias", rotulo: "Mentorias e pagamentos", icone: CreditCard },
  { to: "/admin/perfil", rotulo: "Perfil", icone: UserRound },
];

export const Route = createFileRoute("/admin")({
  // Só no browser: a sessão vive no localStorage, que o servidor não vê.
  ssr: false,
  beforeLoad: ({ location }) => exigirPerfil(["admin"], location),
  head: () => ({ meta: [{ title: "Administração — BolsaAngola" }, { name: "robots", content: "noindex" }] }),
  component: () => <PainelLayout tipo="admin" titulo="Administração" itens={ITENS} />,
});
