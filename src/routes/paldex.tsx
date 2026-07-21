import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { fetchPalData, type Pal, type PalData, WORK_LABELS } from "@/lib/pals-api";
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

function PalTile({ pal, onClick }: { pal: Pal; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-2xl bg-card p-3 text-left shadow-[0_4px_20px_rgba(80,120,200,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(80,120,200,0.18)]"
    >
      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-muted ring-2 ring-white/10">
        <img
          src={pal.image}
          alt={pal.name}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
        />
      </div>
      <div className="w-full text-center">
        <div className="text-[10px] font-mono text-muted-foreground">
          #{String(pal.id).padStart(3, "0")}
          {pal.variant ? "B" : ""}
        </div>
        <div className="text-sm font-semibold text-foreground">{pal.name}</div>
        <div className="text-[10px] text-muted-foreground">Poder de criação {pal.breedingPower}</div>
      </div>
    </button>
  );
}

function MiniPal({ pal }: { pal: Pal }) {
  return (
    <div className="flex min-w-[80px] flex-col items-center gap-1">
      <div className="h-12 w-12 overflow-hidden rounded-full bg-muted ring-1 ring-white/10">
        <img
          src={pal.image}
          alt={pal.name}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
        />
      </div>
      <div className="text-center text-[11px] font-medium text-foreground">{pal.name}</div>
    </div>
  );
}

function PalDetails({ pal, data, onClose }: { pal: Pal; data: PalData; onClose: () => void }) {
  const parentPairs = data.breeding[pal.key] ?? [];
  const asParent = useMemo(
    () =>
      data.combinations.filter(
        (c) => c.parent1.key === pal.key || c.parent2.key === pal.key,
      ),
    [data, pal.key],
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-24 w-24 overflow-hidden rounded-full bg-muted ring-2 ring-white/10">
              <img
                src={pal.image}
                alt={pal.name}
                className="h-full w-full object-cover"
                onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
              />
            </div>
            <div>
              <div className="font-mono text-xs text-muted-foreground">
                #{String(pal.id).padStart(3, "0")}
                {pal.variant ? "B" : ""}
              </div>
              <h2 className="text-2xl font-bold text-foreground">{pal.name}</h2>
              <div className="mt-1 text-xs text-muted-foreground">
                Nome interno: <span className="font-mono">{pal.key}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-secondary px-3 py-1.5 text-sm font-semibold text-secondary-foreground transition hover:bg-secondary/80"
          >
            Fechar
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Raridade" value={pal.rarity} />
          <StatCard label="Tamanho" value={pal.size} />
          <StatCard label="Noturno" value={pal.nocturnal ? "Sim" : "Não"} />
          <StatCard label="Poder de criação" value={pal.breedingPower} />
          <StatCard label="Preço" value={pal.price.toLocaleString("pt-BR")} />
          <StatCard
            label="Nível selvagem"
            value={`${pal.minWildLevel} – ${pal.maxWildLevel}`}
          />
          <StatCard label="HP" value={pal.hp} />
          <StatCard label="Ataque" value={pal.attack} />
          <StatCard label="Defesa" value={pal.defense} />
          <StatCard label="Estamina" value={pal.stamina} />
          <StatCard label="Velocidade (correr)" value={pal.runSpeed} />
          <StatCard label="Velocidade (montaria)" value={pal.rideSprintSpeed} />
          <StatCard label="Velocidade transporte" value={pal.transportSpeed} />
          <StatCard label="Ingestão de alimentos" value={pal.foodAmount} />
          <StatCard label="Estômago cheio" value={pal.maxFullStomach} />
        </div>

        <section className="mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Adaptabilidade ao trabalho
          </h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {(Object.keys(WORK_LABELS) as Array<keyof typeof WORK_LABELS>)
              .filter((k) => pal.workSuitability[k] > 0)
              .sort((a, b) => pal.workSuitability[b] - pal.workSuitability[a])
              .map((k) => (
                <div
                  key={k}
                  className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2"
                >
                  <span className="text-sm text-foreground">{WORK_LABELS[k]}</span>
                  <span className="rounded-md bg-primary/20 px-2 py-0.5 text-xs font-bold text-primary">
                    Nível {pal.workSuitability[k]}
                  </span>
                </div>
              ))}
            {Object.values(pal.workSuitability).every((v) => v === 0) && (
              <p className="col-span-full text-sm text-muted-foreground">
                Sem aptidões de trabalho.
              </p>
            )}
          </div>
        </section>

        <section className="mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Como obter (pais que geram este Pal) · {parentPairs.length}
          </h3>
          {parentPairs.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Não pode ser obtido por criação — capture na natureza.
            </p>
          ) : (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {parentPairs.slice(0, 30).map(([a, b], i) => {
                const pa = data.byKey.get(a);
                const pb = data.byKey.get(b);
                if (!pa || !pb) return null;
                return (
                  <div
                    key={i}
                    className="flex items-center justify-around gap-2 rounded-xl bg-muted/30 p-2"
                  >
                    <MiniPal pal={pa} />
                    <span className="text-lg text-muted-foreground">+</span>
                    <MiniPal pal={pb} />
                  </div>
                );
              })}
              {parentPairs.length > 30 && (
                <div className="col-span-full text-center text-xs text-muted-foreground">
                  ... e mais {parentPairs.length - 30} combinações
                </div>
              )}
            </div>
          )}
        </section>

        <section className="mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Filhotes gerados por este Pal · {asParent.length}
          </h3>
          {asParent.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">Sem filhotes registrados.</p>
          ) : (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {asParent.slice(0, 30).map((c, i) => {
                const other = c.parent1.key === pal.key ? c.parent2 : c.parent1;
                return (
                  <div
                    key={i}
                    className="flex items-center justify-around gap-2 rounded-xl bg-muted/30 p-2"
                  >
                    <MiniPal pal={other} />
                    <span className="text-lg text-muted-foreground">=</span>
                    <MiniPal pal={c.child} />
                  </div>
                );
              })}
              {asParent.length > 30 && (
                <div className="col-span-full text-center text-xs text-muted-foreground">
                  ... e mais {asParent.length - 30} filhotes
                </div>
              )}
            </div>
          )}
        </section>
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
  const [selected, setSelected] = useState<Pal | null>(null);

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
                {filtered.length.toLocaleString("pt-BR")} Pals no Paldex · clique em um Pal para ver detalhes
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
              <PalTile key={`${p.key}-${p.id}`} pal={p} onClick={() => setSelected(p)} />
            ))}
          </section>
        )}

        {selected && data && (
          <PalDetails pal={selected} data={data} onClose={() => setSelected(null)} />
        )}
      </div>
    </main>
  );
}
