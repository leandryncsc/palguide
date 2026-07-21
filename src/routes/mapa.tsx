import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  Diamond,
  Landmark,
  Tent,
  RotateCcw,
  Compass,
  Eye,
  Castle,
  Sword,
  DoorOpen,
  Egg as EggIcon,
  Pickaxe,
  Fish,
  User,
  Sparkles,
  Skull,
  Search,
  X,
  ChevronDown,
  ChevronRight,
  Package,
  Gem,
  Coins,
  Flame,
  Droplet,
  Snowflake,
  Leaf,
  Zap,
  Moon,
  Mountain,
  Circle,
  MapPin,
  ShieldAlert,
  TreePine,
  Anchor,
  BookOpen,
  Trees,
} from "lucide-react";
import { PalNav } from "@/components/PalNav";
import type { CanvasMarker } from "@/components/mapa/MapCanvas";
import { CATEGORIES, classify, labelForType, type CategoryKey } from "@/lib/mapa-taxonomy";
import { worldToGameCoord } from "@/lib/mapa-coords";

const MapCanvas = lazy(() => import("@/components/mapa/MapCanvas"));

export const Route = createFileRoute("/mapa")({
  head: () => ({
    meta: [
      { title: "Mapas Interativos de Palworld — Palpagos & World Tree" },
      {
        name: "description",
        content:
          "Mapas interativos de Palpagos Island e The World Tree com dataset completo (73k+ pontos): Fast Travel, Torres, Alphas, Ovos, Recursos, Pesca, NPCs, Tesouros e Coletáveis.",
      },
      { property: "og:title", content: "Mapas Interativos de Palworld" },
      {
        property: "og:description",
        content:
          "Dataset completo de spawns — 70k+ pinos com filtros hierárquicos e clustering.",
      },
    ],
  }),
  component: MapaPage,
});

type MapId = "palpagos" | "worldtree";

const MAPS: Record<MapId, { label: string }> = {
  palpagos: { label: "Palpagos Island" },
  worldtree: { label: "The World Tree" },
};

type RawNode = {
  id?: string;
  type: string;
  p: [number, number, number];
};

type MarkerData = {
  id: string;
  map: MapId;
  name: string;
  category: CategoryKey;
  sub: string; // = original type string
  coord: string;
  worldX: number;
  worldY: number;
};

// -------- icon picking per type (small heuristic set) --------
const IconFor = (type: string): React.ComponentType<{ size?: number; className?: string }> => {
  if (type === "fasttravel") return Diamond;
  if (type === "goddess_statue") return Landmark;
  if (type === "respawn_point") return Compass;
  if (type === "warp_point") return RotateCcw;
  if (type === "watchtower") return Eye;
  if (type === "enemy_camp") return Tent;
  if (type === "hackable_tower" || type === "boss_tower") return Castle;
  if (type === "dimensional_rift") return Sparkles;
  if (type.startsWith("dungeon_")) return DoorOpen;
  if (type === "drillgame") return Anchor;

  if (type.startsWith("egg_")) return EggIcon;

  if (type === "iron" || type === "copper" || type === "coal") return Pickaxe;
  if (type === "sulfur") return Flame;
  if (type === "quartz" || type === "chromium" || type === "rainbowCrystal") return Gem;
  if (type === "crude_oil") return Droplet;
  if (type === "paldiumOre") return Gem;

  if (type.startsWith("fishing_spot") || type.startsWith("magnet_fishing_spot")) return Fish;

  if (type.startsWith("treasure_")) return Coins;
  if (type === "grass_treasure") return Leaf;
  if (type === "junk_yard") return Package;
  if (type === "treasure_map") return BookOpen;

  if (type === "lifmunk_effigy") return Sparkles;
  if (type.startsWith("effigy_")) return Sparkles;
  if (type === "note") return BookOpen;

  if (type === "wood") return TreePine;
  if (type === "stone_pickup") return Mountain;
  if (type === "red_berry") return Leaf;
  if (type === "mushroom" || type === "cave_mushroom") return Trees;
  if (type === "kinship_peach" || type === "skill_fruit" || type === "poppy") return Leaf;
  if (type === "nightStone") return Moon;
  if (type === "icicle_piece" || type === "windchimes_ice") return Snowflake;
  if (type === "windchimes") return Zap;

  if (type.startsWith("npc_")) return User;

  if (type.startsWith("boss_")) return Skull;
  if (type.startsWith("predator_")) return ShieldAlert;

  return Circle;
};

