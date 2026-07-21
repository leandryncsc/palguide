import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PalNav } from "@/components/PalNav";
import worldTreeMap from "@/assets/world-tree-map.png.asset.json";

export const Route = createFileRoute("/mapa")({
  head: () => ({
    meta: [
      { title: "Mapas de Palworld — Palpagos Island & The World Tree" },
      {
        name: "description",
        content:
          "Mapas interativos de Palpagos Island e The World Tree com locais, Alpha Pals, torres, dungeons, ovos, recursos, pesca e NPCs em Palworld.",
      },
      { property: "og:title", content: "Mapas de Palworld — Palpagos & World Tree" },
      {
        property: "og:description",
        content:
          "Filtros por categoria estilo palworld.th.gl para os dois mapas do jogo.",
      },
    ],
  }),
  component: MapaPage,
});

type MapId = "palpagos" | "worldtree";

const MAPS: Record<MapId, { label: string; image: string; description: string }> = {
  palpagos: {
    label: "Palpagos Island",
    image: "https://cdn.jsdelivr.net/gh/tylercamp/palcalc@main/PalCalc.UI/Resources/Map.jpeg",
    description: "Mapa principal do jogo base, com Sakurajima e Feybreak nos limites.",
  },
  worldtree: {
    label: "The World Tree",
    image: worldTreeMap.url,
    description: "Mapa da DLC Tides of Terraria — bioma central com a Árvore do Mundo.",
  },
};

type Category =
  | "location"
  | "tower"
  | "alpha"
  | "dungeon"
  | "egg"
  | "resource"
  | "fishing"
  | "npc";

type Marker = {
  id: string;
  map?: MapId; // default: palpagos
  name: string;
  category: Category;
  level?: number | string;
  coord: string;
  x: number;
  y: number;
  note?: string;
};

