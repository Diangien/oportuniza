import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { CampoFoto } from "@/components/formulario/CampoFoto";
import { MensagemErro, propsErro } from "@/components/formulario/MensagemErro";
import { SeletorAreas } from "@/components/formulario/SeletorAreas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { GRAUS } from "@/lib/catalogo";
import { criarUtilizador, ErroDados, iniciarSessao } from "@/lib/dados/repositorio";
import { erroDeCampo, esquemaRegisto, validar, type ErrosDe } from "@/lib/validacao";

type Erros = ErrosDe<typeof esquemaRegisto>;

export const Route = createFileRoute("/registo")({
  head: () => ({
    meta: [
      { title: "Criar conta — BolsaAngola" },
      { name: "description", content: "Crie a sua conta BolsaAngola para guardar bolsas favoritas, receber alertas de prazo e pedir mentoria." },
      { property: "og:title", content: "Criar conta — BolsaAngola" },
      { property: "og:description", content: "Registe-se no BolsaAngola e acompanhe as bolsas que lhe interessam." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Registo,
});

const PROMESAS = [
  "Bolsas internas e externas reunidas num só lugar",
  "Alertas antes de cada prazo de candidatura",
  "Mentores que já passaram pelo mesmo processo",
];

function medeForca(passe: string) {
  let pontos = 0;
  if (passe.length >= 8) pontos += 1;
  if (/[A-Z]/.test(passe) && /[0-9]/.test(passe)) pontos += 1;
  if (passe.length >= 12 || /[^A-Za-z0-9]/.test(passe)) pontos += 1;
  return pontos;
}

function Registo() {
  const navigate = useNavigate();
  const [foto, setFoto] = useState<string | null>(null);
  const [areas, setAreas] = useState<string[]>([]);
  const [passe, setPasse] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [verPasse, setVerPasse] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);
  const [erros, setErros] = useState<Erros>({});
  const [aEnviar, setAEnviar] = useState(false);

  const forca = medeForca(passe);
  const coincide = confirmar.length > 0 && passe === confirmar;

  const etiqueta = "block text-sm font-medium";
  const titulo = "mb-1.5 flex items-baseline justify-between gap-3";

  const mostraErros = (form: HTMLFormElement, novos: Erros) => {
    setErros(novos);
    // Leva o foco ao primeiro campo com erro, depois de o React o marcar.
    requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
  };

  const aoSubmeter = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const campos = new FormData(form);
    const resultado = validar(esquemaRegisto, {
      nome: campos.get("nome"),
      email: campos.get("email"),
      senha: passe,
      confirmar,
      grauAcademico: (campos.get("grau") as string) || null,
      areasInteresse: areas,
      aceito: campos.get("aceito") === "on",
    });
    if (!resultado.ok) return mostraErros(form, resultado.erros);

    const { nome, email, senha, grauAcademico, areasInteresse } = resultado.dados;
    setAEnviar(true);
    try {
      criarUtilizador({ tipo: "cliente", nome, email, senha, grauAcademico, areasInteresse, fotoPerfil: foto });
      iniciarSessao(email, senha);
      toast.success("Conta criada com sucesso.");
      void navigate({ to: "/cliente" });
    } catch (erro) {
      setAEnviar(false);
      if (erro instanceof ErroDados && erro.campo) return mostraErros(form, erroDeCampo(erro.campo, erro.message));
      toast.error(erro instanceof Error ? erro.message : "Não foi possível criar a conta.");
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-12 md:py-16">
        <div className="grid overflow-hidden rounded-3xl border border-border bg-card shadow-card lg:grid-cols-[290px_minmax(0,1fr)]">
          <aside className="relative hidden overflow-hidden bg-muted p-9 lg:flex lg:flex-col lg:justify-between">
            <div aria-hidden className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/5" />
            <div aria-hidden className="absolute -bottom-28 -left-20 h-60 w-60 rounded-full bg-accent/25" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">BolsaAngola</p>
              <h2 className="mt-5 font-display text-3xl font-semibold leading-snug">Comece pela bolsa certa.</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Com uma conta guarda as bolsas que lhe interessam, é avisada dos prazos e pode pedir mentoria a quem já se candidatou.
              </p>
            </div>
            <ol className="relative mt-10 space-y-4 text-sm">
              {PROMESAS.map((p, i) => (
                <li key={p} className="flex gap-3">
                  <span className="font-display text-primary">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-muted-foreground">{p}</span>
                </li>
              ))}
            </ol>
            <p className="relative mt-10 border-t border-border pt-5 text-xs text-muted-foreground">
              Protótipo: os dados ficam guardados apenas neste browser.
            </p>
          </aside>

          <section className="p-6 sm:p-9 md:p-12">
            <h1 className="font-display text-4xl font-semibold">Criar conta</h1>
            <p className="mt-2 text-muted-foreground">Leva menos de um minuto.</p>

            <form onSubmit={aoSubmeter} noValidate className="mt-9 space-y-6">
              <label className={etiqueta}>
                <span className={titulo}>Nome completo</span>
                <Input
                  id="nome"
                  name="nome"
                  required
                  autoComplete="name"
                  placeholder="Jose Bongo Nkana"
                  {...propsErro("nome", erros.nome)}
                />
                <MensagemErro id="nome-erro">{erros.nome}</MensagemErro>
              </label>

              <label className={etiqueta}>
                <span className={titulo}>E-mail</span>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="nome@exemplo.ao"
                  {...propsErro("email", erros.email)}
                />
                <MensagemErro id="email-erro">{erros.email}</MensagemErro>
              </label>

              <div className="grid gap-6 sm:grid-cols-2">
                <label className={etiqueta}>
                  <span className={titulo}>Palavra-passe</span>
                  <span className="relative block">
                    <Input
                      id="senha"
                      name="senha"
                      type={verPasse ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      placeholder="mínimo 8 caracteres"
                      onChange={(e) => setPasse(e.target.value)}
                      className="pr-11"
                      {...propsErro("senha", erros.senha)}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setVerPasse((v) => !v)}
                      aria-label={verPasse ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
                      className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {verPasse ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </span>
                  <span className="mt-2.5 flex items-center gap-2.5">
                    <span className="flex flex-1 gap-1.5" aria-hidden>
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${i < forca ? "bg-primary" : "bg-border"}`}
                        />
                      ))}
                    </span>
                    <span className="w-12 text-xs text-muted-foreground">
                      {["Fraca", "Fraca", "Média", "Boa"][forca]}
                    </span>
                  </span>
                  <MensagemErro id="senha-erro">{erros.senha}</MensagemErro>
                </label>

                <label className={etiqueta}>
                  <span className={titulo}>Confirmar palavra-passe</span>
                  <span className="relative block">
                    <Input
                      id="confirmar"
                      name="confirmar"
                      type={verConfirmar ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      placeholder="repita a palavra-passe"
                      onChange={(e) => setConfirmar(e.target.value)}
                      className="pr-11"
                      {...propsErro("confirmar", erros.confirmar)}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setVerConfirmar((v) => !v)}
                      aria-label={verConfirmar ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
                      className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {verConfirmar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </span>
                  {erros.confirmar ? (
                    <MensagemErro id="confirmar-erro">{erros.confirmar}</MensagemErro>
                  ) : (
                    <span className={`mt-2 block text-xs ${coincide ? "text-primary" : "text-transparent"}`}>
                      As palavras-passe coincidem
                    </span>
                  )}
                </label>
              </div>

              <label className={etiqueta}>
                <span className={titulo}>
                  Grau académico <span className="text-xs font-normal text-muted-foreground">opcional</span>
                </span>
                <NativeSelect id="grau" name="grau" defaultValue="">
                  <option value="">Escolha o seu grau</option>
                  {GRAUS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </NativeSelect>
              </label>

              <SeletorAreas valor={areas} onChange={setAreas} />

              <CampoFoto valor={foto} onChange={setFoto} />

              <div>
                <label className="flex items-start gap-3 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    name="aceito"
                    required
                    className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                    {...propsErro("aceito", erros.aceito)}
                  />
                  <span>
                    Aceito os{" "}
                    {/* Novo separador: o formulário mantém o que já foi preenchido. Clicar num
                        link dentro do <label> não altera a caixa de aceitação. */}
                    <Link
                      to="/termos"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      termos de utilização e a política de privacidade
                      <span className="sr-only"> (abre num novo separador)</span>
                    </Link>{" "}
                    do BolsaAngola.
                  </span>
                </label>
                <MensagemErro id="aceito-erro">{erros.aceito}</MensagemErro>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={aEnviar}>
                {aEnviar ? "A criar conta…" : "Criar conta"}
              </Button>
            </form>

            <div className="mt-7 flex items-center justify-between gap-3 border-t border-border pt-6 text-sm">
              <span className="text-muted-foreground">Já tem conta?</span>
              <Button asChild variant="outline">
                <Link to="/login">Entrar</Link>
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
