import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PALS, ELEMENT_COLORS, computeChild, type Pal } from "@/lib/pals";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pesquisa Reprodutiva de Palworld — Calculadora de Criação" },
      {
        name: "description",
        content:
          "Calculadora de criação (breeding) de Palworld: escolha dois pais e descubra o filhote resultante, com combinações populares.",
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

function PalAvatar({ pal, size = 64 }: { pal: Pal; size?: number }) {
  const initials = pal.name.slice(0, 2).toUpperCase();
  const bg = ELEMENT_COLORS[pal.element];
  return (
    <div
      className="flex items-center justify-center rounded-full font-bold text-white shadow-md ring-2 ring-white/60"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 25%, oklch(from ${bg} calc(l + 0.15) c h), ${bg})`,
        fontSize: size * 0.32,
      }}
      aria-hidden
    >
      {initials}
    </div>
  );
}

function ElementBadge({ el }: { el: Pal["element"] }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
      style={{ background: ELEMENT_COLORS[el] }}
    >
      {el}
    </span>
  );
}

function PalCard({ pal, label }: { pal: Pal; label?: string }) {
  return (
    <div className="flex min-w-[110px] flex-col items-center gap-2 rounded-2xl bg-white p-3 shadow-[0_4px_20px_rgba(80,120,200,0.12)]">
      {label && (
        <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
      )}
      <PalAvatar pal={pal} />
      <div className="text-center">
        <div className="text-sm font-semibold text-foreground">{pal.name}</div>
        <div className="mt-0.5 flex justify-center gap-1">
          <ElementBadge el={pal.element} />
          {pal.element2 && <ElementBadge el={pal.element2} />}
        </div>
      </div>
    </div>
  );
}

function PalSelect({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <label className="flex flex-1 flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-lg border border-input bg-white px-3 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      >
        <option value="">Não selecionado</option>
        {[...PALS]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.element})
            </option>
          ))}
      </select>
    </label>
  );
}

function BreedingPage() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [confirmed, setConfirmed] = useState<{ a: string; b: string } | null>(null);

  const result = useMemo(() => {
    if (!confirmed) return null;
    const pa = PALS.find((p) => p.id === confirmed.a);
    const pb = PALS.find((p) => p.id === confirmed.b);
    if (!pa || !pb) return null;
    return { pa, pb, child: computeChild(pa, pb) };
  }, [confirmed]);

  const popular = useMemo(() => {
    const picks: Array<[string, string]> = [
      ["anubis", "anubis"],
      ["jormuntide", "relaxaurus"],
      ["blazamut", "suzaku"],
      ["frostallion", "jetragon"],
      ["shadowbeak", "necromus"],
      ["grizzbolt", "orserk"],
      ["mossanda", "grizzbolt"],
      ["penking", "bushi"],
      ["kitsun", "dazzi"],
    ];
    return picks
      .map(([x, y]) => {
        const pa = PALS.find((p) => p.id === x);
        const pb = PALS.find((p) => p.id === y);
        if (!pa || !pb) return null;
        return { pa, pb, child: computeChild(pa, pb) };
      })
      .filter((v): v is { pa: Pal; pb: Pal; child: Pal } => v !== null);
  }, []);

  return (
    <main
      className="min-h-screen px-4 py-8"
      style={{
        background:
          "linear-gradient(180deg, oklch(0.96 0.03 230) 0%, oklch(0.98 0.015 220) 100%)",
      }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="rounded-2xl bg-white/80 p-5 shadow-sm backdrop-blur">
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
                >
                  {tab}
                </button>
              );
            })}
          </nav>
        </header>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <PalSelect value={a} onChange={setA} label="Criando um" />
            <PalSelect value={b} onChange={setB} label="Criação II" />
            <div className="flex flex-1 flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                Resultados reprodutivos
              </span>
              <div className="flex h-11 items-center rounded-lg border border-input bg-muted/30 px-3 text-sm text-muted-foreground">
                {result ? result.child.name : "Não selecionado"}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => a && b && setConfirmed({ a, b })}
                disabled={!a || !b}
                className="h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-40"
                style={{ background: "oklch(0.65 0.2 250)" }}
              >
                Confirmar
              </button>
              <button
                onClick={() => {
                  setA("");
                  setB("");
                  setConfirmed(null);
                }}
                className="h-11 rounded-lg bg-neutral-800 px-5 text-sm font-semibold text-white transition hover:bg-neutral-700"
              >
                Redefinir
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="text-primary" style={{ color: "oklch(0.65 0.2 250)" }}>
              ◆
            </div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: "oklch(0.65 0.2 340)" }}>
                Anúncios
              </div>
              <p className="text-foreground">
                A biblioteca de criação foi atualizada para a versão oficial do jogo. Selecione
                dois Pals acima e clique em <strong>Confirmar</strong> para descobrir o filhote
                resultante.
              </p>
            </div>
          </div>
        </section>

        {result && (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Resultado da criação
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <PalCard pal={result.pa} label="Pai 1" />
              <div className="text-3xl font-light text-muted-foreground">+</div>
              <PalCard pal={result.pb} label="Pai 2" />
              <div className="text-3xl font-light text-muted-foreground">=</div>
              <PalCard pal={result.child} label="Filhote" />
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-4 px-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Combinações populares
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {popular.map((combo, i) => (
              <div
                key={i}
                className="flex items-center justify-around gap-2 rounded-2xl bg-white p-4 shadow-[0_4px_20px_rgba(80,120,200,0.10)]"
              >
                <PalCard pal={combo.pa} />
                <div className="text-2xl font-light text-muted-foreground">+</div>
                <PalCard pal={combo.pb} />
                <div className="text-2xl font-light text-muted-foreground">=</div>
                <PalCard pal={combo.child} />
              </div>
            ))}
          </div>
        </section>

        <footer className="pt-4 text-center text-xs text-muted-foreground">
          Dados baseados no sistema oficial de criação de Palworld. Fórmula: filhote com
          <em> breed power </em> mais próximo de <code>⌊(pai1 + pai2 + 1) / 2⌋</code>.
        </footer>
      </div>
    </main>
  );
}