const PRESETS_KEY = "palguide.mapa.presets";
const DEFAULT_HIDDEN_CATEGORIES: CategoryKey[] = [
  // Off-by-default heavy layers, matching th.gl behavior.
  "pals",
  "npcs",
  "pickups",
  "resources",
  "fishing",
  "eggs",
  "treasures",
  "collectibles",
  "misc",
];

type Preset = {
  name: string;
  excluded: Record<string, string[]>;
};

// Cheap client-only hydration guard for the Leaflet component.
function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

function MapaPage() {
  const hydrated = useHydrated();
  const [currentMap, setCurrentMap] = useState<MapId>("palpagos");
  const [mapOpen, setMapOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filterQuery, setFilterQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<CategoryKey>>(() => new Set(["locations"]));

  // Raw dataset loading
  const [palpagosData, setPalpagosData] = useState<RawNode[] | null>(null);
  const [treeData, setTreeData] = useState<RawNode[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [p, t] = await Promise.all([
          fetch("/data/palpagos.json").then((r) => r.json()),
          fetch("/data/tree.json").then((r) => r.json()),
        ]);
        if (!alive) return;
        setPalpagosData(p);
        setTreeData(t);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Build MarkerData once per dataset.
  const allMarkers: MarkerData[] = useMemo(() => {
    const out: MarkerData[] = [];
    const push = (nodes: RawNode[] | null, map: MapId) => {
      if (!nodes) return;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const x = n.p?.[0] ?? 0;
        const y = n.p?.[1] ?? 0;
        out.push({
          id: `${map[0]}_${i}`,
          map,
          name: labelForType(n.type),
          category: classify(n.type),
          sub: n.type,
          coord: worldToGameCoord(x, y),
          worldX: x,
          worldY: y,
        });
      }
    };
    push(palpagosData, "palpagos");
    push(treeData, "worldtree");
    return out;
  }, [palpagosData, treeData]);

  // Compute dynamic sub-lists per category, per map, with counts.
  const subsByCat = useMemo(() => {
    const out = Object.fromEntries(
      CATEGORIES.map((c) => [c.key, [] as { key: string; label: string; count: number }[]]),
    ) as Record<CategoryKey, { key: string; label: string; count: number }[]>;
    const counter = new Map<string, number>();
    for (const m of allMarkers) {
      if (m.map !== currentMap) continue;
      const k = `${m.category}::${m.sub}`;
      counter.set(k, (counter.get(k) ?? 0) + 1);
    }
    for (const [k, count] of counter) {
      const [catRaw, sub] = k.split("::");
      const cat = catRaw as CategoryKey;
      out[cat].push({ key: sub, label: labelForType(sub), count });
    }
    for (const arr of Object.values(out)) arr.sort((a, b) => b.count - a.count);
    return out;
  }, [allMarkers, currentMap]);

  // excluded[cat] = Set of sub keys that are HIDDEN. Empty = all sub on.
  const [excluded, setExcluded] = useState<Record<CategoryKey, Set<string>>>(() =>
    Object.fromEntries(CATEGORIES.map((c) => [c.key, new Set<string>()])) as Record<
      CategoryKey,
      Set<string>
    >,
  );

  // Apply DEFAULT preset on first data load: hide heavy categories entirely.
  const [appliedDefault, setAppliedDefault] = useState(false);
  useEffect(() => {
    if (appliedDefault || !palpagosData) return;
    setExcluded(() => {
      const next = Object.fromEntries(
        CATEGORIES.map((c) => [c.key, new Set<string>()]),
      ) as Record<CategoryKey, Set<string>>;
      for (const c of CATEGORIES) {
        if (DEFAULT_HIDDEN_CATEGORIES.includes(c.key)) {
          for (const s of subsByCat[c.key] ?? []) next[c.key].add(s.key);
        }
      }
      return next;
    });
    setAppliedDefault(true);
  }, [palpagosData, subsByCat, appliedDefault]);

  const [presets, setPresets] = useState<Preset[]>([]);
  const [presetsOpen, setPresetsOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PRESETS_KEY);
      if (raw) setPresets(JSON.parse(raw));
    } catch {
      /* noop */
    }
  }, []);

  function savePresets(next: Preset[]) {
    setPresets(next);
    try {
      localStorage.setItem(PRESETS_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
  }

  const mapMarkers = useMemo(
    () => allMarkers.filter((m) => m.map === currentMap),
    [allMarkers, currentMap],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mapMarkers.filter((m) => {
      if (excluded[m.category].has(m.sub)) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.coord.toLowerCase().includes(q) ||
        m.sub.toLowerCase().includes(q)
      );
    });
  }, [mapMarkers, excluded, query]);

  const canvasMarkers: CanvasMarker[] = useMemo(() => {
    return visible.map((m) => {
      const cat = CATEGORIES.find((c) => c.key === m.category)!;
      const IconCmp = IconFor(m.sub);
      return {
        id: m.id,
        name: m.name,
        category: cat.key,
        categoryLabel: cat.label,
        categoryColor: cat.color,
        subLabel: labelForType(m.sub),
        coord: m.coord,
        worldX: m.worldX,
        worldY: m.worldY,
        icon: <IconCmp size={12} />,
      };
    });
  }, [visible]);

  function toggleSub(cat: CategoryKey, sub: string) {
    setExcluded((prev) => {
      const next = { ...prev, [cat]: new Set(prev[cat]) };
      if (next[cat].has(sub)) next[cat].delete(sub);
      else next[cat].add(sub);
      return next;
    });
  }

  function toggleCategoryAll(cat: CategoryKey) {
    const subs = subsByCat[cat] ?? [];
    const isFullyHidden = subs.length > 0 && subs.every((s) => excluded[cat].has(s.key));
    setExcluded((prev) => ({
      ...prev,
      [cat]: isFullyHidden ? new Set() : new Set(subs.map((s) => s.key)),
    }));
  }

  function setAllCategories(on: boolean) {
    const next = Object.fromEntries(
      CATEGORIES.map((c) => [
        c.key,
        on ? new Set<string>() : new Set((subsByCat[c.key] ?? []).map((s) => s.key)),
      ]),
    ) as Record<CategoryKey, Set<string>>;
    setExcluded(next);
  }

  function resetDefault() {
    const next = Object.fromEntries(
      CATEGORIES.map((c) => [c.key, new Set<string>()]),
    ) as Record<CategoryKey, Set<string>>;
    for (const c of CATEGORIES) {
      if (DEFAULT_HIDDEN_CATEGORIES.includes(c.key)) {
        for (const s of subsByCat[c.key] ?? []) next[c.key].add(s.key);
      }
    }
    setExcluded(next);
    setQuery("");
    setFilterQuery("");
  }

  function toggleExpanded(cat: CategoryKey) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function saveCurrentAsPreset() {
    const name = prompt("Nome do preset:");
    if (!name) return;
    const snap: Preset = {
      name,
      excluded: Object.fromEntries(
        Object.entries(excluded).map(([k, v]) => [k, Array.from(v)]),
      ),
    };
    savePresets([...presets.filter((p) => p.name !== name), snap]);
  }

  function applyPreset(p: Preset) {
    const next = Object.fromEntries(
      CATEGORIES.map((c) => [c.key, new Set<string>(p.excluded[c.key] ?? [])]),
    ) as Record<CategoryKey, Set<string>>;
    setExcluded(next);
    setPresetsOpen(false);
  }

  function deletePreset(name: string) {
    savePresets(presets.filter((p) => p.name !== name));
  }

  const totalActive = visible.length;
  const totalMap = mapMarkers.length;

  return (
    <main className="min-h-screen px-3 py-4 sm:px-4 sm:py-6">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4">
        <PalNav />

        <section className="grid gap-3 lg:grid-cols-[300px_1fr]">
          {/* Sidebar */}
          <aside className="flex max-h-[80vh] flex-col gap-2 overflow-y-auto rounded-2xl bg-card p-3 shadow-sm">
            <div className="relative">
              <Search
                size={14}
                className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Buscar no mapa…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-md border border-border bg-background py-1.5 pl-7 pr-2 text-xs"
              />
            </div>

            <div className="rounded-md border border-border">
              <button
                onClick={() => setMapOpen((o) => !o)}
                className="flex w-full items-center justify-between gap-2 px-2 py-2 text-left text-xs font-semibold"
              >
                <span className="flex items-center gap-2">
                  <MapPin size={12} className="text-muted-foreground" />
                  {MAPS[currentMap].label}
                </span>
                <ChevronDown size={14} className={`transition ${mapOpen ? "rotate-180" : ""}`} />
              </button>
              {mapOpen && (
                <div className="border-t border-border p-1">
                  {(Object.keys(MAPS) as MapId[]).map((id) => (
                    <button
                      key={id}
                      onClick={() => {
                        setCurrentMap(id);
                        setSelected(null);
                        setMapOpen(false);
                      }}
                      className={`block w-full rounded px-2 py-1.5 text-left text-xs ${
                        currentMap === id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      }`}
                    >
                      {MAPS[id].label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-b border-border pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <button onClick={() => setAllCategories(true)} className="hover:text-foreground">
                ALL
              </button>
              <button onClick={() => setAllCategories(false)} className="hover:text-foreground">
                NONE
              </button>
              <button onClick={resetDefault} className="text-primary hover:text-primary/80">
                DEFAULT
              </button>
              <button
                onClick={() => setPresetsOpen((o) => !o)}
                className="flex items-center gap-0.5 hover:text-foreground"
              >
                PRESETS <ChevronRight size={10} />
              </button>
            </div>

            {presetsOpen && (
              <div className="rounded border border-border bg-background/60 p-2 text-xs">
                <button
                  onClick={saveCurrentAsPreset}
                  className="mb-1 w-full rounded bg-primary px-2 py-1 text-primary-foreground"
                >
                  + Salvar filtros atuais
                </button>
                {presets.length === 0 && (
                  <div className="py-1 text-center text-[10px] text-muted-foreground">
                    Nenhum preset salvo.
                  </div>
                )}
                {presets.map((p) => (
                  <div key={p.name} className="flex items-center gap-1 py-0.5">
                    <button
                      onClick={() => applyPreset(p)}
                      className="flex-1 truncate rounded px-1.5 py-1 text-left hover:bg-muted"
                    >
                      {p.name}
                    </button>
                    <button
                      onClick={() => deletePreset(p.name)}
                      className="rounded p-1 text-muted-foreground hover:text-destructive"
                      aria-label="Excluir preset"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative">
              <input
                type="text"
                placeholder="🔎 Find filter…"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
              />
            </div>

            <ul className="flex flex-col gap-1">
              {CATEGORIES.map((cat) => {
                const subs = subsByCat[cat.key] ?? [];
                const totalInCat = subs.reduce((s, x) => s + x.count, 0);
                const activeInCat = subs
                  .filter((s) => !excluded[cat.key].has(s.key))
                  .reduce((s, x) => s + x.count, 0);
                const isFullyHidden = subs.length > 0 && subs.every((s) => excluded[cat.key].has(s.key));
                const isOpen = expanded.has(cat.key);
                const fq = filterQuery.trim().toLowerCase();
                const filteredSubs = fq
                  ? subs.filter(
                      (s) =>
                        s.label.toLowerCase().includes(fq) ||
                        s.key.toLowerCase().includes(fq) ||
                        cat.label.toLowerCase().includes(fq),
                    )
                  : subs;
                if (
                  fq &&
                  filteredSubs.length === 0 &&
                  !cat.label.toLowerCase().includes(fq)
                )
                  return null;
                if (subs.length === 0) return null;

                return (
                  <li key={cat.key} className="overflow-hidden rounded-md">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleExpanded(cat.key)}
                        aria-label="Expandir"
                        className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                      >
                        {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      </button>
                      <button
                        onClick={() => toggleExpanded(cat.key)}
                        className={`flex-1 text-left text-xs font-semibold uppercase tracking-wide ${
                          isFullyHidden ? "text-muted-foreground/60" : "text-foreground"
                        }`}
                      >
                        <span
                          className="mr-1 inline-block h-2 w-2 rounded-full align-middle"
                          style={{ background: cat.color }}
                        />
                        {cat.label}{" "}
                        <span className="ml-1 font-mono text-[10px] font-normal text-muted-foreground">
                          {activeInCat}/{totalInCat}
                        </span>
                      </button>
                      <button
                        onClick={() => toggleCategoryAll(cat.key)}
                        className="rounded px-1 text-[9px] font-semibold text-muted-foreground hover:text-foreground"
                      >
                        {isFullyHidden ? "ALL" : "NONE"}
                      </button>
                    </div>

                    {isOpen && (
                      <ul className="ml-4 mt-1 flex max-h-64 flex-col gap-0.5 overflow-y-auto border-l border-border pl-2">
                        {filteredSubs.map((s) => {
                          const subOn = !excluded[cat.key].has(s.key);
                          const IconCmp = IconFor(s.key);
                          return (
                            <li key={s.key}>
                              <button
                                onClick={() => toggleSub(cat.key, s.key)}
                                className={`flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left text-[11px] transition ${
                                  subOn
                                    ? "text-foreground hover:bg-muted"
                                    : "text-muted-foreground/50 hover:bg-muted/50"
                                }`}
                              >
                                <span
                                  className="flex h-4 w-4 items-center justify-center rounded border"
                                  style={{
                                    borderColor: subOn ? cat.color : undefined,
                                    background: subOn ? cat.color : "transparent",
                                    color: "white",
                                  }}
                                >
                                  {subOn && <IconCmp size={10} />}
                                </span>
                                <span className="flex-1 truncate">{s.label}</span>
                                <span className="font-mono text-[9px] text-muted-foreground">
                                  {s.count}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="mt-2 rounded border border-border bg-background/50 p-2 text-center text-[10px] text-muted-foreground">
              {totalActive.toLocaleString("pt-BR")}/{totalMap.toLocaleString("pt-BR")} pontos
              visíveis
            </div>
          </aside>

          <div className="flex flex-col gap-3">
            {hydrated && !loading ? (
              <Suspense
                fallback={
                  <div className="flex h-[70vh] items-center justify-center rounded-2xl bg-card text-sm text-muted-foreground">
                    Carregando mapa…
                  </div>
                }
              >
                <MapCanvas
                  mapId={currentMap}
                  markers={canvasMarkers}
                  selectedId={selected}
                  onSelect={setSelected}
                />
              </Suspense>
            ) : (
              <div className="flex h-[70vh] items-center justify-center rounded-2xl bg-card text-sm text-muted-foreground">
                {loading ? "Baixando dataset (70k+ pontos)…" : "Carregando mapa…"}
              </div>
            )}

            <div className="rounded-2xl bg-card p-3 text-xs text-muted-foreground shadow-sm">
              Dataset completo do <span className="text-foreground">palworld.th.gl</span> — 73k+
              pontos com clustering automático. Scroll para zoom, arraste para navegar. Filtros
              hierárquicos com contadores em tempo real.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
