import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchPalData,
  findChild,
  typeColor,
  typeLabel,
  type Pal,
} from "@/lib/pals-api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pesquisa Reprodutiva de Palworld — Calculadora de Criação" },
      {
        name: "description",
        content:
          "Calculadora de criação (breeding) de Palworld com dados oficiais: escolha dois pais e descubra o filhote, ou navegue por todas as combinações.",
      },
      { property: "og:title", content: "Pesquisa Reprodutiva de Palworld" },
      {
        property: "og:description",
        content: "Calculadora de criação de Palworld em português.",
      },
    ],
  }),
  component: BreedingPage,
});

function TypeBadge({ t }: { t: string }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
      style={{ background: typeColor(t) }}
    >
      {typeLabel(t)}
    </span>
  );
}

function PalCard({ pal, label }: { pal: Pal; label?: string }) {
  return (
    <div className="flex min-w-[120px] flex-col items-center gap-2 rounded-2xl bg-card p-3 shadow-[0_4px_20px_rgba(80,120,200,0.10)]">
      {label && (
        <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
      )}
      <div
        className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full ring-2 ring-white shadow-inner"
        style={{
          background:
            pal.types[0] &&
            `radial-gradient(circle at 30% 25%, oklch(from ${typeColor(
              pal.types[0].name,
            )} calc(l + 0.15) c h), ${typeColor(pal.types[0].name)})`,
        }}
      >
        <img
          src={pal.image || pal.imageWiki}
          alt={pal.name}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
      <div className="text-center">
        <div className="text-sm font-semibold text-foreground">{pal.name}</div>
        <div className="mt-0.5 flex flex-wrap justify-center gap-1">
          {pal.types.map((t) => (
            <TypeBadge key={t.name} t={t.name} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PalSelect({
  value,
  onChange,
  label,
  pals,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  pals: Pal[];
}) {
  const sorted = useMemo(
    () => [...pals].sort((a, b) => a.name.localeCompare(b.name)),
    [pals],
  );
  return (
    <label className="flex flex-1 flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-lg border border-input bg-card px-3 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      >
        <option value="">Não selecionado</option>
        {sorted.map((p) => (
          <option key={p.key} value={p.key}>
            {p.name}
          </option>
        ))}
      </select>
    </label>
  );
}

const PAGE_SIZE = 24;

function BreedingPage() {
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["palworld-data"],
    queryFn: fetchPalData,
    staleTime: 1000 * 60 * 60, // 1h
  });

  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [confirmed, setConfirmed] = useState<{ a: string; b: string } | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [query, setQuery] = useState("");
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const filteredCombos = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data.combinations;
    return data.combinations.filter(
      (c) =>
        c.parent1.name.toLowerCase().includes(q) ||
        c.parent2.name.toLowerCase().includes(q) ||
        c.child.name.toLowerCase().includes(q),
    );
  }, [data, query]);

  // Reset visible count when query changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query]);

  // Infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((c) => Math.min(c + PAGE_SIZE, filteredCombos.length));
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [filteredCombos.length]);

  const result = useMemo(() => {
    if (!data || !confirmed) return null;
    const pa = data.byKey.get(confirmed.a);
    const pb = data.byKey.get(confirmed.b);
    if (!pa || !pb) return null;
    const child = findChild(data, confirmed.a, confirmed.b);
    return { pa, pb, child };
  }, [data, confirmed]);

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="rounded-2xl bg-card/80 p-5 shadow-sm backdrop-blur">
          <nav className="flex flex-wrap gap-2 text-sm">
            {[
              "Mapa Estratégia Pal",
              "Livro Ilustrado Pal",
              "Pesquisas reprodutivas",
              "Calculadora de valor individual",
              "Palu MOD",
            ].map((tab, i) => {
              const active = i === 2;
              return (
                <button
                  key={tab}
                  className={
                    "rounded-lg px-3 py-2 text-sm font-medium transition " +
                    (active
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground")
                  }
                  style={active ? { color: "oklch(0.55 0.2 250)", borderColor: "oklch(0.55 0.2 250)" } : undefined}
                >
                  {tab}
                </button>
              );
            })}
          </nav>
        </header>

        {isLoading && (
          <div className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
            Carregando dados oficiais de Palworld...
          </div>
        )}
        {error && (
          <div className="rounded-2xl bg-destructive/10 p-6 text-sm text-destructive shadow-sm">
            Erro ao carregar dados. Verifique sua conexão e recarregue a página.
          </div>
        )}

        {data && (
          <>
            <section className="rounded-2xl bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                <PalSelect value={a} onChange={setA} label="Criando um" pals={data.pals} />
                <PalSelect value={b} onChange={setB} label="Criação II" pals={data.pals} />
                <div className="flex flex-1 flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Resultados reprodutivos
                  </span>
                  <div className="flex h-11 items-center rounded-lg border border-input bg-muted/30 px-3 text-sm text-muted-foreground">
                    {result
                      ? result.child
                        ? result.child.name
                        : "Sem combinação registrada"
                      : "Não selecionado"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => a && b && setConfirmed({ a, b })}
                    disabled={!a || !b}
                    className="h-11 rounded-lg px-5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-40"
                    style={{ background: "oklch(0.6 0.2 250)" }}
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => {
                      setA("");
                      setB("");
                      setConfirmed(null);
                    }}
                    className="h-11 rounded-lg bg-secondary px-5 text-sm font-semibold text-secondary-foreground transition hover:bg-secondary/80"
                  >
                    Redefinir
                  </button>
                </div>
              </div>
            </section>

            {result && (
              <section className="rounded-2xl bg-card p-6 shadow-sm">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Resultado da criação
                </h2>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <PalCard pal={result.pa} label="Pai 1" />
                  <div className="text-3xl font-light text-muted-foreground">+</div>
                  <PalCard pal={result.pb} label="Pai 2" />
                  <div className="text-3xl font-light text-muted-foreground">=</div>
                  {result.child ? (
                    <PalCard pal={result.child} label="Filhote" />
                  ) : (
                    <div className="rounded-2xl bg-muted p-6 text-center text-sm text-muted-foreground">
                      Sem combinação
                      <br />
                      registrada
                    </div>
                  )}
                </div>
              </section>
            )}

            <section className="rounded-2xl bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Todas as combinações
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {filteredCombos.length.toLocaleString("pt-BR")} combinações · role a página para carregar mais
                  </p>
                </div>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filtrar por nome (pai ou filhote)..."
                  className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-72"
                />
              </div>
            </section>

            <section>
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredCombos.slice(0, visibleCount).map((combo, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-around gap-2 rounded-2xl bg-card p-4 shadow-[0_4px_20px_rgba(80,120,200,0.08)]"
                  >
                    <PalCard pal={combo.parent1} />
                    <div className="text-2xl font-light text-muted-foreground">+</div>
                    <PalCard pal={combo.parent2} />
                    <div className="text-2xl font-light text-muted-foreground">=</div>
                    <PalCard pal={combo.child} />
                  </div>
                ))}
              </div>
              {visibleCount < filteredCombos.length && (
                <div
                  ref={sentinelRef}
                  className="mt-6 flex justify-center py-6 text-sm text-muted-foreground"
                >
                  Carregando mais combinações...
                </div>
              )}
              {filteredCombos.length === 0 && (
                <div className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
                  Nenhuma combinação encontrada para "{query}".
                </div>
              )}
            </section>
          </>
        )}

        <footer className="pt-4 text-center text-xs text-muted-foreground">
          Dados de{" "}
          <a
            href="https://github.com/mlg404/palworld-paldex-api"
            className="underline"
            target="_blank"
            rel="noreferrer"
          >
            palworld-paldex-api
          </a>
          {" "}(MIT). Imagens © Palworld Wiki / Pocketpair.
        </footer>
      </div>
    </main>
  );
}