const MARKERS: Marker[] = [
  // Locations (fast travel / pontos-chave)
  { id: "l1", name: "Fast Travel — Praia Inicial", category: "location", coord: "(115, -530)", x: 49, y: 66, note: "Ponto inicial do jogo." },
  { id: "l2", name: "Fast Travel — Planalto Ventoso", category: "location", coord: "(75, -350)", x: 47, y: 59 },
  { id: "l3", name: "Fast Travel — Deserto de Duna", category: "location", coord: "(-560, -380)", x: 27, y: 60 },
  { id: "l4", name: "Fast Travel — Ilha Congelada", category: "location", coord: "(-150, 430)", x: 43, y: 27 },
  { id: "l5", name: "Fast Travel — Ilha Vulcânica", category: "location", coord: "(560, -450)", x: 68, y: 64 },
  { id: "l6", name: "Fast Travel — Sakurajima", category: "location", coord: "(-780, 40)", x: 18, y: 46 },
  { id: "l7", name: "Fast Travel — Feybreak", category: "location", coord: "(-1200, -300)", x: 8, y: 58 },
  { id: "l8", name: "Santuário Nº 1", category: "location", coord: "(184, -350)", x: 51, y: 59, note: "Estátua de Poder." },
  { id: "l9", name: "Santuário Nº 2", category: "location", coord: "(-95, -200)", x: 45, y: 53 },
  { id: "l10", name: "Santuário Nº 3", category: "location", coord: "(340, 200)", x: 59, y: 35 },
  { id: "l11", name: "Santuário Nº 4", category: "location", coord: "(-420, 150)", x: 33, y: 41 },

  // Torres
  { id: "t1", name: "Torre de Rayne — Zoe & Grizzbolt", category: "tower", level: 15, coord: "(115, -401)", x: 49, y: 60 },
  { id: "t2", name: "Torre PIDF — Axel & Orserk", category: "tower", level: 30, coord: "(-587, -347)", x: 26, y: 58 },
  { id: "t3", name: "Torre Livre — Lily & Lyleen", category: "tower", level: 40, coord: "(365, 340)", x: 60, y: 30 },
  { id: "t4", name: "Torre da Frostallion — Marcus & Faleris", category: "tower", level: 45, coord: "(-129, 412)", x: 44, y: 27 },
  { id: "t5", name: "Torre da Lírica — Victor & Shadowbeak", category: "tower", level: 50, coord: "(568, -518)", x: 68, y: 66 },
  { id: "t6", name: "Torre de Saya & Selyne", category: "tower", level: 55, coord: "(-773, 51)", x: 18, y: 45, note: "DLC Sakurajima." },
  { id: "t7", name: "Torre de Bjorn & Bastigor", category: "tower", level: 60, coord: "(-1300, -400)", x: 6, y: 60, note: "DLC Feybreak." },

  // Alphas
  { id: "a1", name: "Alpha Mammorest", category: "alpha", level: 22, coord: "(178, -35)", x: 51, y: 47 },
  { id: "a2", name: "Alpha Chillet", category: "alpha", level: 12, coord: "(74, -483)", x: 47, y: 65 },
  { id: "a3", name: "Alpha Anubis", category: "alpha", level: 47, coord: "(-133, -100)", x: 44, y: 50 },
  { id: "a4", name: "Alpha Jormuntide", category: "alpha", level: 45, coord: "(542, -83)", x: 66, y: 51 },
  { id: "a5", name: "Alpha Suzaku", category: "alpha", level: 42, coord: "(650, -477)", x: 71, y: 64 },
  { id: "a6", name: "Alpha Blazamut", category: "alpha", level: 49, coord: "(552, -420)", x: 68, y: 63 },
  { id: "a7", name: "Alpha Frostallion", category: "alpha", level: 50, coord: "(-296, 526)", x: 38, y: 22 },
  { id: "a8", name: "Alpha Necromus", category: "alpha", level: 50, coord: "(384, 508)", x: 61, y: 23 },
  { id: "a9", name: "Alpha Paladius", category: "alpha", level: 50, coord: "(-360, 507)", x: 36, y: 23 },
  { id: "a10", name: "Alpha Menasting", category: "alpha", level: 38, coord: "(423, -463)", x: 62, y: 64 },
  { id: "a11", name: "Alpha Bushi", category: "alpha", level: 24, coord: "(-64, -336)", x: 46, y: 58 },
  { id: "a12", name: "Alpha Broncherry", category: "alpha", level: 25, coord: "(-84, -186)", x: 46, y: 53 },
  { id: "a13", name: "Alpha Elphidran", category: "alpha", level: 30, coord: "(345, -196)", x: 59, y: 53 },
  { id: "a14", name: "Alpha Wumpo", category: "alpha", level: 37, coord: "(-231, 366)", x: 40, y: 30 },
  { id: "a15", name: "Alpha Reptyro", category: "alpha", level: 42, coord: "(482, -365)", x: 64, y: 61 },
  { id: "a16", name: "Alpha Kingpaca", category: "alpha", level: 26, coord: "(-121, -235)", x: 44, y: 54 },
  { id: "a17", name: "Alpha Kitsun", category: "alpha", level: 35, coord: "(-406, 176)", x: 33, y: 40 },
  { id: "a18", name: "Alpha Xenolord", category: "alpha", level: 55, coord: "(-810, 120)", x: 16, y: 42, note: "DLC Sakurajima." },
  { id: "a19", name: "Alpha Bastigor", category: "alpha", level: 55, coord: "(-1150, -200)", x: 9, y: 55, note: "DLC Feybreak." },
  { id: "a20", name: "Alpha Terizodon", category: "alpha", level: 55, coord: "(-1230, -350)", x: 7, y: 58, note: "DLC Feybreak." },

  // Dungeons
  { id: "d1", name: "Dungeon do Bosque Sábio", category: "dungeon", level: "15-25", coord: "(-95, -215)", x: 45, y: 53 },
  { id: "d2", name: "Dungeon do Deserto", category: "dungeon", level: "25-35", coord: "(-560, -300)", x: 27, y: 57 },
  { id: "d3", name: "Dungeon do Gelo", category: "dungeon", level: "35-45", coord: "(-260, 380)", x: 39, y: 29 },
  { id: "d4", name: "Dungeon Vulcânica", category: "dungeon", level: "40-50", coord: "(520, -450)", x: 66, y: 64 },
  { id: "d5", name: "Dungeon Sakurajima", category: "dungeon", level: "45-55", coord: "(-780, 30)", x: 18, y: 46, note: "DLC." },
  { id: "d6", name: "Dungeon Feybreak", category: "dungeon", level: "50-60", coord: "(-1180, -280)", x: 8, y: 57, note: "DLC." },

  // Ovos
  { id: "e1", name: "Ovo Comum", category: "egg", coord: "(120, -410)", x: 49, y: 61 },
  { id: "e2", name: "Ovo Aquecido", category: "egg", coord: "(580, -410)", x: 69, y: 62, note: "Fogo." },
  { id: "e3", name: "Ovo Molhado", category: "egg", coord: "(340, -80)", x: 59, y: 51, note: "Água." },
  { id: "e4", name: "Ovo Congelado", category: "egg", coord: "(-260, 380)", x: 39, y: 29, note: "Gelo." },
  { id: "e5", name: "Ovo Enraizado", category: "egg", coord: "(-120, -215)", x: 44, y: 53, note: "Grama." },
  { id: "e6", name: "Ovo Elétrico", category: "egg", coord: "(-450, -100)", x: 31, y: 50, note: "Elétrico." },
  { id: "e7", name: "Ovo Sombrio", category: "egg", coord: "(384, 508)", x: 61, y: 23, note: "Sombrio." },
  { id: "e8", name: "Ovo Rochoso", category: "egg", coord: "(-560, -350)", x: 27, y: 58, note: "Terra." },
  { id: "e9", name: "Ovo Dragônico", category: "egg", coord: "(542, -83)", x: 66, y: 51, note: "Dragão." },
  { id: "e10", name: "Ovo Comum Grande", category: "egg", coord: "(60, -300)", x: 47, y: 56 },

  // Recursos
  { id: "r1", name: "Minério de Ferro", category: "resource", coord: "(-90, -300)", x: 45, y: 56 },
  { id: "r2", name: "Minério de Carvão", category: "resource", coord: "(-480, -280)", x: 30, y: 56 },
  { id: "r3", name: "Enxofre", category: "resource", coord: "(520, -430)", x: 66, y: 63 },
  { id: "r4", name: "Quartzo Puro", category: "resource", coord: "(-280, 300)", x: 39, y: 33 },
  { id: "r5", name: "Fragmento de Fluido", category: "resource", coord: "(300, -80)", x: 58, y: 51 },
  { id: "r6", name: "Alumínio Bruto", category: "resource", coord: "(-720, 80)", x: 20, y: 44, note: "DLC Sakurajima." },
  { id: "r7", name: "Minério de Prata", category: "resource", coord: "(-1120, -200)", x: 10, y: 55, note: "DLC Feybreak." },
  { id: "r8", name: "Alta Qualidade de Petróleo", category: "resource", coord: "(-1180, -350)", x: 8, y: 58, note: "DLC Feybreak." },

  // Pesca
  { id: "f1", name: "Pesca — Costa Inicial", category: "fishing", coord: "(140, -580)", x: 50, y: 69 },
  { id: "f2", name: "Pesca — Lago Central", category: "fishing", coord: "(180, -60)", x: 51, y: 50 },
  { id: "f3", name: "Pesca — Rio Deserto", category: "fishing", coord: "(-480, -350)", x: 30, y: 58 },
  { id: "f4", name: "Pesca — Praia Vulcânica", category: "fishing", coord: "(620, -500)", x: 70, y: 65 },
  { id: "f5", name: "Pesca — Sakurajima", category: "fishing", coord: "(-820, 20)", x: 16, y: 46, note: "DLC." },

  // NPCs / Comerciantes
  { id: "n1", name: "Comerciante Ambulante — Small Settlement", category: "npc", coord: "(75, -480)", x: 47, y: 65 },
  { id: "n2", name: "Mercador de Pals — Small Settlement", category: "npc", coord: "(78, -478)", x: 47, y: 65 },
  { id: "n3", name: "Comerciante do Deserto — Duneshelter", category: "npc", coord: "(-380, -520)", x: 34, y: 66 },
  { id: "n4", name: "Médico Ambulante", category: "npc", coord: "(80, -475)", x: 47, y: 65 },
  { id: "n5", name: "Comerciante Negro", category: "npc", coord: "(-380, -518)", x: 34, y: 66 },
  { id: "n6", name: "Mestre de Cavalaria — Sakurajima", category: "npc", coord: "(-780, 60)", x: 18, y: 45, note: "DLC." },
  { id: "n7", name: "Comerciante — Feybreak", category: "npc", coord: "(-1180, -320)", x: 8, y: 58, note: "DLC." },

  // ===== The World Tree (DLC Tides of Terraria) =====
  // Locais
  { id: "wl1", map: "worldtree", name: "Fast Travel — Base da Árvore", category: "location", coord: "(0, 0)", x: 50, y: 50, note: "Centro do mapa." },
  { id: "wl2", map: "worldtree", name: "Fast Travel — Pico Nevado", category: "location", coord: "(-200, 380)", x: 40, y: 30, note: "Norte gelado." },
  { id: "wl3", map: "worldtree", name: "Fast Travel — Cratera Vulcânica", category: "location", coord: "(250, 350)", x: 62, y: 30, note: "Nordeste vulcânico." },
  { id: "wl4", map: "worldtree", name: "Fast Travel — Deserto Dourado", category: "location", coord: "(-300, -100)", x: 30, y: 55, note: "Sudoeste árido." },
  { id: "wl5", map: "worldtree", name: "Fast Travel — Floresta Sombria", category: "location", coord: "(150, -300)", x: 55, y: 68, note: "Sul misterioso." },

  // Torres
  { id: "wt1", map: "worldtree", name: "Torre da Árvore — Terraria & Yggdrasil", category: "tower", level: 65, coord: "(0, 50)", x: 50, y: 47, note: "Chefe final da DLC." },

  // Alphas
  { id: "wa1", map: "worldtree", name: "Alpha Yggverbird", category: "alpha", level: 55, coord: "(-150, 250)", x: 42, y: 35 },
  { id: "wa2", map: "worldtree", name: "Alpha Pyroclast", category: "alpha", level: 58, coord: "(280, 300)", x: 63, y: 32 },
  { id: "wa3", map: "worldtree", name: "Alpha Aurorion", category: "alpha", level: 55, coord: "(-250, 350)", x: 38, y: 30 },
  { id: "wa4", map: "worldtree", name: "Alpha Duneling", category: "alpha", level: 52, coord: "(-320, -150)", x: 29, y: 57 },
  { id: "wa5", map: "worldtree", name: "Alpha Umbrafox", category: "alpha", level: 56, coord: "(180, -280)", x: 56, y: 66 },
  { id: "wa6", map: "worldtree", name: "Alpha Rootguard", category: "alpha", level: 60, coord: "(60, 100)", x: 53, y: 45, note: "Guardião da árvore." },

  // Dungeons
  { id: "wd1", map: "worldtree", name: "Dungeon das Raízes", category: "dungeon", level: "50-60", coord: "(-80, 60)", x: 46, y: 47 },
  { id: "wd2", map: "worldtree", name: "Dungeon Vulcânica das Cinzas", category: "dungeon", level: "55-65", coord: "(260, 320)", x: 62, y: 31 },
  { id: "wd3", map: "worldtree", name: "Dungeon do Deserto Antigo", category: "dungeon", level: "50-60", coord: "(-320, -120)", x: 29, y: 56 },

  // Ovos
  { id: "we1", map: "worldtree", name: "Ovo Enraizado (Grande)", category: "egg", coord: "(20, 60)", x: 51, y: 47, note: "Perto da árvore." },
  { id: "we2", map: "worldtree", name: "Ovo Aquecido", category: "egg", coord: "(240, 300)", x: 61, y: 32 },
  { id: "we3", map: "worldtree", name: "Ovo Congelado", category: "egg", coord: "(-200, 340)", x: 40, y: 31 },
  { id: "we4", map: "worldtree", name: "Ovo Sombrio", category: "egg", coord: "(160, -260)", x: 55, y: 65 },
  { id: "we5", map: "worldtree", name: "Ovo Rochoso", category: "egg", coord: "(-280, -80)", x: 31, y: 54 },
  { id: "we6", map: "worldtree", name: "Ovo Dragônico", category: "egg", coord: "(80, 180)", x: 53, y: 40 },

  // Recursos
  { id: "wr1", map: "worldtree", name: "Seiva da Árvore do Mundo", category: "resource", coord: "(0, 100)", x: 50, y: 45, note: "Exclusivo DLC." },
  { id: "wr2", map: "worldtree", name: "Obsidiana Vulcânica", category: "resource", coord: "(270, 310)", x: 62, y: 31 },
  { id: "wr3", map: "worldtree", name: "Cristal Congelado", category: "resource", coord: "(-220, 350)", x: 39, y: 30 },
  { id: "wr4", map: "worldtree", name: "Areia Dourada", category: "resource", coord: "(-310, -120)", x: 29, y: 56 },
  { id: "wr5", map: "worldtree", name: "Fragmento Sombrio", category: "resource", coord: "(170, -270)", x: 55, y: 66 },

  // Pesca
  { id: "wf1", map: "worldtree", name: "Pesca — Lago da Árvore", category: "fishing", coord: "(-40, -30)", x: 48, y: 52 },
  { id: "wf2", map: "worldtree", name: "Pesca — Rio Vulcânico", category: "fishing", coord: "(230, 250)", x: 60, y: 35 },
  { id: "wf3", map: "worldtree", name: "Pesca — Oásis do Deserto", category: "fishing", coord: "(-290, -60)", x: 30, y: 53 },

  // NPCs
  { id: "wn1", map: "worldtree", name: "Guardiã da Árvore", category: "npc", coord: "(10, 40)", x: 50, y: 48 },
  { id: "wn2", map: "worldtree", name: "Comerciante das Raízes", category: "npc", coord: "(-30, -20)", x: 48, y: 52 },
  { id: "wn3", map: "worldtree", name: "Ferreiro Vulcânico", category: "npc", coord: "(260, 290)", x: 62, y: 32 },
];

