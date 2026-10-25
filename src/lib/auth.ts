import { redirect } from "@tanstack/react-router";

import { ROTA_POR_TIPO } from "@/lib/catalogo";
import type { TipoUtilizador, Utilizador } from "@/lib/dados/modelos";
import { utilizadorDaSessao } from "@/lib/dados/repositorio";

// Guarda das áreas privadas, usada no beforeLoad das rotas /admin, /mentor e
// /cliente (que correm só no browser: ssr: false).
// ATENÇÃO: isto é apenas uma simulação no front-end. Com um backend real, cada
// pedido tem de ser autorizado também no servidor.
export function exigirPerfil(tipos: TipoUtilizador[], destino: { href: string }) {
  const utilizador = utilizadorDaSessao();
  if (!utilizador) throw redirect({ to: "/login", search: { redirect: destino.href } });
  if (!tipos.includes(utilizador.tipo)) throw redirect({ to: ROTA_POR_TIPO[utilizador.tipo] });
  return { utilizador };
}

// Para onde ir depois do login: o endereço pedido, se for interno e pertencer
// à área deste perfil; senão, a dashboard do perfil.
export function destinoAposLogin(utilizador: Utilizador, pedido?: string) {
  const interno = pedido?.startsWith("/") && !pedido.startsWith("//");
  const areaPrivada = Object.values(ROTA_POR_TIPO).find((rota) => pedido === rota || pedido?.startsWith(`${rota}/`));
  if (interno && (!areaPrivada || areaPrivada === ROTA_POR_TIPO[utilizador.tipo])) return pedido as string;
  return ROTA_POR_TIPO[utilizador.tipo];
}
