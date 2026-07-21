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
  UserCog,
  Stethoscope,
  Sparkles,
  Hammer,
  ShieldCheck,
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
} from "lucide-react";
import { PalNav } from "@/components/PalNav";
import worldTreeMap from "@/assets/world-tree-map.png.asset.json";
import type { CanvasMarker } from "@/components/mapa/MapCanvas";

const MapCanvas = lazy(() => import("@/components/mapa/MapCanvas"));

export const Route = createFileRoute("/mapa")({
  head: () => ({
    meta: [
      { title: "Mapas Interativos de Palworld — Palpagos & World Tree" },
      {
        name: "description",
        content:
          "Mapas interativos de Palpagos Island e The World Tree com filtros hierárquicos por categoria (Locais, Alpha, Torres, Ovos, Recursos, Pesca, NPCs) no estilo palworld.th.gl.",
      },
      { property: "og:title", content: "Mapas Interativos de Palworld" },
      {
        property: "og:description",
        content: "Zoom, pan e filtros por categoria em Palpagos Island e The World Tree.",
      },
    ],
  }),
  component: MapaPage,
});

type MapId = "palpagos" | "worldtree";

const MAPS: Record<MapId, { label: string; image: string }> = {
  palpagos: {
    label: "Palpagos Island",
    image: "https://cdn.jsdelivr.net/gh/tylercamp/palcalc@main/PalCalc.UI/Resources/Map.jpeg",
  },
  worldtree: {
    label: "The World Tree",
    image: worldTreeMap.url,
  },
};

type CategoryKey =
  | "locations"
  | "collectibles"
  | "items"
  | "pickups"
  | "treasures"
  | "fishing"
  | "eggs"
  | "resources"
  | "pals"
  | "npcs";

type MarkerData = {
  id: string;
  map: MapId;
  name: string;
  category: CategoryKey;
  sub: string;
  level?: number | string;
  coord: string;
  x: number;
  y: number;
  note?: string;
};

