import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PalNav } from "@/components/PalNav";

export const Route = createFileRoute("/mapa")({
  head: () => ({
    meta: [
      { title: "Mapa de Palworld — Respawns de Pals e Bosses" },
      {
        name: "description",
        content:
          "Mapa interativo de Palworld com localizações de Alpha Pals, chefes de torre e dungeons. Filtre por tipo e clique para ver detalhes.",
      },
      { property: "og:title", content: "Mapa de Palworld — Bosses e Alphas" },
      {
        property: "og:description",
        content:
          "Localizações de Alpha Pals, torres e dungeons no mapa de Palworld.",
      },
    ],
  }),
  component: MapaPage,
});

const MAP_URL =
  "https://cdn.jsdelivr.net/gh/tylercamp/palcalc@main/PalCalc.UI/Resources/Map.jpeg";

type Category = "tower" | "alpha" | "dungeon";

type Marker = {
  id: string;
  name: string;
  category: Category;
  level: number | string;
  coord: string; // in-game coord label
  x: number; // % on image (0-100)
  y: number; // % on image
  note?: string;
};

// Curated dataset. x/y are approximate positions on the palcalc Map.jpeg.
const MARKERS: Marker[] = [
  // Torres (bosses principais)
  { id: "t1", name: "Torre de Rayne — Zoe & Grizzbolt", category: "tower", level: 15, coord: "(115, -401)", x: 49, y: 60, note: "Primeira torre. Elétrico." },
  { id: "t2", name: "Torre PIDF — Axel & Orserk", category: "tower", level: 30, coord: "(-587, -347)", x: 26, y: 58, note: "Deserto oeste." },
  { id: "t3", name: "Torre Livre — Lily & Lyleen", category: "tower", level: 40, coord: "(365, 340)", x: 60, y: 30, note: "Planta." },
  { id: "t4", name: "Torre da Frostallion — Marcus & Faleris", category: "tower", level: 45, coord: "(-129, 412)", x: 44, y: 27, note: "Ilha congelada." },
  { id: "t5", name: "Torre da Lírica — Victor & Shadowbeak", category: "tower", level: 50, coord: "(568, -518)", x: 68, y: 66, note: "Vulcânico." },
  { id: "t6", name: "Torre de Saya & Selyne", category: "tower", level: 55, coord: "(-773, 51)", x: 18, y: 45, note: "DLC Sakurajima." },
  { id: "t7", name: "Torre de Bjorn & Bastigor", category: "tower", level: 60, coord: "(-1300, -400)", x: 6, y: 60, note: "DLC Feybreak." },

  // Alpha Pals
  { id: "a1", name: "Alpha Mammorest", category: "alpha", level: 22, coord: "(178, -35)", x: 51, y: 47, note: "Planalto central." },
  { id: "a2", name: "Alpha Chillet", category: "alpha", level: 12, coord: "(74, -483)", x: 47, y: 65, note: "Perto da torre inicial." },
  { id: "a3", name: "Alpha Anubis", category: "alpha", level: 47, coord: "(-133, -100)", x: 44, y: 50, note: "Templo do deserto." },
  { id: "a4", name: "Alpha Jormuntide", category: "alpha", level: 45, coord: "(542, -83)", x: 66, y: 51, note: "Pântano." },
  { id: "a5", name: "Alpha Suzaku", category: "alpha", level: 42, coord: "(650, -477)", x: 71, y: 64, note: "Vulcânica." },
  { id: "a6", name: "Alpha Blazamut", category: "alpha", level: 49, coord: "(552, -420)", x: 68, y: 63, note: "Cratera." },
  { id: "a7", name: "Alpha Frostallion", category: "alpha", level: 50, coord: "(-296, 526)", x: 38, y: 22, note: "Pico gelado — end game." },
  { id: "a8", name: "Alpha Necromus", category: "alpha", level: 50, coord: "(384, 508)", x: 61, y: 23, note: "Cavaleiro sombrio." },
  { id: "a9", name: "Alpha Paladius", category: "alpha", level: 50, coord: "(-360, 507)", x: 36, y: 23, note: "Cavaleiro luz." },
  { id: "a10", name: "Alpha Menasting", category: "alpha", level: 38, coord: "(423, -463)", x: 62, y: 64, note: "Vulcânica." },
  { id: "a11", name: "Alpha Bushi", category: "alpha", level: 24, coord: "(-64, -336)", x: 46, y: 58, note: "Cutter." },
  { id: "a12", name: "Alpha Broncherry", category: "alpha", level: 25, coord: "(-84, -186)", x: 46, y: 53, note: "Bosque." },
  { id: "a13", name: "Alpha Elphidran", category: "alpha", level: 30, coord: "(345, -196)", x: 59, y: 53, note: "Ilha de gelo pequena." },
  { id: "a14", name: "Alpha Wumpo", category: "alpha", level: 37, coord: "(-231, 366)", x: 40, y: 30, note: "Nevado." },
  { id: "a15", name: "Alpha Reptyro", category: "alpha", level: 42, coord: "(482, -365)", x: 64, y: 61, note: "Vulcânica." },
  { id: "a16", name: "Alpha Kingpaca", category: "alpha", level: 26, coord: "(-121, -235)", x: 44, y: 54, note: "Bosque." },
  { id: "a17", name: "Alpha Kitsun", category: "alpha", level: 35, coord: "(-406, 176)", x: 33, y: 40, note: "Nevado." },
  { id: "a18", name: "Alpha Xenolord", category: "alpha", level: 55, coord: "(-810, 120)", x: 16, y: 42, note: "DLC — Sakurajima." },
  { id: "a19", name: "Alpha Bastigor", category: "alpha", level: 55, coord: "(-1150, -200)", x: 9, y: 55, note: "DLC — Feybreak." },
  { id: "a20", name: "Alpha Terizodon", category: "alpha", level: 55, coord: "(-1230, -350)", x: 7, y: 58, note: "DLC — Feybreak." },

  // Dungeons (portais)
  { id: "d1", name: "Dungeon do Bosque Sábio", category: "dungeon", level: "15-25", coord: "(-95, -215)", x: 45, y: 53, note: "Chefe rotativo." },
  { id: "d2", name: "Dungeon do Deserto", category: "dungeon", level: "25-35", coord: "(-560, -300)", x: 27, y: 57, note: "Fogo/Terra." },
  { id: "d3", name: "Dungeon do Gelo", category: "dungeon", level: "35-45", coord: "(-260, 380)", x: 39, y: 29, note: "Gelo." },
  { id: "d4", name: "Dungeon Vulcânica", category: "dungeon", level: "40-50", coord: "(520, -450)", x: 66, y: 64, note: "Fogo." },
  { id: "d5", name: "Dungeon Sakurajima", category: "dungeon", level: "45-55", coord: "(-780, 30)", x: 18, y: 46, note: "DLC." },
];

