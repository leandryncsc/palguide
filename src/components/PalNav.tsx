import { Link } from "@tanstack/react-router";

const tabs = [
  { to: "/mapa", label: "Mapa Estratégia Pal" },
  { to: "/paldex", label: "Livro Ilustrado Pal" },
  { to: "/", label: "Pesquisas reprodutivas" },
  { to: "/iv", label: "Calculadora de valor individual" },
] as const;

export function PalNav() {
  return (
    <header className="rounded-2xl bg-card/80 p-5 shadow-sm backdrop-blur">
      <nav className="flex flex-wrap gap-2 text-sm">
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
    </header>
  );
}
