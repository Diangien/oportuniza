import { createFileRoute } from "@tanstack/react-router";
import { Bookmark, GraduationCap, Heart, LayoutDashboard, UserRound } from "lucide-react";

import { PainelLayout, type ItemMenu } from "@/components/painel/PainelLayout";
import { exigirPerfil } from "@/lib/auth";

const ITENS: ItemMenu[] = [
  { to: "/cliente", rotulo: "Visão geral", icone: LayoutDashboard, exacto: true },
  { to: "/cliente/favoritas", rotulo: "Bolsas favoritas", icone: Heart },
  { to: "/cliente/bolsas", rotulo: "Bolsas associadas", icone: Bookmark },
  { to: "/cliente/mentorias", rotulo: "Mentorias", icone: GraduationCap },
  { to: "/cliente/perfil", rotulo: "Perfil", icone: UserRound },
];

export const Route = createFileRoute("/cliente")({
  ssr: false,
  beforeLoad: ({ location }) => exigirPerfil(["cliente"], location),
  head: () => ({ meta: [{ title: "A minha área — BolsaAngola" }, { name: "robots", content: "noindex" }] }),
  component: () => <PainelLayout tipo="cliente" titulo="A minha área" itens={ITENS} />,
});