const CATEGORY_META: Record<
  Category,
  { label: string; color: string; ring: string; icon: string }
> = {
  location: { label: "Locais", color: "oklch(0.78 0.02 250)", ring: "ring-slate-300", icon: "📍" },
  tower: { label: "Torres", color: "oklch(0.65 0.22 25)", ring: "ring-red-400", icon: "🗼" },
  alpha: { label: "Alpha Pals", color: "oklch(0.7 0.18 250)", ring: "ring-blue-400", icon: "⚔️" },
  dungeon: { label: "Dungeons", color: "oklch(0.75 0.18 85)", ring: "ring-amber-400", icon: "🏰" },
  egg: { label: "Ovos", color: "oklch(0.85 0.12 90)", ring: "ring-yellow-300", icon: "🥚" },
  resource: { label: "Recursos", color: "oklch(0.6 0.1 40)", ring: "ring-orange-400", icon: "⛏️" },
  fishing: { label: "Pesca", color: "oklch(0.72 0.13 200)", ring: "ring-cyan-400", icon: "🎣" },
  npc: { label: "NPCs", color: "oklch(0.68 0.15 320)", ring: "ring-fuchsia-400", icon: "🧑" },
};

const CATEGORY_ORDER: Category[] = [
  "location",
  "tower",
  "alpha",
  "dungeon",
  "egg",
  "resource",
  "fishing",
  "npc",
];

