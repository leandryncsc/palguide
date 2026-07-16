// Public data source: mlg404/palworld-paldex-api on GitHub (MIT).
// CORS is open on raw.githubusercontent.com so we fetch directly from the browser.

const PALS_URL =
  "https://raw.githubusercontent.com/mlg404/palworld-paldex-api/main/src/pals.json";
const BREEDING_URL =
  "https://raw.githubusercontent.com/mlg404/palworld-paldex-api/main/src/breeding.json";

export interface PalType {
  name: string;
  image: string;
}

export interface Pal {
  id: number;
  key: string;
  name: string;
  image: string;
  imageWiki: string;
  wiki: string;
  types: PalType[];
  description?: string;
}

// breeding.json shape: { [childKey: string]: Array<[parentKey1, parentKey2]> }
export type BreedingMap = Record<string, Array<[string, string]>>;

export interface Combination {
  parent1: Pal;
  parent2: Pal;
  child: Pal;
}

export interface PalData {
  pals: Pal[];
  byKey: Map<string, Pal>;
  breeding: BreedingMap;
  combinations: Combination[];
}

const CDN_BASE = "https://cdn.jsdelivr.net/gh/mlg404/palworld-paldex-api@main";

function resolveImage(path: string): string {
  // pals.json ships paths like "/public/images/paldeck/001.png".
  if (!path) return "";
  if (path.startsWith("http")) return path.replace(/\/$/, "");
  return CDN_BASE + path;
}

export async function fetchPalData(): Promise<PalData> {
  const [palsRes, breedingRes] = await Promise.all([
    fetch(PALS_URL),
    fetch(BREEDING_URL),
  ]);
  if (!palsRes.ok || !breedingRes.ok) {
    throw new Error("Falha ao carregar dados de Palworld");
  }
  const palsRaw = (await palsRes.json()) as Pal[];
  const breeding = (await breedingRes.json()) as BreedingMap;

  const pals: Pal[] = palsRaw.map((p) => ({
    ...p,
    imageWiki: cleanImage(p.imageWiki || ""),
  }));

  const byKey = new Map<string, Pal>();
  for (const p of pals) byKey.set(p.key, p);

  const combinations: Combination[] = [];
  for (const [childKey, pairs] of Object.entries(breeding)) {
    const child = byKey.get(childKey);
    if (!child) continue;
    for (const [k1, k2] of pairs) {
      const p1 = byKey.get(k1);
      const p2 = byKey.get(k2);
      if (!p1 || !p2) continue;
      combinations.push({ parent1: p1, parent2: p2, child });
    }
  }

  return { pals, byKey, breeding, combinations };
}

export function findChild(
  data: PalData,
  parent1Key: string,
  parent2Key: string,
): Pal | null {
  for (const [childKey, pairs] of Object.entries(data.breeding)) {
    for (const [a, b] of pairs) {
      if (
        (a === parent1Key && b === parent2Key) ||
        (a === parent2Key && b === parent1Key)
      ) {
        return data.byKey.get(childKey) ?? null;
      }
    }
  }
  return null;
}

const TYPE_COLORS: Record<string, string> = {
  neutral: "oklch(0.78 0.02 90)",
  fire: "oklch(0.68 0.19 35)",
  water: "oklch(0.72 0.13 230)",
  grass: "oklch(0.72 0.16 145)",
  electric: "oklch(0.85 0.16 95)",
  ice: "oklch(0.82 0.09 210)",
  ground: "oklch(0.62 0.09 60)",
  dark: "oklch(0.42 0.07 300)",
  dragon: "oklch(0.58 0.16 285)",
};

export function typeColor(t: string): string {
  return TYPE_COLORS[t.toLowerCase()] ?? "oklch(0.7 0.05 250)";
}

const TYPE_PT: Record<string, string> = {
  neutral: "Neutro",
  fire: "Fogo",
  water: "Água",
  grass: "Grama",
  electric: "Elétrico",
  ice: "Gelo",
  ground: "Terra",
  dark: "Sombrio",
  dragon: "Dragão",
};

export function typeLabel(t: string): string {
  return TYPE_PT[t.toLowerCase()] ?? t;
}
