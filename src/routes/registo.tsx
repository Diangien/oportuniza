import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, Check, ChevronDown, Eye, EyeOff, Trash2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

const GRAUS = ["Licenciatura", "Mestrado", "Doutoramento", "Phd", "Ensino Médio"];

const AREAS = [
  "Tecnologia",
  "Engenharia",
  "Saúde",
  "Gestão",
  "Educação",
  "Direito",
  "Ciências Sociais",
  "Ambiente",
  "Artes",
  "Ciências Exactas",
];

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
  const [foto, setFoto] = useState<string | null>(null);
  const [nomeFoto, setNomeFoto] = useState("");
  const [areas, setAreas] = useState<string[]>([]);
  const [passe, setPasse] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [verPasse, setVerPasse] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);

  const forca = medeForca(passe);
  const coincide = confirmar.length > 0 && passe === confirmar;

  // Mesmo aspecto do <Input>, para o <select> nativo.
  const campo =
    "w-full rounded-xl border border-input bg-card px-4 py-2.5 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 md:text-sm";
  const etiqueta = "block text-sm font-medium";
  const titulo = "mb-1.5 flex items-baseline justify-between gap-3";

  const escolheFoto = (ficheiro?: File) => {
    if (!ficheiro) return;
    if (foto) URL.revokeObjectURL(foto);
    setFoto(URL.createObjectURL(ficheiro));
    setNomeFoto(ficheiro.name);
  };

  const limpaFoto = () => {
    if (foto) URL.revokeObjectURL(foto);
    setFoto(null);
    setNomeFoto("");
  };

  const alteraArea = (area: string) =>
    setAreas((actual) => (actual.includes(area) ? actual.filter((a) => a !== area) : [...actual, area]));

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
              Protótipo: os dados deste formulário não são enviados nem guardados.
            </p>
          </aside>

          <section className="p-6 sm:p-9 md:p-12">
            <h1 className="font-display text-4xl font-semibold">Criar conta</h1>
            <p className="mt-2 text-muted-foreground">
              Leva menos de um minuto. Depois entra com o e-mail e a palavra-passe.
            </p>

            <form onSubmit={(e) => e.preventDefault()} className="mt-9 space-y-6">
              <label className={etiqueta}>
                <span className={titulo}>Nome completo</span>
                <Input id="nome" name="nome" required autoComplete="name" placeholder="Jose Bongo Nkana" />
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
                />
              </label>

              <div className="grid gap-6 sm:grid-cols-2">
                <label className={etiqueta}>
                  <span className={titulo}>Palavra-passe</span>
                  <span className="relative block">
                    <Input
                      id="passe"
                      name="passe"
                      type={verPasse ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      placeholder="mínimo 8 caracteres"
                      onChange={(e) => setPasse(e.target.value)}
                      className="pr-11"
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
                  <span className={`mt-2 text-xs ${coincide ? "text-primary" : "text-transparent"}`}>
                    As palavras-passe coincidem
                  </span>
                </label>
              </div>

              <label className={etiqueta}>
                <span className={titulo}>Grau académico</span>
                <span className="relative block">
                  <select id="grau" name="grau" required defaultValue="" className={`${campo} appearance-none pr-11`}>
                    <option value="" disabled>
                      Escolha o seu grau
                    </option>
                    {GRAUS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden
                    className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  />
                </span>
              </label>

              <fieldset>
                <legend className={titulo}>
                  Áreas de interesse
                  <span className="text-xs font-normal text-muted-foreground">
                    {areas.length > 0 ? `${areas.length} selecionada${areas.length > 1 ? "s" : ""}` : "escolha uma ou mais"}
                  </span>
                </legend>
                <div className="mt-1 flex flex-wrap gap-2">
                  {AREAS.map((area) => {
                    const activa = areas.includes(area);
                    return (
                      <button
                        key={area}
                        type="button"
                        aria-pressed={activa}
                        onClick={() => alteraArea(area)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                          activa
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        }`}
                      >
                        {activa && <Check className="h-3.5 w-3.5" />}
                        {area}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div>
                <span className={titulo}>Foto de perfil <span className="text-xs font-normal text-muted-foreground">opcional</span></span>
                <div className="mt-1 flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-muted/40 p-4">
                  <label className="group relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-border bg-card transition-colors hover:border-primary">
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => escolheFoto(e.target.files?.[0])}
                    />
                    {foto ? (
                      <img src={foto} alt="Pré-visualização da foto de perfil" className="h-full w-full object-cover" />
                    ) : (
                      <span className="grid h-full w-full place-items-center text-muted-foreground transition-colors group-hover:text-primary">
                        <Camera className="h-5 w-5" />
                        <span className="sr-only">Escolher foto de perfil</span>
                      </span>
                    )}
                  </label>
                  <div className="min-w-0 text-sm">
                    <p className="text-muted-foreground">
                      {nomeFoto ? (
                        <span className="truncate text-foreground">{nomeFoto}</span>
                      ) : (
                        "Clique no círculo para carregar uma imagem."
                      )}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">JPG ou PNG, até 2 MB.</p>
                    {foto && (
                      <button
                        type="button"
                        onClick={limpaFoto}
                        className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground underline-offset-4 hover:text-destructive hover:underline"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remover foto
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-3 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  required
                  className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                />
                <span>
                  Aceito os termos de utilização e a política de privacidade do BolsaAngola.
                </span>
              </label>

              <Button type="submit" size="lg" className="w-full">
                Criar conta
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
