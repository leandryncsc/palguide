// Classifies raw dataset "type" strings from the palworld.th.gl node dump
// into 10 top-level categories that mirror the sidebar UI. Each subcategory
// key equals the original type string so counts and filter state stay stable.

export type CategoryKey =
  | "locations"
  | "collectibles"
  | "treasures"
  | "pickups"
  | "resources"
  | "fishing"
  | "eggs"
  | "npcs"
  | "pals"
  | "misc";

export type CategoryDef = {
  key: CategoryKey;
  label: string;
  color: string;
};

export const CATEGORIES: CategoryDef[] = [
  { key: "locations", label: "Locations", color: "#38bdf8" },
  { key: "pals", label: "Pals", color: "#ef4444" },
  { key: "npcs", label: "NPCs", color: "#ec4899" },
  { key: "eggs", label: "Eggs", color: "#facc15" },
  { key: "resources", label: "Resources", color: "#f97316" },
  { key: "pickups", label: "Pickups", color: "#22c55e" },
  { key: "fishing", label: "Fishing", color: "#06b6d4" },
  { key: "treasures", label: "Treasures", color: "#eab308" },
  { key: "collectibles", label: "Collectibles", color: "#a855f7" },
  { key: "misc", label: "Outros", color: "#94a3b8" },
];

const LOCATION_EXACT = new Set([
  "fasttravel",
  "warp_point",
  "respawn_point",
  "goddess_statue",
  "hackable_tower",
  "watchtower",
  "enemy_camp",
  "dimensional_rift",
  "boss_tower",
  "dungeon_random",
  "dungeon_sealed",
  "drillgame",
]);

const PICKUP_EXACT = new Set([
  "red_berry",
  "mushroom",
  "cave_mushroom",
  "kinship_peach",
  "skill_fruit",
  "poppy",
  "nightStone",
  "icicle_piece",
  "windchimes",
  "windchimes_ice",
  "wood",
  "stone_pickup",
  "note",
]);

const RESOURCE_EXACT = new Set([
  "copper",
  "paldiumOre",
  "quartz",
  "coal",
  "sulfur",
  "crude_oil",
  "rainbowCrystal",
  "chromium",
]);

const COLLECTIBLE_EXACT = new Set(["lifmunk_effigy"]);

const TREASURE_EXACT = new Set(["grass_treasure", "junk_yard", "treasure_map"]);

export function classify(type: string): CategoryKey {
  if (type.startsWith("npc_")) return "npcs";
  if (type.startsWith("egg_")) return "eggs";
  if (type.startsWith("effigy_")) return "collectibles";
  if (type.startsWith("magnet_fishing_spot") || type.startsWith("fishing_spot")) return "fishing";
  if (type.startsWith("treasure_")) return "treasures";
  if (type.startsWith("dungeon_")) return "locations";
  if (LOCATION_EXACT.has(type)) return "locations";
  if (PICKUP_EXACT.has(type)) return "pickups";
  if (RESOURCE_EXACT.has(type)) return "resources";
  if (COLLECTIBLE_EXACT.has(type)) return "collectibles";
  if (TREASURE_EXACT.has(type)) return "treasures";
  // predator_* and boss_* still count as Pals (as alphas/predators)
  if (type.startsWith("boss_") || type.startsWith("predator_")) return "pals";
  // Fallback: any lowercase-alphanum without underscore prefix → assume pal creature name
  return "pals";
}

// Turn a type slug like "egg_dragon" into "Egg — Dragon"
export function labelForType(type: string): string {
  const clean = type
    .replace(/^predator_/, "predator ")
    .replace(/^boss_/, "boss ")
    .replace(/^npc_/, "")
    .replace(/^effigy_/, "effigy ")
    .replace(/^egg_/, "egg ")
    .replace(/^treasure_/, "treasure ")
    .replace(/^dungeon_/, "dungeon ")
    .replace(/^magnet_/, "magnet ")
    .replace(/_/g, " ");
  return clean
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