const CATEGORY_META: Record<
  Category,
  { label: string; color: string; ring: string }
> = {
  tower: { label: "Torre", color: "oklch(0.65 0.22 25)", ring: "ring-red-400" },
  alpha: { label: "Alpha Pal", color: "oklch(0.7 0.18 250)", ring: "ring-blue-400" },
  dungeon: { label: "Dungeon", color: "oklch(0.75 0.18 85)", ring: "ring-amber-400" },
};

function MapaPage() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Set<Category>>(
    new Set(["tower", "alpha", "dungeon"]),
  );
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MARKERS.filter(
      (m) =>
        active.has(m.category) &&
        (q === "" ||
          m.name.toLowerCase().includes(q) ||
          m.coord.toLowerCase().includes(q)),
    );
  }, [query, active]);

  function toggle(c: Category) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  }

  const selectedMarker = MARKERS.find((m) => m.id === selected);

  return (
    <main className="min-h-screen px-4 py-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <PalNav />

        <section className="rounded-2xl bg-card p-5 shadow-sm">
          <h1 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Mapa de Palworld
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Localizações de Alpha Pals, chefes de torre e dungeons. Clique em
            um marcador ou item da lista para destacar a posição.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {(Object.keys(CATEGORY_META) as Category[]).map((c) => {
              const on = active.has(c);
              const meta = CATEGORY_META[c];
              const count = MARKERS.filter((m) => m.category === c).length;
              return (
                <button
                  key={c}
                  onClick={() => toggle(c)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    on
                      ? "border-transparent text-white"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                  style={on ? { background: meta.color } : undefined}
                >
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: on ? "white" : meta.color }}
                  />
                  {meta.label} ({count})
                </button>
              );
            })}
            <input
              type="text"
              placeholder="Buscar por nome ou coordenada…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="ml-auto w-full min-w-[200px] flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm sm:max-w-xs"
            />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
          {/* Map */}
          <div className="relative overflow-hidden rounded-2xl bg-card shadow-sm">
            <div className="relative aspect-square w-full">
              <img
                src={MAP_URL}
                alt="Mapa de Palworld"
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              {filtered.map((m) => {
                const meta = CATEGORY_META[m.category];
                const isSel = selected === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() =>
                      setSelected((prev) => (prev === m.id ? null : m.id))
                    }
                    className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md transition hover:scale-125 ${
                      isSel ? "z-10 scale-150 ring-2 ring-offset-2 " + meta.ring : ""
                    }`}
                    style={{
                      left: `${m.x}%`,
                      top: `${100 - m.y}%`,
                      width: m.category === "tower" ? 16 : 12,
                      height: m.category === "tower" ? 16 : 12,
                      background: meta.color,
                    }}
                    title={`${m.name} — Nv. ${m.level}`}
                    aria-label={m.name}
                  />
                );
              })}
            </div>

            {selectedMarker && (
              <div className="border-t border-border bg-card/95 p-4 backdrop-blur">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase text-white"
                        style={{ background: CATEGORY_META[selectedMarker.category].color }}
                      >
                        {CATEGORY_META[selectedMarker.category].label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Nv. {selectedMarker.level}
                      </span>
                    </div>
                    <h2 className="mt-1 text-base font-semibold text-foreground">
                      {selectedMarker.name}
                    </h2>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                      Coord. {selectedMarker.coord}
                    </p>
                    {selectedMarker.note && (
                      <p className="mt-1 text-xs text-foreground/80">
                        {selectedMarker.note}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* List */}
          <aside className="max-h-[70vh] overflow-y-auto rounded-2xl bg-card p-3 shadow-sm lg:max-h-[80vh]">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {filtered.length} local{filtered.length === 1 ? "" : "is"}
              </span>
            </div>
            <ul className="flex flex-col gap-1">
              {filtered.map((m) => {
                const meta = CATEGORY_META[m.category];
                const isSel = selected === m.id;
                return (
                  <li key={m.id}>
                    <button
                      onClick={() =>
                        setSelected((prev) => (prev === m.id ? null : m.id))
                      }
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition hover:bg-muted ${
                        isSel ? "bg-muted" : ""
                      }`}
                    >
                      <span
                        className="h-3 w-3 flex-shrink-0 rounded-full border border-white/60"
                        style={{ background: meta.color }}
                      />
                      <span className="flex-1 truncate">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {m.name}
                        </span>
                        <span className="block truncate font-mono text-[10px] text-muted-foreground">
                          Nv. {m.level} · {m.coord}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
              {filtered.length === 0 && (
                <li className="px-2 py-4 text-center text-xs text-muted-foreground">
                  Nenhum resultado com esses filtros.
                </li>
              )}
            </ul>
          </aside>
        </section>

        <section className="rounded-2xl bg-card p-4 text-xs text-muted-foreground shadow-sm">
          Dica: coordenadas seguem o padrão do jogo (X, Y). Alpha Pals
          reaparecem alguns minutos após serem derrotados; chefes de torre não
          reaparecem, mas a batalha pode ser refeita ao entrar novamente na
          torre.
        </section>
      </div>
    </main>
  );
}
