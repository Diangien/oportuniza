import { ehChaveDoSistema, escrever, ler, type Colecao } from "./armazenamento";
import { garantirDados } from "./inicializar";
import type { BaseDados } from "./modelos";
import { copiar } from "./util";

// Estado em memória, espelho do localStorage. Cada escrita substitui o objeto
// inteiro, por isso a interface (useSyncExternalStore) sabe que algo mudou
// comparando referências, e volta a desenhar logo, sem recarregar a página.

const COLECOES: Colecao[] = ["utilizadores", "bolsas", "mentorias", "pagamentos", "sessao"];

// No servidor não há localStorage: as páginas privadas só correm no browser
// (ssr: false) e as públicas mostram o estado "sem sessão".
export const ESTADO_SERVIDOR: BaseDados = Object.freeze({
  utilizadores: [],
  bolsas: [],
  mentorias: [],
  pagamentos: [],
  sessao: null,
}) as BaseDados;

let estado: BaseDados | null = null;
const ouvintes = new Set<() => void>();

function lerTudo(): BaseDados {
  const valor = <C extends Colecao>(c: C) => {
    const leitura = ler(c);
    return leitura.estado === "ok" ? leitura.valor : ESTADO_SERVIDOR[c];
  };
  return {
    utilizadores: valor("utilizadores"),
    bolsas: valor("bolsas"),
    mentorias: valor("mentorias"),
    pagamentos: valor("pagamentos"),
    sessao: valor("sessao"),
  };
}

function notificar() {
  for (const ouvinte of ouvintes) ouvinte();
}

export function obterEstado(): BaseDados {
  if (typeof window === "undefined") return ESTADO_SERVIDOR;
  if (!estado) {
    garantirDados();
    estado = lerTudo();
    // Alterações feitas noutro separador (ex.: terminar sessão) chegam por aqui.
    window.addEventListener("storage", (evento) => {
      if (!ehChaveDoSistema(evento.key)) return;
      estado = lerTudo();
      notificar();
    });
  }
  return estado;
}

export function subscrever(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

// Aplica alterações a uma cópia do estado e grava só as colecções que mudaram.
// Se uma escrita falhar, repõe as que já tinham sido gravadas e lança o erro,
// para o estado em memória e o localStorage nunca ficarem diferentes.
export function transaccao<T>(alterar: (rascunho: BaseDados) => T): T {
  const actual = obterEstado();
  const rascunho = copiar(actual);
  const resultado = alterar(rascunho);

  const alteradas = COLECOES.filter((c) => JSON.stringify(rascunho[c]) !== JSON.stringify(actual[c]));
  const gravadas: Colecao[] = [];
  try {
    for (const c of alteradas) {
      escrever(c, rascunho[c]);
      gravadas.push(c);
    }
  } catch (erro) {
    for (const c of gravadas) {
      try {
        escrever(c, actual[c]);
      } catch {
        // Se nem a reposição funciona, o próximo arranque lê o que lá estiver.
      }
    }
    throw erro;
  }

  if (alteradas.length > 0) {
    estado = rascunho;
    notificar();
  }
  return resultado;
}

// Volta a ler tudo do localStorage (usado depois de repor os dados de exemplo).
export function recarregarEstado() {
  if (typeof window === "undefined") return;
  estado = lerTudo();
  notificar();
}

// Só para testes: esquece o estado em memória.
export function _reiniciarParaTestes() {
  estado = null;
}
