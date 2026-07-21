import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  fetchPalData,
  type Pal,
  type PalData,
  type WorkSuitability,
  WORK_LABELS,
} from "@/lib/pals-api";
import { PalNav } from "@/components/PalNav";

type NocturnalFilter = "any" | "yes" | "no";
type WorkKey = keyof WorkSuitability;

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

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-muted/40 p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-lg font-bold text-foreground">{value}</div>
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-card p-4 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-muted ring-2 ring-white/10 sm:h-24 sm:w-24">
              <img
                src={pal.image}
                alt={pal.name}
                className="h-full w-full object-cover"
                onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
              />
            </div>
            <div className="min-w-0">
              <div className="font-mono text-xs text-muted-foreground">
                #{String(pal.id).padStart(3, "0")}
                {pal.variant ? "B" : ""}
              </div>
              <h2 className="truncate text-xl font-bold text-foreground sm:text-2xl">{pal.name}</h2>
              <div className="mt-1 truncate text-xs text-muted-foreground">
                Nome interno: <span className="font-mono">{pal.key}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg bg-secondary px-3 py-1.5 text-sm font-semibold text-secondary-foreground transition hover:bg-secondary/80"
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
  const [nocturnal, setNocturnal] = useState<NocturnalFilter>("any");
  const [works, setWorks] = useState<WorkKey[]>([]);
  const [selected, setSelected] = useState<Pal | null>(null);

  const toggleWork = (k: WorkKey) =>
    setWorks((prev) => (prev.includes(k) ? prev.filter((w) => w !== k) : [...prev, k]));

  const reset = () => {
    setQuery("");
    setNocturnal("any");
    setWorks([]);
  };

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    const sorted = [...data.pals].sort(
      (a, b) => a.id - b.id || Number(a.variant) - Number(b.variant),
    );
    return sorted.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) && !String(p.id).includes(q)) return false;
      if (nocturnal === "yes" && !p.nocturnal) return false;
      if (nocturnal === "no" && p.nocturnal) return false;
      if (works.length && !works.every((w) => p.workSuitability[w] > 0)) return false;
      return true;
    });
  }, [data, query, nocturnal, works]);

  const workKeys = Object.keys(WORK_LABELS) as WorkKey[];
  const activeCount = (nocturnal !== "any" ? 1 : 0) + works.length;

  return (
    <main className="min-h-screen px-4 py-8">
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

          <div className="mt-5 space-y-4 border-t border-border pt-4">
            <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-[110px_1fr] sm:gap-3">
              <span className="pt-1.5 text-sm font-semibold text-foreground">Noturno</span>
              <div className="flex flex-wrap gap-2">
                {([
                  ["any", "todos"],
                  ["no", "não"],
                  ["yes", "sim"],
                ] as const).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setNocturnal(val)}
                    className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                      nocturnal === val
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-muted/30 text-foreground hover:bg-muted/60"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-[110px_1fr] sm:gap-3">
              <span className="pt-1.5 text-sm font-semibold text-foreground">
                Adaptabilidade ao trabalho
              </span>
              <div className="flex flex-wrap gap-2">
                {workKeys.map((k) => {
                  const on = works.includes(k);
                  return (
                    <button
                      key={k}
                      onClick={() => toggleWork(k)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        on
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-muted/30 text-foreground hover:bg-muted/60"
                      }`}
                    >
                      {WORK_LABELS[k]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={reset}
                className="rounded-lg bg-secondary px-6 py-2 text-sm font-semibold text-secondary-foreground transition hover:bg-secondary/80"
              >
                Reiniciar
              </button>
              {activeCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {activeCount} filtro{activeCount > 1 ? "s" : ""} ativo{activeCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
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

        {data && filtered.length === 0 && !isLoading && (
          <div className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
            Nenhum Pal encontrado com os filtros selecionados.
          </div>
        )}

        {data && filtered.length > 0 && (
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