type SubDef = {
  key: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const CATEGORIES: {
  key: CategoryKey;
  label: string;
  color: string;
  subs: SubDef[];
}[] = [
  {
    key: "locations",
    label: "Locations",
    color: "#38bdf8",
    subs: [
      { key: "fast_travel", label: "Fast Travel", icon: Diamond },
      { key: "statue", label: "Estátua de Poder", icon: Landmark },
      { key: "base", label: "Ponto Base", icon: Tent },
      { key: "warp", label: "Ponto de Warp", icon: RotateCcw },
      { key: "respawn", label: "Ponto de Respawn", icon: Compass },
      { key: "watchtower", label: "Torre de Vigia", icon: Eye },
    ],
  },
  {
    key: "collectibles",
    label: "Collectibles",
    color: "#a855f7",
    subs: [{ key: "note", label: "Nota / Memória", icon: Package }],
  },
  {
    key: "items",
    label: "Items",
    color: "#f59e0b",
    subs: [{ key: "chest", label: "Baú de Item", icon: Package }],
  },
  {
    key: "pickups",
    label: "Pickups",
    color: "#22c55e",
    subs: [{ key: "gather", label: "Ponto de Coleta", icon: Leaf }],
  },
  {
    key: "treasures",
    label: "Treasures",
    color: "#eab308",
    subs: [{ key: "treasure", label: "Tesouro", icon: Coins }],
  },
  {
    key: "fishing",
    label: "Fishing",
    color: "#06b6d4",
    subs: [{ key: "spot", label: "Ponto de Pesca", icon: Fish }],
  },
  {
    key: "eggs",
    label: "Eggs",
    color: "#facc15",
    subs: [
      { key: "common", label: "Comum", icon: EggIcon },
      { key: "hot", label: "Aquecido (Fogo)", icon: Flame },
      { key: "damp", label: "Molhado (Água)", icon: Droplet },
      { key: "frozen", label: "Congelado (Gelo)", icon: Snowflake },
      { key: "verdant", label: "Enraizado (Grama)", icon: Leaf },
      { key: "electric", label: "Elétrico", icon: Zap },
      { key: "dark", label: "Sombrio", icon: Moon },
      { key: "rocky", label: "Rochoso (Terra)", icon: Mountain },
      { key: "dragon", label: "Dragônico", icon: Sparkles },
    ],
  },
  {
    key: "resources",
    label: "Resources",
    color: "#f97316",
    subs: [
      { key: "iron", label: "Ferro", icon: Pickaxe },
      { key: "coal", label: "Carvão", icon: Mountain },
      { key: "sulfur", label: "Enxofre", icon: Flame },
      { key: "quartz", label: "Quartzo", icon: Gem },
      { key: "fluid", label: "Fluido", icon: Droplet },
      { key: "aluminum", label: "Alumínio", icon: Gem },
      { key: "silver", label: "Prata", icon: Coins },
      { key: "oil", label: "Petróleo", icon: Droplet },
      { key: "obsidian", label: "Obsidiana", icon: Mountain },
      { key: "crystal", label: "Cristal", icon: Gem },
      { key: "sand", label: "Areia Dourada", icon: Mountain },
      { key: "sap", label: "Seiva do Mundo", icon: Leaf },
    ],
  },
  {
    key: "pals",
    label: "Pals",
    color: "#ef4444",
    subs: [
      { key: "alpha", label: "Alpha Pal", icon: Sword },
      { key: "tower_boss", label: "Chefe de Torre", icon: Castle },
      { key: "dungeon_boss", label: "Chefe de Dungeon", icon: DoorOpen },
      { key: "world_boss", label: "Chefe Mundial", icon: Skull },
    ],
  },
  {
    key: "npcs",
    label: "NPCs",
    color: "#ec4899",
    subs: [
      { key: "merchant", label: "Comerciante", icon: User },
      { key: "pal_merchant", label: "Mercador de Pals", icon: UserCog },
      { key: "medic", label: "Médico Ambulante", icon: Stethoscope },
      { key: "black_market", label: "Mercado Negro", icon: Skull },
      { key: "cavalry", label: "Mestre de Cavalaria", icon: Sword },
      { key: "smith", label: "Ferreiro", icon: Hammer },
      { key: "guardian", label: "Guardião", icon: ShieldCheck },
    ],
  },
];

const MARKERS: MarkerData[] = [
  // ============ PALPAGOS ISLAND ============
  // Locations - Fast Travel
  { id: "p_ft_1", map: "palpagos", name: "Praia Inicial", category: "locations", sub: "fast_travel", coord: "(115, -530)", x: 49, y: 66 },
  { id: "p_ft_2", map: "palpagos", name: "Planalto Ventoso", category: "locations", sub: "fast_travel", coord: "(75, -350)", x: 47, y: 59 },
  { id: "p_ft_3", map: "palpagos", name: "Duneshelter", category: "locations", sub: "fast_travel", coord: "(-380, -520)", x: 34, y: 66 },
  { id: "p_ft_4", map: "palpagos", name: "Ilha Congelada", category: "locations", sub: "fast_travel", coord: "(-150, 430)", x: 43, y: 27 },
  { id: "p_ft_5", map: "palpagos", name: "Ilha Vulcânica", category: "locations", sub: "fast_travel", coord: "(560, -450)", x: 68, y: 64 },
  { id: "p_ft_6", map: "palpagos", name: "Sakurajima", category: "locations", sub: "fast_travel", coord: "(-780, 40)", x: 18, y: 46 },
  { id: "p_ft_7", map: "palpagos", name: "Feybreak", category: "locations", sub: "fast_travel", coord: "(-1200, -300)", x: 8, y: 58 },
  // Locations - Statue
  { id: "p_st_1", map: "palpagos", name: "Santuário Nº 1", category: "locations", sub: "statue", coord: "(184, -350)", x: 51, y: 59 },
  { id: "p_st_2", map: "palpagos", name: "Santuário Nº 2", category: "locations", sub: "statue", coord: "(-95, -200)", x: 45, y: 53 },
  { id: "p_st_3", map: "palpagos", name: "Santuário Nº 3", category: "locations", sub: "statue", coord: "(340, 200)", x: 59, y: 35 },
  { id: "p_st_4", map: "palpagos", name: "Santuário Nº 4", category: "locations", sub: "statue", coord: "(-420, 150)", x: 33, y: 41 },
  // Pals - Tower Bosses
  { id: "p_tb_1", map: "palpagos", name: "Zoe & Grizzbolt", category: "pals", sub: "tower_boss", level: 15, coord: "(115, -401)", x: 49, y: 60 },
  { id: "p_tb_2", map: "palpagos", name: "Axel & Orserk", category: "pals", sub: "tower_boss", level: 30, coord: "(-587, -347)", x: 26, y: 58 },
  { id: "p_tb_3", map: "palpagos", name: "Lily & Lyleen", category: "pals", sub: "tower_boss", level: 40, coord: "(365, 340)", x: 60, y: 30 },
  { id: "p_tb_4", map: "palpagos", name: "Marcus & Faleris", category: "pals", sub: "tower_boss", level: 45, coord: "(-129, 412)", x: 44, y: 27 },
  { id: "p_tb_5", map: "palpagos", name: "Victor & Shadowbeak", category: "pals", sub: "tower_boss", level: 50, coord: "(568, -518)", x: 68, y: 66 },
  { id: "p_tb_6", map: "palpagos", name: "Saya & Selyne", category: "pals", sub: "tower_boss", level: 55, coord: "(-773, 51)", x: 18, y: 45, note: "DLC Sakurajima" },
  { id: "p_tb_7", map: "palpagos", name: "Bjorn & Bastigor", category: "pals", sub: "tower_boss", level: 60, coord: "(-1300, -400)", x: 6, y: 60, note: "DLC Feybreak" },
  // Pals - Alphas
  { id: "p_a_1", map: "palpagos", name: "Alpha Mammorest", category: "pals", sub: "alpha", level: 22, coord: "(178, -35)", x: 51, y: 47 },
  { id: "p_a_2", map: "palpagos", name: "Alpha Chillet", category: "pals", sub: "alpha", level: 12, coord: "(74, -483)", x: 47, y: 65 },
  { id: "p_a_3", map: "palpagos", name: "Alpha Anubis", category: "pals", sub: "alpha", level: 47, coord: "(-133, -100)", x: 44, y: 50 },
  { id: "p_a_4", map: "palpagos", name: "Alpha Jormuntide", category: "pals", sub: "alpha", level: 45, coord: "(542, -83)", x: 66, y: 51 },
  { id: "p_a_5", map: "palpagos", name: "Alpha Suzaku", category: "pals", sub: "alpha", level: 42, coord: "(650, -477)", x: 71, y: 64 },
  { id: "p_a_6", map: "palpagos", name: "Alpha Blazamut", category: "pals", sub: "alpha", level: 49, coord: "(552, -420)", x: 68, y: 63 },
  { id: "p_a_7", map: "palpagos", name: "Alpha Frostallion", category: "pals", sub: "alpha", level: 50, coord: "(-296, 526)", x: 38, y: 22 },
  { id: "p_a_8", map: "palpagos", name: "Alpha Necromus", category: "pals", sub: "alpha", level: 50, coord: "(384, 508)", x: 61, y: 23 },
  { id: "p_a_9", map: "palpagos", name: "Alpha Paladius", category: "pals", sub: "alpha", level: 50, coord: "(-360, 507)", x: 36, y: 23 },
  { id: "p_a_10", map: "palpagos", name: "Alpha Menasting", category: "pals", sub: "alpha", level: 38, coord: "(423, -463)", x: 62, y: 64 },
  { id: "p_a_11", map: "palpagos", name: "Alpha Bushi", category: "pals", sub: "alpha", level: 24, coord: "(-64, -336)", x: 46, y: 58 },
  { id: "p_a_12", map: "palpagos", name: "Alpha Broncherry", category: "pals", sub: "alpha", level: 25, coord: "(-84, -186)", x: 46, y: 53 },
  { id: "p_a_13", map: "palpagos", name: "Alpha Elphidran", category: "pals", sub: "alpha", level: 30, coord: "(345, -196)", x: 59, y: 53 },
  { id: "p_a_14", map: "palpagos", name: "Alpha Wumpo", category: "pals", sub: "alpha", level: 37, coord: "(-231, 366)", x: 40, y: 30 },
  { id: "p_a_15", map: "palpagos", name: "Alpha Reptyro", category: "pals", sub: "alpha", level: 42, coord: "(482, -365)", x: 64, y: 61 },
  { id: "p_a_16", map: "palpagos", name: "Alpha Kingpaca", category: "pals", sub: "alpha", level: 26, coord: "(-121, -235)", x: 44, y: 54 },
  { id: "p_a_17", map: "palpagos", name: "Alpha Kitsun", category: "pals", sub: "alpha", level: 35, coord: "(-406, 176)", x: 33, y: 40 },
  { id: "p_a_18", map: "palpagos", name: "Alpha Xenolord", category: "pals", sub: "alpha", level: 55, coord: "(-810, 120)", x: 16, y: 42, note: "DLC Sakurajima" },
  { id: "p_a_19", map: "palpagos", name: "Alpha Bastigor", category: "pals", sub: "alpha", level: 55, coord: "(-1150, -200)", x: 9, y: 55, note: "DLC Feybreak" },
  { id: "p_a_20", map: "palpagos", name: "Alpha Terizodon", category: "pals", sub: "alpha", level: 55, coord: "(-1230, -350)", x: 7, y: 58, note: "DLC Feybreak" },
  // Pals - Dungeon Bosses
  { id: "p_db_1", map: "palpagos", name: "Dungeon Bosque Sábio", category: "pals", sub: "dungeon_boss", level: "15-25", coord: "(-95, -215)", x: 45, y: 53 },
  { id: "p_db_2", map: "palpagos", name: "Dungeon do Deserto", category: "pals", sub: "dungeon_boss", level: "25-35", coord: "(-560, -300)", x: 27, y: 57 },
  { id: "p_db_3", map: "palpagos", name: "Dungeon do Gelo", category: "pals", sub: "dungeon_boss", level: "35-45", coord: "(-260, 380)", x: 39, y: 29 },
  { id: "p_db_4", map: "palpagos", name: "Dungeon Vulcânica", category: "pals", sub: "dungeon_boss", level: "40-50", coord: "(520, -450)", x: 66, y: 64 },
  { id: "p_db_5", map: "palpagos", name: "Dungeon Sakurajima", category: "pals", sub: "dungeon_boss", level: "45-55", coord: "(-780, 30)", x: 18, y: 46, note: "DLC" },
  { id: "p_db_6", map: "palpagos", name: "Dungeon Feybreak", category: "pals", sub: "dungeon_boss", level: "50-60", coord: "(-1180, -280)", x: 8, y: 57, note: "DLC" },
  // Eggs
  { id: "p_e_1", map: "palpagos", name: "Ovo Comum", category: "eggs", sub: "common", coord: "(120, -410)", x: 49, y: 61 },
  { id: "p_e_2", map: "palpagos", name: "Ovo Aquecido", category: "eggs", sub: "hot", coord: "(580, -410)", x: 69, y: 62 },
  { id: "p_e_3", map: "palpagos", name: "Ovo Molhado", category: "eggs", sub: "damp", coord: "(340, -80)", x: 59, y: 51 },
  { id: "p_e_4", map: "palpagos", name: "Ovo Congelado", category: "eggs", sub: "frozen", coord: "(-260, 380)", x: 39, y: 29 },
  { id: "p_e_5", map: "palpagos", name: "Ovo Enraizado", category: "eggs", sub: "verdant", coord: "(-120, -215)", x: 44, y: 53 },
  { id: "p_e_6", map: "palpagos", name: "Ovo Elétrico", category: "eggs", sub: "electric", coord: "(-450, -100)", x: 31, y: 50 },
  { id: "p_e_7", map: "palpagos", name: "Ovo Sombrio", category: "eggs", sub: "dark", coord: "(384, 508)", x: 61, y: 23 },
  { id: "p_e_8", map: "palpagos", name: "Ovo Rochoso", category: "eggs", sub: "rocky", coord: "(-560, -350)", x: 27, y: 58 },
  { id: "p_e_9", map: "palpagos", name: "Ovo Dragônico", category: "eggs", sub: "dragon", coord: "(542, -83)", x: 66, y: 51 },
  { id: "p_e_10", map: "palpagos", name: "Ovo Comum Grande", category: "eggs", sub: "common", coord: "(60, -300)", x: 47, y: 56 },
  // Resources
  { id: "p_r_1", map: "palpagos", name: "Minério de Ferro", category: "resources", sub: "iron", coord: "(-90, -300)", x: 45, y: 56 },
  { id: "p_r_2", map: "palpagos", name: "Minério de Carvão", category: "resources", sub: "coal", coord: "(-480, -280)", x: 30, y: 56 },
  { id: "p_r_3", map: "palpagos", name: "Enxofre", category: "resources", sub: "sulfur", coord: "(520, -430)", x: 66, y: 63 },
  { id: "p_r_4", map: "palpagos", name: "Quartzo Puro", category: "resources", sub: "quartz", coord: "(-280, 300)", x: 39, y: 33 },
  { id: "p_r_5", map: "palpagos", name: "Fragmento de Fluido", category: "resources", sub: "fluid", coord: "(300, -80)", x: 58, y: 51 },
  { id: "p_r_6", map: "palpagos", name: "Alumínio Bruto", category: "resources", sub: "aluminum", coord: "(-720, 80)", x: 20, y: 44, note: "DLC Sakurajima" },
  { id: "p_r_7", map: "palpagos", name: "Minério de Prata", category: "resources", sub: "silver", coord: "(-1120, -200)", x: 10, y: 55, note: "DLC Feybreak" },
  { id: "p_r_8", map: "palpagos", name: "Petróleo de Alta Qualidade", category: "resources", sub: "oil", coord: "(-1180, -350)", x: 8, y: 58, note: "DLC Feybreak" },
  // Fishing
  { id: "p_f_1", map: "palpagos", name: "Pesca — Costa Inicial", category: "fishing", sub: "spot", coord: "(140, -580)", x: 50, y: 69 },
  { id: "p_f_2", map: "palpagos", name: "Pesca — Lago Central", category: "fishing", sub: "spot", coord: "(180, -60)", x: 51, y: 50 },
  { id: "p_f_3", map: "palpagos", name: "Pesca — Rio Deserto", category: "fishing", sub: "spot", coord: "(-480, -350)", x: 30, y: 58 },
  { id: "p_f_4", map: "palpagos", name: "Pesca — Praia Vulcânica", category: "fishing", sub: "spot", coord: "(620, -500)", x: 70, y: 65 },
  { id: "p_f_5", map: "palpagos", name: "Pesca — Sakurajima", category: "fishing", sub: "spot", coord: "(-820, 20)", x: 16, y: 46, note: "DLC" },
  // NPCs
  { id: "p_n_1", map: "palpagos", name: "Comerciante — Small Settlement", category: "npcs", sub: "merchant", coord: "(75, -480)", x: 47, y: 65 },
  { id: "p_n_2", map: "palpagos", name: "Mercador de Pals — Settlement", category: "npcs", sub: "pal_merchant", coord: "(78, -478)", x: 47, y: 65 },
  { id: "p_n_3", map: "palpagos", name: "Comerciante Duneshelter", category: "npcs", sub: "merchant", coord: "(-380, -520)", x: 34, y: 66 },
  { id: "p_n_4", map: "palpagos", name: "Médico Ambulante", category: "npcs", sub: "medic", coord: "(80, -475)", x: 47, y: 65 },
  { id: "p_n_5", map: "palpagos", name: "Mercado Negro", category: "npcs", sub: "black_market", coord: "(-380, -518)", x: 34, y: 66 },
  { id: "p_n_6", map: "palpagos", name: "Mestre de Cavalaria — Sakurajima", category: "npcs", sub: "cavalry", coord: "(-780, 60)", x: 18, y: 45, note: "DLC" },
  { id: "p_n_7", map: "palpagos", name: "Comerciante — Feybreak", category: "npcs", sub: "merchant", coord: "(-1180, -320)", x: 8, y: 58, note: "DLC" },

  // ============ THE WORLD TREE ============
  { id: "w_ft_1", map: "worldtree", name: "Base da Árvore", category: "locations", sub: "fast_travel", coord: "(0, 0)", x: 50, y: 50 },
  { id: "w_ft_2", map: "worldtree", name: "Pico Nevado", category: "locations", sub: "fast_travel", coord: "(-200, 380)", x: 40, y: 30 },
  { id: "w_ft_3", map: "worldtree", name: "Cratera Vulcânica", category: "locations", sub: "fast_travel", coord: "(250, 350)", x: 62, y: 30 },
  { id: "w_ft_4", map: "worldtree", name: "Deserto Dourado", category: "locations", sub: "fast_travel", coord: "(-300, -100)", x: 30, y: 55 },
  { id: "w_ft_5", map: "worldtree", name: "Floresta Sombria", category: "locations", sub: "fast_travel", coord: "(150, -300)", x: 55, y: 68 },
  { id: "w_tb_1", map: "worldtree", name: "Terraria & Yggdrasil", category: "pals", sub: "tower_boss", level: 65, coord: "(0, 50)", x: 50, y: 47, note: "Chefe final da DLC" },
  { id: "w_a_1", map: "worldtree", name: "Alpha Yggverbird", category: "pals", sub: "alpha", level: 55, coord: "(-150, 250)", x: 42, y: 35 },
  { id: "w_a_2", map: "worldtree", name: "Alpha Pyroclast", category: "pals", sub: "alpha", level: 58, coord: "(280, 300)", x: 63, y: 32 },
  { id: "w_a_3", map: "worldtree", name: "Alpha Aurorion", category: "pals", sub: "alpha", level: 55, coord: "(-250, 350)", x: 38, y: 30 },
  { id: "w_a_4", map: "worldtree", name: "Alpha Duneling", category: "pals", sub: "alpha", level: 52, coord: "(-320, -150)", x: 29, y: 57 },
  { id: "w_a_5", map: "worldtree", name: "Alpha Umbrafox", category: "pals", sub: "alpha", level: 56, coord: "(180, -280)", x: 56, y: 66 },
  { id: "w_a_6", map: "worldtree", name: "Rootguard", category: "pals", sub: "world_boss", level: 60, coord: "(60, 100)", x: 53, y: 45, note: "Guardião da árvore" },
  { id: "w_db_1", map: "worldtree", name: "Dungeon das Raízes", category: "pals", sub: "dungeon_boss", level: "50-60", coord: "(-80, 60)", x: 46, y: 47 },
  { id: "w_db_2", map: "worldtree", name: "Dungeon Vulcânica das Cinzas", category: "pals", sub: "dungeon_boss", level: "55-65", coord: "(260, 320)", x: 62, y: 31 },
  { id: "w_db_3", map: "worldtree", name: "Dungeon do Deserto Antigo", category: "pals", sub: "dungeon_boss", level: "50-60", coord: "(-320, -120)", x: 29, y: 56 },
  { id: "w_e_1", map: "worldtree", name: "Ovo Enraizado (Grande)", category: "eggs", sub: "verdant", coord: "(20, 60)", x: 51, y: 47 },
  { id: "w_e_2", map: "worldtree", name: "Ovo Aquecido", category: "eggs", sub: "hot", coord: "(240, 300)", x: 61, y: 32 },
  { id: "w_e_3", map: "worldtree", name: "Ovo Congelado", category: "eggs", sub: "frozen", coord: "(-200, 340)", x: 40, y: 31 },
  { id: "w_e_4", map: "worldtree", name: "Ovo Sombrio", category: "eggs", sub: "dark", coord: "(160, -260)", x: 55, y: 65 },
  { id: "w_e_5", map: "worldtree", name: "Ovo Rochoso", category: "eggs", sub: "rocky", coord: "(-280, -80)", x: 31, y: 54 },
  { id: "w_e_6", map: "worldtree", name: "Ovo Dragônico", category: "eggs", sub: "dragon", coord: "(80, 180)", x: 53, y: 40 },
  { id: "w_r_1", map: "worldtree", name: "Seiva da Árvore do Mundo", category: "resources", sub: "sap", coord: "(0, 100)", x: 50, y: 45 },
  { id: "w_r_2", map: "worldtree", name: "Obsidiana Vulcânica", category: "resources", sub: "obsidian", coord: "(270, 310)", x: 62, y: 31 },
  { id: "w_r_3", map: "worldtree", name: "Cristal Congelado", category: "resources", sub: "crystal", coord: "(-220, 350)", x: 39, y: 30 },
  { id: "w_r_4", map: "worldtree", name: "Areia Dourada", category: "resources", sub: "sand", coord: "(-310, -120)", x: 29, y: 56 },
  { id: "w_r_5", map: "worldtree", name: "Fragmento Sombrio", category: "resources", sub: "fluid", coord: "(170, -270)", x: 55, y: 66 },
  { id: "w_f_1", map: "worldtree", name: "Pesca — Lago da Árvore", category: "fishing", sub: "spot", coord: "(-40, -30)", x: 48, y: 52 },
  { id: "w_f_2", map: "worldtree", name: "Pesca — Rio Vulcânico", category: "fishing", sub: "spot", coord: "(230, 250)", x: 60, y: 35 },
  { id: "w_f_3", map: "worldtree", name: "Pesca — Oásis do Deserto", category: "fishing", sub: "spot", coord: "(-290, -60)", x: 30, y: 53 },
  { id: "w_n_1", map: "worldtree", name: "Guardiã da Árvore", category: "npcs", sub: "guardian", coord: "(10, 40)", x: 50, y: 48 },
  { id: "w_n_2", map: "worldtree", name: "Comerciante das Raízes", category: "npcs", sub: "merchant", coord: "(-30, -20)", x: 48, y: 52 },
  { id: "w_n_3", map: "worldtree", name: "Ferreiro Vulcânico", category: "npcs", sub: "smith", coord: "(260, 290)", x: 62, y: 32 },
];

type Preset = { name: string; excluded: Record<string, string[]> };
const PRESETS_KEY = "palguide:map-presets";

function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

function MapaPage() {
  const hydrated = useHydrated();
  const [currentMap, setCurrentMap] = useState<MapId>("palpagos");
  const [query, setQuery] = useState("");
  const [filterQuery, setFilterQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<CategoryKey>>(new Set(["locations"]));
  const [mapOpen, setMapOpen] = useState(false);

  // excluded[categoryKey] = Set of subKeys hidden. Empty set = all subs on.
  // Whole category hidden = every sub in excluded.
  const [excluded, setExcluded] = useState<Record<CategoryKey, Set<string>>>(() =>
    Object.fromEntries(CATEGORIES.map((c) => [c.key, new Set<string>()])) as Record<
      CategoryKey,
      Set<string>
    >,
  );

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

  const mapMarkers = useMemo(() => MARKERS.filter((m) => m.map === currentMap), [currentMap]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mapMarkers.filter((m) => {
      if (excluded[m.category].has(m.sub)) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.coord.toLowerCase().includes(q) ||
        (m.note ?? "").toLowerCase().includes(q)
      );
    });
  }, [mapMarkers, excluded, query]);

  const canvasMarkers: CanvasMarker[] = useMemo(() => {
    return visible.map((m) => {
      const cat = CATEGORIES.find((c) => c.key === m.category)!;
      const sub = cat.subs.find((s) => s.key === m.sub);
      const IconCmp = sub?.icon ?? Diamond;
      return {
        id: m.id,
        name: m.name,
        category: cat.key,
        categoryLabel: cat.label,
        categoryColor: cat.color,
        subLabel: sub?.label,
        level: m.level,
        coord: m.coord,
        x: m.x,
        y: m.y,
        note: m.note,
        icon: <IconCmp size={14} />,
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
    const def = CATEGORIES.find((c) => c.key === cat)!;
    const isFullyHidden = def.subs.every((s) => excluded[cat].has(s.key));
    setExcluded((prev) => ({
      ...prev,
      [cat]: isFullyHidden ? new Set() : new Set(def.subs.map((s) => s.key)),
    }));
  }

  function setAllCategories(on: boolean) {
    const next = Object.fromEntries(
      CATEGORIES.map((c) => [c.key, on ? new Set<string>() : new Set(c.subs.map((s) => s.key))]),
    ) as Record<CategoryKey, Set<string>>;
    setExcluded(next);
  }

  function resetDefault() {
    setAllCategories(true);
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
          <aside className="flex flex-col gap-2 rounded-2xl bg-card p-3 shadow-sm">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar no mapa…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-md border border-border bg-background py-1.5 pl-7 pr-2 text-xs"
              />
            </div>

            {/* Map selector accordion */}
            <div className="rounded-md border border-border">
              <button
                onClick={() => setMapOpen((o) => !o)}
                className="flex w-full items-center justify-between gap-2 px-2 py-2 text-left text-xs font-semibold"
              >
                <span className="flex items-center gap-2">
                  <span className="text-muted-foreground">🗺️</span>
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
                        currentMap === id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      {MAPS[id].label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ALL / NONE / DEFAULT / PRESETS */}
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

            {/* Find filter */}
            <div className="relative">
              <input
                type="text"
                placeholder="🔎 Find filter…"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
              />
            </div>

            {/* Categories */}
            <ul className="flex flex-col gap-1">
              {CATEGORIES.map((cat) => {
                const catMarkers = mapMarkers.filter((m) => m.category === cat.key);
                const totalInCat = catMarkers.length;
                const activeInCat = catMarkers.filter((m) => !excluded[cat.key].has(m.sub)).length;
                const isFullyHidden = cat.subs.every((s) => excluded[cat.key].has(s.key));
                const isOpen = expanded.has(cat.key);
                const fq = filterQuery.trim().toLowerCase();
                const filteredSubs = fq
                  ? cat.subs.filter(
                      (s) =>
                        s.label.toLowerCase().includes(fq) ||
                        cat.label.toLowerCase().includes(fq),
                    )
                  : cat.subs;
                if (fq && filteredSubs.length === 0 && !cat.label.toLowerCase().includes(fq))
                  return null;

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
                      <ul className="ml-4 mt-1 flex flex-col gap-0.5 border-l border-border pl-2">
                        {filteredSubs.map((s) => {
                          const subOn = !excluded[cat.key].has(s.key);
                          const subCount = catMarkers.filter((m) => m.sub === s.key).length;
                          const disabled = subCount === 0;
                          const IconCmp = s.icon;
                          return (
                            <li key={s.key}>
                              <button
                                onClick={() => toggleSub(cat.key, s.key)}
                                disabled={disabled}
                                className={`flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left text-[11px] transition ${
                                  disabled
                                    ? "cursor-not-allowed text-muted-foreground/30"
                                    : subOn
                                      ? "text-foreground hover:bg-muted"
                                      : "text-muted-foreground/50 hover:bg-muted/50"
                                }`}
                              >
                                <span
                                  className="flex h-4 w-4 items-center justify-center rounded border"
                                  style={{
                                    borderColor: subOn && !disabled ? cat.color : undefined,
                                    background: subOn && !disabled ? cat.color : "transparent",
                                    color: "white",
                                  }}
                                >
                                  {subOn && !disabled && <IconCmp size={10} />}
                                </span>
                                <span className="flex-1 truncate">{s.label}</span>
                                <span className="font-mono text-[9px] text-muted-foreground">
                                  {subCount}
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
              {totalActive}/{totalMap} pontos visíveis
            </div>
          </aside>

          {/* Map + details */}
          <div className="flex flex-col gap-3">
            {hydrated ? (
              <Suspense
                fallback={
                  <div className="flex h-[70vh] items-center justify-center rounded-2xl bg-card text-sm text-muted-foreground">
                    Carregando mapa…
                  </div>
                }
              >
                <MapCanvas
                  image={MAPS[currentMap].image}
                  markers={canvasMarkers}
                  selectedId={selected}
                  onSelect={setSelected}
                />
              </Suspense>
            ) : (
              <div className="flex h-[70vh] items-center justify-center rounded-2xl bg-card text-sm text-muted-foreground">
                Carregando mapa…
              </div>
            )}

            <div className="rounded-2xl bg-card p-3 text-xs text-muted-foreground shadow-sm">
              Use scroll para zoom, arraste para navegar. Filtros hierárquicos no estilo{" "}
              <span className="text-foreground">palworld.th.gl</span>. Clique num pin para ver
              detalhes e copiar as coordenadas.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