type SubDef = { key: string; label: string; icon: string; match: (m: Marker) => boolean };

const SUBCATEGORIES: Record<Category, SubDef[]> = {
  location: [
    { key: "fast_travel", label: "Fast Travel", icon: "🚩", match: (m) => m.name.startsWith("Fast Travel") },
    { key: "statue", label: "Estátua de Poder", icon: "🗿", match: (m) => m.name.includes("Santuário") || (m.note ?? "").includes("Estátua") },
    { key: "base", label: "Ponto Base", icon: "🏕️", match: (m) => m.name.includes("Base") && !m.name.startsWith("Fast Travel") },
    { key: "warp", label: "Ponto de Warp", icon: "🌀", match: () => false },
    { key: "respawn", label: "Ponto de Respawn", icon: "♻️", match: () => false },
    { key: "watchtower", label: "Torre de Vigia", icon: "🔭", match: () => false },
  ],
  tower: [
    { key: "boss_tower", label: "Torre de Chefe", icon: "🗼", match: () => true },
  ],
  alpha: [
    { key: "base_game", label: "Jogo Base", icon: "⚔️", match: (m) => !(m.note ?? "").includes("DLC") },
    { key: "dlc_sakura", label: "DLC Sakurajima", icon: "🌸", match: (m) => (m.note ?? "").includes("Sakurajima") },
    { key: "dlc_feybreak", label: "DLC Feybreak", icon: "❄️", match: (m) => (m.note ?? "").includes("Feybreak") },
    { key: "dlc_worldtree", label: "DLC World Tree", icon: "🌳", match: (m) => m.map === "worldtree" },
  ],
  dungeon: [
    { key: "normal", label: "Dungeon Normal", icon: "🏰", match: () => true },
    { key: "sealed", label: "Dungeon Selada", icon: "🔒", match: () => false },
  ],
  egg: [
    { key: "common", label: "Comum", icon: "🥚", match: (m) => m.name.includes("Comum") },
    { key: "hot", label: "Aquecido (Fogo)", icon: "🔥", match: (m) => m.name.includes("Aquecido") },
    { key: "damp", label: "Molhado (Água)", icon: "💧", match: (m) => m.name.includes("Molhado") },
    { key: "frozen", label: "Congelado (Gelo)", icon: "❄️", match: (m) => m.name.includes("Congelado") },
    { key: "verdant", label: "Enraizado (Grama)", icon: "🌿", match: (m) => m.name.includes("Enraizado") },
    { key: "electric", label: "Elétrico", icon: "⚡", match: (m) => m.name.includes("Elétrico") },
    { key: "dark", label: "Sombrio", icon: "🌑", match: (m) => m.name.includes("Sombrio") },
    { key: "rocky", label: "Rochoso (Terra)", icon: "🪨", match: (m) => m.name.includes("Rochoso") },
    { key: "dragon", label: "Dragônico", icon: "🐉", match: (m) => m.name.includes("Dragônico") },
  ],
  resource: [
    { key: "iron", label: "Ferro", icon: "⛓️", match: (m) => m.name.includes("Ferro") },
    { key: "coal", label: "Carvão", icon: "🪨", match: (m) => m.name.includes("Carvão") },
    { key: "sulfur", label: "Enxofre", icon: "🧪", match: (m) => m.name.includes("Enxofre") },
    { key: "quartz", label: "Quartzo", icon: "💎", match: (m) => m.name.includes("Quartzo") },
    { key: "fluid", label: "Fluido", icon: "🫧", match: (m) => m.name.includes("Fluido") },
    { key: "aluminum", label: "Alumínio", icon: "🥈", match: (m) => m.name.includes("Alumínio") },
    { key: "silver", label: "Prata", icon: "🪙", match: (m) => m.name.includes("Prata") },
    { key: "oil", label: "Petróleo", icon: "🛢️", match: (m) => m.name.includes("Petróleo") },
    { key: "obsidian", label: "Obsidiana", icon: "🖤", match: (m) => m.name.includes("Obsidiana") },
    { key: "crystal", label: "Cristal", icon: "🔷", match: (m) => m.name.includes("Cristal") },
    { key: "sand", label: "Areia Dourada", icon: "🏜️", match: (m) => m.name.includes("Areia") },
    { key: "shard", label: "Fragmento", icon: "✨", match: (m) => m.name.includes("Fragmento") && !m.name.includes("Fluido") },
    { key: "sap", label: "Seiva do Mundo", icon: "🌳", match: (m) => m.name.includes("Seiva") },
  ],
  fishing: [
    { key: "spot", label: "Ponto de Pesca", icon: "🎣", match: () => true },
  ],
  npc: [
    { key: "merchant", label: "Comerciante", icon: "🧑‍💼", match: (m) => m.name.includes("Comerciante") && !m.name.includes("Negro") },
    { key: "pal_merchant", label: "Mercador de Pals", icon: "🧑‍🌾", match: (m) => m.name.includes("Mercador de Pals") },
    { key: "medic", label: "Médico Ambulante", icon: "⚕️", match: (m) => m.name.includes("Médico") },
    { key: "black_market", label: "Mercado Negro", icon: "🕶️", match: (m) => m.name.includes("Negro") },
    { key: "cavalry", label: "Mestre de Cavalaria", icon: "🐴", match: (m) => m.name.includes("Cavalaria") },
    { key: "smith", label: "Ferreiro", icon: "🔨", match: (m) => m.name.includes("Ferreiro") },
    { key: "guardian", label: "Guardião", icon: "🛡️", match: (m) => m.name.includes("Guardiã") || m.name.includes("Guardião") },
  ],
};

