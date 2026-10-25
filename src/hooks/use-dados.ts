import { useMemo, useSyncExternalStore } from "react";

import { ESTADO_SERVIDOR, obterEstado, subscrever } from "@/lib/dados/estado";
import { terminarSessao, utilizadorDaSessao } from "@/lib/dados/repositorio";

// Devolve o estado inteiro. A referência só muda quando os dados mudam, por
// isso é seguro para o useSyncExternalStore. Filtre e ordene com useMemo no
// componente: devolver arrays novos daqui provocaria renders infinitos.
export function useDados() {
  return useSyncExternalStore(subscrever, obterEstado, () => ESTADO_SERVIDOR);
}

export function useSessao() {
  const dados = useDados();
  const utilizador = useMemo(() => utilizadorDaSessao(dados), [dados]);
  return { utilizador, dados, terminar: terminarSessao };
}

// Atalhos para as áreas do cliente e do mentor (o layout já garante o perfil).
export function useCliente() {
  const { utilizador, dados } = useSessao();
  return { cliente: utilizador?.tipo === "cliente" ? utilizador : null, dados };
}

export function useMentor() {
  const { utilizador, dados } = useSessao();
  return { mentor: utilizador?.tipo === "mentor" ? utilizador : null, dados };
}
