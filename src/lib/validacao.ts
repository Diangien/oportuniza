import { z } from "zod";

import { METODOS_PAGAMENTO, TIPOS_UTILIZADOR } from "@/lib/dados/modelos";

// Esquemas dos formulários, partilhados entre registo, login e painéis.
// A unicidade do e-mail é verificada no repositório, porque depende dos dados.

const nome = z.string().trim().min(3, "Indique o nome completo.");
const email = z.string().trim().min(1, "Indique o e-mail.").email("Indique um e-mail válido, por exemplo nome@exemplo.ao.");
// Contas criadas pelo admin aceitam 4 caracteres (como as de demonstração,
// "1234"); o registo público pede 8, como indica o formulário.
const senha = z.string().min(4, "A palavra-passe deve ter pelo menos 4 caracteres.");
const senhaRegisto = z.string().min(8, "A palavra-passe deve ter pelo menos 8 caracteres.");
const grauAcademico = z.string().nullable();
const areasInteresse = z.array(z.string());

export const esquemaLogin = z.object({
  email,
  senha: z.string().min(1, "Indique a palavra-passe."),
});

export const esquemaRegisto = z
  .object({
    nome,
    email,
    senha: senhaRegisto,
    confirmar: z.string(),
    grauAcademico,
    areasInteresse,
    aceito: z.literal(true, { errorMap: () => ({ message: "Tem de aceitar os termos para criar conta." }) }),
  })
  .refine((d) => d.senha === d.confirmar, { path: ["confirmar"], message: "As palavras-passe não coincidem." });

// Criação e edição pelo administrador. Ao editar, a palavra-passe pode ficar
// vazia para manter a actual.
export const esquemaUtilizador = (modo: "criar" | "editar") =>
  z.object({
    tipo: z.enum(TIPOS_UTILIZADOR),
    nome,
    email,
    senha: modo === "criar" ? senha : z.union([z.literal(""), senha]),
    grauAcademico,
    areasInteresse,
    ativo: z.boolean(),
  });

export const esquemaPerfil = z.object({ nome, email, grauAcademico, areasInteresse });

export const esquemaNovaSenha = z
  .object({ senhaActual: z.string().min(1, "Indique a palavra-passe actual."), senha, confirmar: z.string() })
  .refine((d) => d.senha === d.confirmar, { path: ["confirmar"], message: "As palavras-passe não coincidem." });

export const esquemaPagamento = z.object({
  metodo: z.enum(METODOS_PAGAMENTO, { errorMap: () => ({ message: "Escolha o método de pagamento." }) }),
  referencia: z.string().trim().min(4, "Indique a referência da transacção (mínimo 4 caracteres)."),
});

// Um erro por campo do esquema (com nomes verificados pelo TypeScript).
export type ErrosDe<T extends z.ZodTypeAny> = Partial<Record<Extract<keyof z.input<T>, string>, string>>;

// Valida e devolve os dados limpos ou um erro por campo (o primeiro de cada).
export function validar<T extends z.ZodTypeAny>(
  esquema: T,
  dados: unknown,
): { ok: true; dados: z.infer<T> } | { ok: false; erros: ErrosDe<T> } {
  const resultado = esquema.safeParse(dados);
  if (resultado.success) return { ok: true, dados: resultado.data };
  const erros: Record<string, string> = {};
  for (const problema of resultado.error.issues) {
    const campo = String(problema.path[0] ?? "formulario");
    erros[campo] ??= problema.message;
  }
  return { ok: false, erros: erros as ErrosDe<T> };
}

// Erro de um campo vindo do repositório (ex.: e-mail já registado).
export const erroDeCampo = <T extends z.ZodTypeAny>(campo: string, mensagem: string) =>
  ({ [campo]: mensagem }) as ErrosDe<T>;
