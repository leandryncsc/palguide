import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { fetchPalData, type Pal } from "@/lib/pals-api";
import { PalNav } from "@/components/PalNav";

export const Route = createFileRoute("/paldex")({
  head: () => ({
    meta: [
      { title: "Livro Ilustrado Pal — Paldex completo de Palworld" },
      {
        name: "description",
        content:
          "Paldex completo com todos os 299 Pals de Palworld, incluindo DLCs. Pesquise por nome e veja detalhes de cada criatura.",
      },
      { property: "og:title", content: "Livro Ilustrado Pal — Paldex" },
      { property: "og:description", content: "Paldex completo de Palworld em português." },
    ],
  }),
  component: PaldexPage,
});

function PalTile({ pal }: { pal: Pal }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-card p-3 shadow-[0_4px_20px_rgba(80,120,200,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(80,120,200,0.18)]">
      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-muted ring-2 ring-white/10">
        <img
          src={pal.image}
          alt={pal.name}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
        />
      </div>
      <div className="text-center">
        <div className="text-[10px] font-mono text-muted-foreground">
          #{String(pal.id).padStart(3, "0")}
          {pal.variant ? "B" : ""}
        </div>
        <div className="text-sm font-semibold text-foreground">{pal.name}</div>
        <div className="text-[10px] text-muted-foreground">Poder de criação {pal.breedingPower}</div>
      </div>
    </div>
  );
}

function PaldexPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["palworld-data"],
    queryFn: fetchPalData,
    staleTime: 1000 * 60 * 60,
  });
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    const sorted = [...data.pals].sort((a, b) => a.id - b.id || Number(a.variant) - Number(b.variant));
    if (!q) return sorted;
    return sorted.filter((p) => p.name.toLowerCase().includes(q) || String(p.id).includes(q));
  }, [data, query]);

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <PalNav />

        <section className="rounded-2xl bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Livro Ilustrado Pal
              </h1>
              <p className="text-xs text-muted-foreground">
                {filtered.length.toLocaleString("pt-BR")} Pals no Paldex
              </p>
            </div>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome ou número..."
              className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-72"
            />
          </div>
        </section>

        {isLoading && (
          <div className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
            Carregando Paldex...
          </div>
        )}
        {error && (
          <div className="rounded-2xl bg-destructive/10 p-6 text-sm text-destructive shadow-sm">
            Erro ao carregar dados.
          </div>
        )}

        {data && (
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {filtered.map((p) => (
              <PalTile key={`${p.key}-${p.id}`} pal={p} />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