function subKeyOf(m: Marker): string | null {
  const subs = SUBCATEGORIES[m.category];
  for (const s of subs) if (s.match(m)) return s.key;
  return null;
}


function MapaPage() {
  const [currentMap, setCurrentMap] = useState<MapId>("palpagos");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Set<Category>>(new Set(CATEGORY_ORDER));
  const [selected, setSelected] = useState<string | null>(null);

  const mapMarkers = useMemo(
    () => MARKERS.filter((m) => (m.map ?? "palpagos") === currentMap),
    [currentMap],
  );

  // Subcategories deselected per category (empty set = all subs active)
  const [excludedSubs, setExcludedSubs] = useState<Record<Category, Set<string>>>(
    () => Object.fromEntries(CATEGORY_ORDER.map((c) => [c, new Set<string>()])) as Record<Category, Set<string>>,
  );
  const [expanded, setExpanded] = useState<Set<Category>>(new Set(["location"]));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mapMarkers.filter((m) => {
      if (!active.has(m.category)) return false;
      const sub = subKeyOf(m);
      if (sub && excludedSubs[m.category].has(sub)) return false;
      if (q === "") return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.coord.toLowerCase().includes(q) ||
        (m.note ?? "").toLowerCase().includes(q)
      );
    });
  }, [query, active, excludedSubs, mapMarkers]);

  function toggle(c: Category) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  }

  function toggleExpanded(c: Category) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  }

  function toggleSub(c: Category, sub: string) {
    setExcludedSubs((prev) => {
      const next = { ...prev, [c]: new Set(prev[c]) };
      if (next[c].has(sub)) next[c].delete(sub);
      else next[c].add(sub);
      return next;
    });
  }

  function setAllSubs(c: Category, on: boolean) {
    setExcludedSubs((prev) => {
      const allKeys = SUBCATEGORIES[c].map((s) => s.key);
      return { ...prev, [c]: on ? new Set() : new Set(allKeys) };
    });
  }

  function setAll(on: boolean) {
    setActive(on ? new Set(CATEGORY_ORDER) : new Set());
  }

  const selectedMarker = mapMarkers.find((m) => m.id === selected);
  const totalCount = mapMarkers.length;
  const mapInfo = MAPS[currentMap];


  return (
    <main className="min-h-screen px-4 py-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <PalNav />

        <section className="rounded-2xl bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h1 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Mapa — {mapInfo.label}
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                {mapInfo.description}
              </p>
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {filtered.length}/{totalCount} pontos
            </span>
          </div>

          {/* Seletor de mapa */}
          <div className="mt-4 inline-flex rounded-lg border border-border p-1">
            {(Object.keys(MAPS) as MapId[]).map((id) => {
              const on = currentMap === id;
              return (
                <button
                  key={id}
                  onClick={() => {
                    setCurrentMap(id);
                    setSelected(null);
                  }}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    on
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  🗺️ {MAPS[id].label}
                </button>
              );
            })}
          </div>
        </section>


        <section className="grid gap-4 lg:grid-cols-[280px_1fr]">
          {/* Sidebar de filtros estilo palworld.th.gl */}
          <aside className="flex flex-col gap-3 rounded-2xl bg-card p-3 shadow-sm">
            <input
              type="text"
              placeholder="🔍 Buscar no mapa…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <div className="flex items-center justify-between px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Categorias</span>
              <div className="flex gap-2">
                <button onClick={() => setAll(true)} className="hover:text-foreground">
                  Tudo
                </button>
                <span className="text-border">·</span>
                <button onClick={() => setAll(false)} className="hover:text-foreground">
                  Nada
                </button>
              </div>
            </div>
            <ul className="flex flex-col gap-1">
              {CATEGORY_ORDER.map((c) => {
                const on = active.has(c);
                const meta = CATEGORY_META[c];
                const catMarkers = mapMarkers.filter((m) => m.category === c);
                const total = catMarkers.length;
                const excluded = excludedSubs[c];
                const activeCount = catMarkers.filter((m) => {
                  const s = subKeyOf(m);
                  return !s || !excluded.has(s);
                }).length;
                const isOpen = expanded.has(c);
                const subs = SUBCATEGORIES[c];

                return (
                  <li key={c} className="rounded-lg border border-border overflow-hidden">
                    <div className={`flex items-center gap-2 px-2 py-2 text-sm ${on ? "bg-muted" : ""}`}>
                      <button
                        onClick={() => toggle(c)}
                        aria-label={`Alternar ${meta.label}`}
                        className="flex items-center gap-2 flex-1 text-left"
                      >
                        <span
                          className="flex h-6 w-6 items-center justify-center rounded-full text-xs"
                          style={{ background: on ? meta.color : "transparent", border: on ? "none" : `1px solid ${meta.color}` }}
                        >
                          {meta.icon}
                        </span>
                        <span className={`font-medium ${on ? "text-foreground" : "text-muted-foreground"}`}>
                          {meta.label}
                        </span>
                      </button>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {on ? `${activeCount}/${total}` : `0/${total}`}
                      </span>
                      {subs.length > 1 && (
                        <button
                          onClick={() => toggleExpanded(c)}
                          aria-label={isOpen ? "Recolher" : "Expandir"}
                          className="text-muted-foreground hover:text-foreground text-xs w-5 text-center"
                        >
                          {isOpen ? "▾" : "▸"}
                        </button>
                      )}
                    </div>

                    {isOpen && subs.length > 1 && (
                      <div className="border-t border-border bg-background/50 p-2">
                        <div className="mb-1 flex items-center justify-between px-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                          <span>Subcategorias</span>
                          <div className="flex gap-2">
                            <button onClick={() => setAllSubs(c, true)} className="hover:text-foreground">
                              Todas
                            </button>
                            <span className="text-border">·</span>
                            <button onClick={() => setAllSubs(c, false)} className="hover:text-foreground">
                              Nenhuma
                            </button>
                          </div>
                        </div>
                        <ul className="grid grid-cols-1 gap-0.5">
                          {subs.map((s) => {
                            const subOn = !excluded.has(s.key);
                            const subCount = catMarkers.filter((m) => subKeyOf(m) === s.key).length;
                            const disabled = subCount === 0;
                            return (
                              <li key={s.key}>
                                <button
                                  onClick={() => toggleSub(c, s.key)}
                                  disabled={disabled}
                                  className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs transition ${
                                    disabled
                                      ? "text-muted-foreground/40 cursor-not-allowed"
                                      : subOn
                                        ? "bg-muted text-foreground"
                                        : "text-muted-foreground hover:bg-muted/50"
                                  }`}
                                >
                                  <span
                                    className={`flex h-4 w-4 items-center justify-center rounded border text-[9px] ${
                                      subOn && !disabled ? "bg-primary border-primary text-primary-foreground" : "border-border"
                                    }`}
                                  >
                                    {subOn && !disabled ? "✓" : ""}
                                  </span>
                                  <span className="text-[11px]">{s.icon}</span>
                                  <span className="flex-1 truncate">{s.label}</span>
                                  <span className="font-mono text-[9px] text-muted-foreground">
                                    {subCount}
                                  </span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}

            </ul>
          </aside>

          {/* Mapa */}
          <div className="flex flex-col gap-4">
            <div className="relative overflow-hidden rounded-2xl bg-card shadow-sm">
              <div className="relative aspect-square w-full">
                <img
                  src={mapInfo.image}
                  alt={`Mapa de ${mapInfo.label}`}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
                {filtered.map((m) => {
                  const meta = CATEGORY_META[m.category];
                  const isSel = selected === m.id;
                  const size = m.category === "tower" ? 20 : m.category === "alpha" || m.category === "dungeon" ? 16 : 12;
                  return (
                    <button
                      key={m.id}
                      onClick={() =>
                        setSelected((prev) => (prev === m.id ? null : m.id))
                      }
                      className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white text-[9px] shadow-md transition hover:scale-125 ${
                        isSel ? "z-10 scale-150 ring-2 ring-offset-2 " + meta.ring : ""
                      }`}
                      style={{
                        left: `${m.x}%`,
                        top: `${100 - m.y}%`,
                        width: size,
                        height: size,
                        background: meta.color,
                      }}
                      title={`${m.name}${m.level ? ` — Nv. ${m.level}` : ""}`}
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
                          {CATEGORY_META[selectedMarker.category].icon}{" "}
                          {CATEGORY_META[selectedMarker.category].label}
                        </span>
                        {selectedMarker.level != null && (
                          <span className="text-xs text-muted-foreground">
                            Nv. {selectedMarker.level}
                          </span>
                        )}
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

            {/* Lista dos filtrados */}
            <div className="max-h-[50vh] overflow-y-auto rounded-2xl bg-card p-3 shadow-sm">
              <div className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
              </div>
              <ul className="grid gap-1 sm:grid-cols-2">
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
                          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs"
                          style={{ background: meta.color }}
                        >
                          {meta.icon}
                        </span>
                        <span className="flex-1 truncate">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {m.name}
                          </span>
                          <span className="block truncate font-mono text-[10px] text-muted-foreground">
                            {m.level != null ? `Nv. ${m.level} · ` : ""}
                            {m.coord}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
                {filtered.length === 0 && (
                  <li className="col-span-full px-2 py-4 text-center text-xs text-muted-foreground">
                    Nenhum resultado com esses filtros.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-card p-4 text-xs text-muted-foreground shadow-sm">
          Referência de categorias inspirada em palworld.th.gl (Palpagos Island). Coordenadas seguem o padrão do jogo (X, Y). Alpha Pals reaparecem alguns minutos após serem derrotados; chefes de torre não reaparecem, mas a batalha pode ser refeita entrando novamente na torre.
        </section>
      </div>
    </main>
  );
}
