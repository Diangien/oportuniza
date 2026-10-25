import { useCallback } from "react";

import { useSessao } from "@/hooks/use-dados";
import { alternarFavorita } from "@/lib/dados/repositorio";

// Favoritos do cliente com sessão iniciada (guardados na conta). Sem sessão de
// cliente, `precisaSessao` é true e quem usa o hook leva a pessoa ao login.
export function useFavoritos() {
  const { utilizador } = useSessao();
  const cliente = utilizador?.tipo === "cliente" ? utilizador : null;

  const eFavorita = useCallback((id: string) => cliente?.bolsasFavoritas.includes(id) ?? false, [cliente]);

  // Devolve true se a bolsa ficou nos favoritos.
  const alterna = useCallback(
    (id: string) => (cliente ? alternarFavorita(cliente.id, id) : false),
    [cliente],
  );

  return { eFavorita, alterna, precisaSessao: !cliente, temSessao: utilizador !== null };
}
