import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "./ThemeToggle";

const tabs = [
  { to: "/mapa", label: "Mapa Estratégia Pal" },
  { to: "/paldex", label: "Livro Ilustrado Pal" },
  { to: "/", label: "Pesquisas reprodutivas" },
  { to: "/iv", label: "Calculadora de valor individual" },
] as const;

export function PalNav() {
  return (
    <header className="rounded-2xl bg-card/80 p-3 shadow-sm backdrop-blur sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap gap-1.5 text-sm sm:gap-2">
          {tabs.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              activeOptions={{ exact: true }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
              activeProps={{
                className:
                  "rounded-lg px-3 py-2 text-sm font-medium border-b-2 border-primary text-primary",
                style: { color: "oklch(0.7 0.18 250)", borderColor: "oklch(0.7 0.18 250)" },
              }}
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
