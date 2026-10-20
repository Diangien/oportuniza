import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/login")({
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
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-md px-5 py-16">
        <h1 className="font-display text-4xl font-semibold">Entrar</h1>
        <p className="mt-2 text-muted-foreground">Bem-vindo de volta. Use o e-mail com que se registou.</p>
        <form onSubmit={(e) => e.preventDefault()} className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6">
          <label className="block text-sm font-medium">
            E-mail
            <Input type="email" required placeholder="nome@exemplo.ao" className="mt-1.5" />
          </label>
          <label className="block text-sm font-medium">
            <span className="flex items-center justify-between">
              Palavra-passe
              <button type="button" className="text-xs font-normal text-primary hover:underline">Esqueci a palavra-passe</button>
            </span>
            <Input type="password" required placeholder="••••••••" className="mt-1.5" />
          </label>
          <Button type="submit" size="lg" className="w-full">Entrar</Button>
        </form>
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
