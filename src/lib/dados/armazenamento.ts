import { z } from "zod";

import {
  esquemaBolsa,
  esquemaMentoria,
  esquemaPagamento,
  esquemaSessao,
  esquemaUtilizador,
  type BaseDados,
} from "./modelos";

// Único ponto do projecto que toca no localStorage. Para trocar por uma API
// real, só esta camada (e o repositório por cima dela) precisa de mudar.

export const CHAVES = {
  utilizadores: "bolsaangola_users",
  bolsas: "bolsaangola_bolsas",
  mentorias: "bolsaangola_mentorias",
  pagamentos: "bolsaangola_pagamentos",
  sessao: "bolsaangola_session",
} as const satisfies Record<keyof BaseDados, string>;

// Favoritos guardados antes de existirem contas; migram para a conta no login.
const CHAVE_FAVORITOS_ANONIMOS = "bolsaangola:favoritos";

export type Colecao = keyof BaseDados;

const ESQUEMAS = {
  utilizadores: z.array(esquemaUtilizador),
  bolsas: z.array(esquemaBolsa),
  mentorias: z.array(esquemaMentoria),
  pagamentos: z.array(esquemaPagamento),
  sessao: esquemaSessao.nullable(),
} satisfies { [C in Colecao]: z.ZodType<BaseDados[C]> };

export class ErroArmazenamento extends Error {}

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    // Acesso bloqueado (ex.: definições de privacidade do browser).
    return null;
  }
}

export const armazenamentoDisponivel = () => storage() !== null;

export type Leitura<C extends Colecao> =
  | { estado: "em_falta" }
  | { estado: "invalido"; bruto: string }
  | { estado: "ok"; valor: BaseDados[C] };

export function ler<C extends Colecao>(colecao: C): Leitura<C> {
  const bruto = storage()?.getItem(CHAVES[colecao]) ?? null;
  if (bruto === null) return { estado: "em_falta" };
  try {
    const resultado = ESQUEMAS[colecao].safeParse(JSON.parse(bruto));
    if (resultado.success) return { estado: "ok", valor: resultado.data as BaseDados[C] };
    console.error(`[dados] ${CHAVES[colecao]} tem um formato inválido.`, resultado.error.issues);
  } catch (erro) {
    console.error(`[dados] ${CHAVES[colecao]} não é JSON válido.`, erro);
  }
  return { estado: "invalido", bruto };
}

export function escrever<C extends Colecao>(colecao: C, valor: BaseDados[C]) {
  const s = storage();
  if (!s) throw new ErroArmazenamento("O armazenamento do browser não está disponível.");
  try {
    if (valor === null) s.removeItem(CHAVES[colecao]);
    else s.setItem(CHAVES[colecao], JSON.stringify(valor));
  } catch (erro) {
    // Normalmente quota excedida (ex.: muitas fotos de perfil).
    throw new ErroArmazenamento("Não foi possível guardar os dados neste browser.", { cause: erro });
  }
}

// Guarda uma cópia do valor corrompido antes de o substituir, para não se perder.
export function guardarCopiaCorrompida(colecao: Colecao, bruto: string) {
  try {
    storage()?.setItem(`${CHAVES[colecao]}_corrompido`, bruto);
  } catch {
    // Sem espaço para a cópia: segue na mesma.
  }
}

export function lerFavoritosAnonimos(): string[] {
  try {
    const valor = JSON.parse(storage()?.getItem(CHAVE_FAVORITOS_ANONIMOS) ?? "[]");
    return Array.isArray(valor) ? valor.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function apagarFavoritosAnonimos() {
  try {
    storage()?.removeItem(CHAVE_FAVORITOS_ANONIMOS);
  } catch {
    // Ignorado: no pior caso, a migração repete-se sem duplicar.
  }
}

export function ehChaveDoSistema(chave: string | null) {
  return chave === null || Object.values(CHAVES).includes(chave as (typeof CHAVES)[Colecao]);
}
