import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { fetchPalData } from "@/lib/pals-api";
import { PalNav } from "@/components/PalNav";

export const Route = createFileRoute("/iv")({
  head: () => ({
    meta: [
      { title: "Calculadora de Valor Individual (IV) — Palworld" },
      {
        name: "description",
        content:
          "Calcule os IVs (valores individuais) do seu Pal em Palworld: HP, Ataque e Defesa a partir das estatísticas atuais e nível.",
      },
      { property: "og:title", content: "Calculadora de IV de Palworld" },
      { property: "og:description", content: "Descubra o potencial genético do seu Pal." },
    ],
  }),
  component: IvPage,
});

// Fórmula aproximada de Palworld:
// Stat = (Base + IV) * (1 + (Level - 1) * 0.02) * Souls * Passives
// Simplificamos ignorando Souls/Passives; IV varia de 0 a 100.
function estimateIv(current: number, base: number, level: number): number {
  const levelMult = 1 + (level - 1) * 0.02;
  const iv = current / levelMult - base;
  return Math.max(0, Math.min(100, Math.round(iv)));
}

function ratingLabel(iv: number): { label: string; color: string } {
  if (iv >= 90) return { label: "Excepcional", color: "oklch(0.75 0.18 145)" };
  if (iv >= 70) return { label: "Excelente", color: "oklch(0.75 0.15 190)" };
  if (iv >= 50) return { label: "Bom", color: "oklch(0.75 0.15 250)" };
  if (iv >= 30) return { label: "Regular", color: "oklch(0.7 0.12 60)" };
  return { label: "Fraco", color: "oklch(0.6 0.15 25)" };
}

function IvPage() {
  const { data } = useQuery({
    queryKey: ["palworld-data"],
    queryFn: fetchPalData,
    staleTime: 1000 * 60 * 60,
  });

  const [palKey, setPalKey] = useState("");
  const [level, setLevel] = useState(50);
  const [hp, setHp] = useState(0);
  const [atk, setAtk] = useState(0);
  const [def, setDef] = useState(0);
  // Bases médias aproximadas — o dataset não expõe base stats por Pal,
  // então usamos valores editáveis com padrões de referência.
  const [baseHp, setBaseHp] = useState(100);
  const [baseAtk, setBaseAtk] = useState(100);
  const [baseDef, setBaseDef] = useState(100);

  const pals = useMemo(
    () => (data ? [...data.pals].sort((a, b) => a.name.localeCompare(b.name)) : []),
    [data],
  );

  const results = useMemo(() => {
    return {
      hp: estimateIv(hp, baseHp, level),
      atk: estimateIv(atk, baseAtk, level),
      def: estimateIv(def, baseDef, level),
    };
  }, [hp, atk, def, baseHp, baseAtk, baseDef, level]);

  const avg = Math.round((results.hp + results.atk + results.def) / 3);
  const selected = data?.byKey.get(palKey);

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <PalNav />

        <section className="rounded-2xl bg-card p-6 shadow-sm">
          <h1 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Calculadora de Valor Individual (IV)
          </h1>
          <p className="mb-6 text-xs text-muted-foreground">
            Informe o Pal, o nível atual e as estatísticas do menu do jogo. A calculadora estima o IV
            (0 a 100) de HP, Ataque e Defesa comparando com a base do Pal.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Pal</span>
              <select
                value={palKey}
                onChange={(e) => setPalKey(e.target.value)}
                className="h-11 rounded-lg border border-input bg-card px-3 text-sm shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Selecione um Pal</option>
                {pals.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Nível (1 - 60)</span>
              <input
                type="number"
                min={1}
                max={60}
                value={level}
                onChange={(e) => setLevel(Math.max(1, Math.min(60, Number(e.target.value) || 1)))}
                className="h-11 rounded-lg border border-input bg-card px-3 text-sm shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {(
              [
                { label: "HP", cur: hp, setCur: setHp, base: baseHp, setBase: setBaseHp, iv: results.hp },
                { label: "Ataque", cur: atk, setCur: setAtk, base: baseAtk, setBase: setBaseAtk, iv: results.atk },
                { label: "Defesa", cur: def, setCur: setDef, base: baseDef, setBase: setBaseDef, iv: results.def },
              ] as const
            ).map((row) => {
              const r = ratingLabel(row.iv);
              return (
                <div key={row.label} className="rounded-xl border border-input bg-background/40 p-4">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {row.label}
                  </div>
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground">Valor atual no jogo</span>
                    <input
                      type="number"
                      value={row.cur}
                      onChange={(e) => row.setCur(Number(e.target.value) || 0)}
                      className="h-9 rounded-md border border-input bg-card px-2 text-sm"
                    />
                  </label>
                  <label className="mt-2 flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground">Base do Pal</span>
                    <input
                      type="number"
                      value={row.base}
                      onChange={(e) => row.setBase(Number(e.target.value) || 0)}
                      className="h-9 rounded-md border border-input bg-card px-2 text-sm"
                    />
                  </label>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-3xl font-bold" style={{ color: r.color }}>
                      {row.iv}
                    </span>
                    <span className="text-xs font-semibold" style={{ color: r.color }}>
                      {r.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between rounded-xl bg-muted/40 p-4">
            <div className="text-xs text-muted-foreground">
              {selected ? `IV médio de ${selected.name}` : "IV médio"}
            </div>
            <div className="text-2xl font-bold" style={{ color: ratingLabel(avg).color }}>
              {avg} · {ratingLabel(avg).label}
            </div>
          </div>

          <p className="mt-4 text-[11px] text-muted-foreground">
            Estimativa baseada na fórmula pública Stat = (Base + IV) × (1 + (Nível − 1) × 0.02).
            Bônus de Alma Antiga e Passivas não são considerados.
          </p>
        </section>
      </div>
    </main>
  );
}
