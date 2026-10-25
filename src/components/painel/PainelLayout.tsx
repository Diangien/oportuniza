import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, type LucideIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { AvatarUtilizador } from "@/components/painel/AvatarUtilizador";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSessao } from "@/hooks/use-dados";
import { NOME_TIPO } from "@/lib/catalogo";
import type { TipoUtilizador } from "@/lib/dados/modelos";

export type ItemMenu = { to: string; rotulo: string; icone: LucideIcon; exacto?: boolean };

// Layout comum às três áreas privadas: sidebar com o menu do perfil + página.
export function PainelLayout({
  tipo,
  titulo,
  itens,
}: {
  tipo: TipoUtilizador;
  titulo: string;
  itens: ItemMenu[];
}) {
  const { utilizador, terminar } = useSessao();
  const navigate = useNavigate();
  const aSair = useRef(false);

  // Se a sessão terminar noutro separador (ou o perfil mudar), sai da área
  // privada. O beforeLoad da rota já trata da primeira entrada.
  useEffect(() => {
    if (aSair.current) return;
    if (!utilizador || utilizador.tipo !== tipo) void navigate({ to: "/login", replace: true });
  }, [utilizador, tipo, navigate]);

  if (!utilizador || utilizador.tipo !== tipo) return null;

  const sair = () => {
    aSair.current = true;
    terminar();
    toast.success("Sessão terminada.");
    void navigate({ to: "/" });
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="px-4 py-5">
          <Link to="/" className="font-display text-xl font-semibold">
            Bolsa<span className="text-primary">Angola</span>
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{titulo}</p>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <MenuPainel itens={itens} />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 px-1 py-2">
            <AvatarUtilizador utilizador={utilizador} />
            <div className="min-w-0 text-sm">
              <p className="truncate font-medium">{utilizador.nome}</p>
              <p className="truncate text-xs text-muted-foreground">{NOME_TIPO[utilizador.tipo]}</p>
            </div>
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={sair} className="h-10 rounded-xl text-muted-foreground">
                <LogOut />
                <span>Terminar sessão</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/80 px-5 py-3 backdrop-blur md:hidden">
          <SidebarTrigger aria-label="Abrir menu" />
          <span className="font-display text-lg font-semibold">
            Bolsa<span className="text-primary">Angola</span>
          </span>
        </header>
        <main className="mx-auto w-full max-w-6xl px-5 py-8 md:py-10">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function MenuPainel({ itens }: { itens: ItemMenu[] }) {
  const caminho = useRouterState({ select: (s) => s.location.pathname });
  const { setOpenMobile } = useSidebar();
  const activo = (item: ItemMenu) =>
    item.exacto ? caminho === item.to || caminho === `${item.to}/` : caminho.startsWith(item.to);

  return (
    <SidebarMenu className="gap-1">
      {itens.map((item) => (
        <SidebarMenuItem key={item.to}>
          <SidebarMenuButton asChild isActive={activo(item)} className="h-10 rounded-xl">
            {/* No telemóvel, fecha a gaveta ao escolher uma página. */}
            <Link to={item.to} onClick={() => setOpenMobile(false)}>
              <item.icone />
              <span>{item.rotulo}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
