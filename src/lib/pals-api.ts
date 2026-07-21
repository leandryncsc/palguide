// Public data source: tylercamp/palcalc on GitHub (MIT).
// It ships a complete, datamined Palworld dataset (299 Pals, 44k+ combinations),
// kept up to date with every DLC (Feybreak, Tides of Terraria, etc.).

const DB_URL =
  "https://cdn.jsdelivr.net/gh/tylercamp/palcalc@main/PalCalc.Model/db.json";
const BREEDING_URL =
  "https://cdn.jsdelivr.net/gh/tylercamp/palcalc@main/PalCalc.Model/breeding.json";

const ICON_BASE =
  "https://cdn.jsdelivr.net/gh/tylercamp/palcalc@main/PalCalc.UI/Resources/Pals";

export interface PalType {
  name: string;
  image: string;
}

export interface Pal {
  id: number;
  key: string; // InternalName (stable id used by breeding.json)
  name: string; // Localized display name (pt-BR when available)
  image: string;
  imageWiki: string;
  wiki: string;
  types: PalType[];
  description?: string;
  breedingPower: number;
  variant: boolean;
}

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

interface RawPal {
  Id: { PalDexNo: number; IsVariant: boolean };
  Name: string;
  LocalizedNames: Record<string, string> | null;
  InternalName: string;
  BreedingPower: number;
}

interface RawBreedingEntry {
  Parent1InternalName: string;
  Parent2InternalName: string;
  ChildInternalName: string;
}

function iconUrl(displayName: string): string {
  // palcalc file names use the display name with spaces, e.g. "Azurobe Cryst.png".
  return `${ICON_BASE}/${encodeURIComponent(displayName)}.png`;
}

function localizedName(p: RawPal): string {
  const loc = p.LocalizedNames;
  if (loc) {
    return loc["pt-BR"] || loc["pt"] || loc["en"] || p.Name;
  }
  return p.Name;
}

export async function fetchPalData(): Promise<PalData> {
  const [dbRes, breedRes] = await Promise.all([
    fetch(DB_URL),
    fetch(BREEDING_URL),
  ]);
  if (!dbRes.ok || !breedRes.ok) {
    throw new Error("Falha ao carregar dados de Palworld");
  }
  const db = (await dbRes.json()) as { Pals: RawPal[] };
  const breedRaw = (await breedRes.json()) as { Breeding: RawBreedingEntry[] };

  const pals: Pal[] = db.Pals.map((p) => {
    const img = iconUrl(p.Name);
    return {
      id: p.Id.PalDexNo,
      key: p.InternalName,
      name: localizedName(p),
      image: img,
      imageWiki: img,
      wiki: "",
      types: [],
      breedingPower: p.BreedingPower,
      variant: p.Id.IsVariant,
    };
  });

  const byKey = new Map<string, Pal>();
  for (const p of pals) byKey.set(p.key, p);

  const breeding: BreedingMap = {};
  const combinations: Combination[] = [];
  for (const b of breedRaw.Breeding) {
    const p1 = byKey.get(b.Parent1InternalName);
    const p2 = byKey.get(b.Parent2InternalName);
    const child = byKey.get(b.ChildInternalName);
    if (!p1 || !p2 || !child) continue;
    combinations.push({ parent1: p1, parent2: p2, child });
    (breeding[child.key] ??= []).push([p1.key, p2.key]);
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
