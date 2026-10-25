import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { MensagemErro, propsErro } from "@/components/formulario/MensagemErro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSessao } from "@/hooks/use-dados";
import { destinoAposLogin } from "@/lib/auth";
import { NOME_TIPO, ROTA_POR_TIPO } from "@/lib/catalogo";
import { iniciarSessao } from "@/lib/dados/repositorio";
import { esquemaLogin, validar, type ErrosDe } from "@/lib/validacao";

type PesquisaLogin = { redirect?: string; email?: string };

export const Route = createFileRoute("/login")({
  validateSearch: (pesquisa: Record<string, unknown>): PesquisaLogin => ({
    ...(typeof pesquisa["redirect"] === "string" && { redirect: pesquisa["redirect"] }),
    ...(typeof pesquisa["email"] === "string" && { email: pesquisa["email"] }),
  }),
  head: () => ({
    meta: [
      { title: "Entrar — BolsaAngola" },
      { name: "description", content: "Entre na sua conta BolsaAngola para acompanhar bolsas e mentorias." },
      { property: "og:title", content: "Entrar — BolsaAngola" },
      { property: "og:description", content: "Aceda à sua conta BolsaAngola." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Login,
});

function Login() {
  const { redirect, email: emailInicial } = Route.useSearch();
  const navigate = useNavigate();
  const { utilizador, terminar } = useSessao();
  const [erros, setErros] = useState<ErrosDe<typeof esquemaLogin>>({});
  const [falhou, setFalhou] = useState(false);

  const aoSubmeter = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const campos = new FormData(e.currentTarget);
    const resultado = validar(esquemaLogin, { email: campos.get("email"), senha: campos.get("senha") });
    setFalhou(false);
    if (!resultado.ok) return setErros(resultado.erros);
    setErros({});

    const autenticado = iniciarSessao(resultado.dados.email, resultado.dados.senha);
    // Mensagem genérica: não revela se o e-mail existe ou não.
    if (!autenticado) return setFalhou(true);
    toast.success(`Olá, ${autenticado.nome.split(" ")[0]}.`);
    void navigate({ href: destinoAposLogin(autenticado, redirect) });
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-md px-5 py-16">
        <h1 className="font-display text-4xl font-semibold">Entrar</h1>
        <p className="mt-2 text-muted-foreground">Bem-vindo de volta. Use o e-mail com que se registou.</p>

        {utilizador ? (
          <div className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6">
            <p className="text-sm">
              Já tem sessão iniciada como <strong className="font-semibold">{utilizador.nome}</strong> (
              {NOME_TIPO[utilizador.tipo].toLowerCase()}).
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to={ROTA_POR_TIPO[utilizador.tipo]}>Ir para a minha área</Link>
              </Button>
              <Button variant="outline" onClick={terminar}>
                Terminar sessão
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={aoSubmeter} noValidate className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6">
            {falhou && (
              <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                E-mail ou palavra-passe incorrectos. Verifique os dados e tente novamente.
              </p>
            )}
            <label className="block text-sm font-medium">
              E-mail
              <Input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="nome@exemplo.ao"
                defaultValue={emailInicial}
                className="mt-1.5"
                {...propsErro("email", erros.email)}
              />
              <MensagemErro id="email-erro">{erros.email}</MensagemErro>
            </label>
            <label className="block text-sm font-medium">
              <span className="flex items-center justify-between">
                Palavra-passe
                <button
                  type="button"
                  onClick={() =>
                    toast.info("A recuperação de palavra-passe ainda não está disponível. Contacte o administrador.")
                  }
                  className="text-xs font-normal text-primary hover:underline"
                >
                  Esqueci a palavra-passe
                </button>
              </span>
              <Input
                name="senha"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                autoFocus={Boolean(emailInicial)}
                className="mt-1.5"
                {...propsErro("senha", erros.senha)}
              />
              <MensagemErro id="senha-erro">{erros.senha}</MensagemErro>
            </label>
            <Button type="submit" size="lg" className="w-full">Entrar</Button>
          </form>
        )}

        <div className="mt-6 flex items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">Ainda não tem conta?</span>
          <Button asChild variant="outline">
            <Link to="/registo">Criar conta</Link>
          </Button>
        </div>
        <p className="mt-10 text-sm text-muted-foreground">
          Só quer espreitar? <Link to="/bolsas" className="text-primary hover:underline">Consulte as bolsas sem entrar</Link>.
        </p>
      </main>
    </div>
  );
}
