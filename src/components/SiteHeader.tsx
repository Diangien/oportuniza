import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  const link = "text-sm text-muted-foreground hover:text-foreground transition-colors";
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-4">
        <Link to="/" className="shrink-0 font-display text-xl font-semibold">
          Bolsa<span className="text-primary">Angola</span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6">
          <Link to="/bolsas" className={link} activeProps={{ className: "text-foreground" }}>Bolsas</Link>
          <Link to="/mentorias" className={link} activeProps={{ className: "text-foreground" }}>Mentorias</Link>
          <span className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Entrar</span>
        </nav>
      </div>
    </header>
  );
}
