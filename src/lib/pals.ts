// Curated dataset of Palworld pals with breeding power values.
// Breeding formula: child_power = floor((parent1 + parent2 + 1) / 2)
// The offspring is the Pal whose breed power is closest to that value.

export type Element =
  | "Neutro"
  | "Fogo"
  | "Água"
  | "Grama"
  | "Elétrico"
  | "Gelo"
  | "Terra"
  | "Sombrio"
  | "Dragão";

export interface Pal {
  id: string;
  name: string;
  power: number; // breed power
  element: Element;
  element2?: Element;
}

// Sorted arbitrarily; ordering doesn't matter for the algorithm.
export const PALS: Pal[] = [
  { id: "lamball", name: "Lamball", power: 1470, element: "Neutro" },
  { id: "cattiva", name: "Cattiva", power: 1500, element: "Neutro" },
  { id: "chikipi", name: "Chikipi", power: 1500, element: "Neutro" },
  { id: "lifmunk", name: "Lifmunk", power: 1410, element: "Grama" },
  { id: "foxparks", name: "Foxparks", power: 1370, element: "Fogo" },
  { id: "fuack", name: "Fuack", power: 1360, element: "Água" },
  { id: "sparkit", name: "Sparkit", power: 1330, element: "Elétrico" },
  { id: "tanzee", name: "Tanzee", power: 1320, element: "Grama" },
  { id: "rooby", name: "Rooby", power: 1230, element: "Fogo" },
  { id: "pengullet", name: "Pengullet", power: 1290, element: "Água", element2: "Gelo" },
  { id: "penking", name: "Penking", power: 500, element: "Água", element2: "Gelo" },
  { id: "jolthog", name: "Jolthog", power: 1310, element: "Elétrico" },
  { id: "gumoss", name: "Gumoss", power: 1300, element: "Grama", element2: "Sombrio" },
  { id: "vixy", name: "Vixy", power: 1500, element: "Neutro" },
  { id: "hoocrates", name: "Hoocrates", power: 1240, element: "Sombrio" },
  { id: "teafant", name: "Teafant", power: 1350, element: "Água" },
  { id: "depresso", name: "Depresso", power: 1220, element: "Sombrio" },
  { id: "cremis", name: "Cremis", power: 1490, element: "Neutro" },
  { id: "daedream", name: "Daedream", power: 1160, element: "Sombrio" },
  { id: "rushoar", name: "Rushoar", power: 1140, element: "Terra" },
  { id: "nox", name: "Nox", power: 1120, element: "Sombrio" },
  { id: "fuddler", name: "Fuddler", power: 1100, element: "Terra" },
  { id: "killamari", name: "Killamari", power: 1080, element: "Sombrio" },
  { id: "mau", name: "Mau", power: 1050, element: "Sombrio" },
  { id: "celaray", name: "Celaray", power: 1020, element: "Água" },
  { id: "direhowl", name: "Direhowl", power: 970, element: "Neutro" },
  { id: "tocotoco", name: "Tocotoco", power: 990, element: "Neutro" },
  { id: "flopie", name: "Flopie", power: 960, element: "Grama" },
  { id: "mozzarina", name: "Mozzarina", power: 940, element: "Neutro" },
  { id: "bristla", name: "Bristla", power: 930, element: "Grama" },
  { id: "gobfin", name: "Gobfin", power: 920, element: "Água" },
  { id: "hangyu", name: "Hangyu", power: 900, element: "Terra" },
  { id: "mossanda", name: "Mossanda", power: 300, element: "Grama" },
  { id: "woolipop", name: "Woolipop", power: 890, element: "Neutro" },
  { id: "caprity", name: "Caprity", power: 880, element: "Grama" },
  { id: "melpaca", name: "Melpaca", power: 860, element: "Neutro" },
  { id: "eikthyrdeer", name: "Eikthyrdeer", power: 840, element: "Neutro" },
  { id: "nitewing", name: "Nitewing", power: 830, element: "Neutro" },
  { id: "ribbuny", name: "Ribbuny", power: 820, element: "Neutro" },
  { id: "incineram", name: "Incineram", power: 780, element: "Fogo", element2: "Sombrio" },
  { id: "cinnamoth", name: "Cinnamoth", power: 770, element: "Grama" },
  { id: "arsox", name: "Arsox", power: 700, element: "Fogo" },
  { id: "dumud", name: "Dumud", power: 690, element: "Terra" },
  { id: "cawgnito", name: "Cawgnito", power: 680, element: "Sombrio" },
  { id: "leezpunk", name: "Leezpunk", power: 670, element: "Sombrio" },
  { id: "loupmoon", name: "Loupmoon", power: 660, element: "Sombrio" },
  { id: "galeclaw", name: "Galeclaw", power: 650, element: "Neutro" },
  { id: "robinquill", name: "Robinquill", power: 640, element: "Grama" },
  { id: "gorirat", name: "Gorirat", power: 630, element: "Neutro" },
  { id: "beegarde", name: "Beegarde", power: 620, element: "Grama" },
  { id: "elizabee", name: "Elizabee", power: 610, element: "Grama" },
  { id: "grintale", name: "Grintale", power: 600, element: "Neutro" },
  { id: "swee", name: "Swee", power: 1160, element: "Gelo" },
  { id: "sweepa", name: "Sweepa", power: 580, element: "Gelo" },
  { id: "chillet", name: "Chillet", power: 570, element: "Gelo", element2: "Dragão" },
  { id: "univolt", name: "Univolt", power: 560, element: "Elétrico" },
  { id: "foxcicle", name: "Foxcicle", power: 550, element: "Gelo" },
  { id: "pyrin", name: "Pyrin", power: 350, element: "Fogo" },
  { id: "reindrix", name: "Reindrix", power: 460, element: "Gelo" },
  { id: "rayhound", name: "Rayhound", power: 440, element: "Elétrico" },
  { id: "kitsun", name: "Kitsun", power: 400, element: "Fogo" },
  { id: "dazzi", name: "Dazzi", power: 390, element: "Elétrico" },
  { id: "lunaris", name: "Lunaris", power: 380, element: "Neutro" },
  { id: "digtoise", name: "Digtoise", power: 370, element: "Terra" },
  { id: "tombat", name: "Tombat", power: 340, element: "Sombrio" },
  { id: "lovander", name: "Lovander", power: 330, element: "Neutro" },
  { id: "flambelle", name: "Flambelle", power: 320, element: "Fogo" },
  { id: "vanwyrm", name: "Vanwyrm", power: 310, element: "Fogo", element2: "Sombrio" },
  { id: "bushi", name: "Bushi", power: 280, element: "Fogo" },
  { id: "beakon", name: "Beakon", power: 260, element: "Elétrico" },
  { id: "ragnahawk", name: "Ragnahawk", power: 250, element: "Fogo" },
  { id: "katress", name: "Katress", power: 240, element: "Sombrio" },
  { id: "wixen", name: "Wixen", power: 230, element: "Fogo" },
  { id: "verdash", name: "Verdash", power: 220, element: "Grama" },
  { id: "vaelet", name: "Vaelet", power: 210, element: "Grama" },
  { id: "sibelyx", name: "Sibelyx", power: 200, element: "Gelo" },
  { id: "elphidran", name: "Elphidran", power: 180, element: "Dragão" },
  { id: "kelpsea", name: "Kelpsea", power: 1090, element: "Água" },
  { id: "azurobe", name: "Azurobe", power: 170, element: "Água", element2: "Dragão" },
  { id: "cryolinx", name: "Cryolinx", power: 160, element: "Gelo" },
  { id: "blazehowl", name: "Blazehowl", power: 150, element: "Fogo" },
  { id: "relaxaurus", name: "Relaxaurus", power: 140, element: "Dragão" },
  { id: "broncherry", name: "Broncherry", power: 130, element: "Grama" },
  { id: "petallia", name: "Petallia", power: 120, element: "Grama" },
  { id: "surfent", name: "Surfent", power: 110, element: "Água" },
  { id: "grizzbolt", name: "Grizzbolt", power: 100, element: "Elétrico" },
  { id: "kingpaca", name: "Kingpaca", power: 90, element: "Neutro" },
  { id: "mammorest", name: "Mammorest", power: 80, element: "Grama" },
  { id: "wumpo", name: "Wumpo", power: 70, element: "Gelo" },
  { id: "warsect", name: "Warsect", power: 60, element: "Terra", element2: "Grama" },
  { id: "quivern", name: "Quivern", power: 50, element: "Dragão" },
  { id: "menasting", name: "Menasting", power: 40, element: "Terra", element2: "Sombrio" },
  { id: "anubis", name: "Anubis", power: 30, element: "Terra" },
  { id: "jormuntide", name: "Jormuntide", power: 20, element: "Água", element2: "Dragão" },
  { id: "suzaku", name: "Suzaku", power: 15, element: "Fogo" },
  { id: "grizzbolt2", name: "Faleris", power: 45, element: "Fogo" },
  { id: "orserk", name: "Orserk", power: 25, element: "Dragão", element2: "Elétrico" },
  { id: "shadowbeak", name: "Shadowbeak", power: 10, element: "Sombrio" },
  { id: "frostallion", name: "Frostallion", power: 5, element: "Gelo" },
  { id: "jetragon", name: "Jetragon", power: 5, element: "Dragão" },
  { id: "paladius", name: "Paladius", power: 5, element: "Neutro" },
  { id: "necromus", name: "Necromus", power: 5, element: "Sombrio" },
  { id: "blazamut", name: "Blazamut", power: 5, element: "Fogo" },
];

export function computeChild(a: Pal, b: Pal): Pal {
  const target = Math.floor((a.power + b.power + 1) / 2);
  // Find pal with closest power. Ties broken by lower id string (deterministic).
  let best = PALS[0];
  let bestDiff = Math.abs(best.power - target);
  for (const p of PALS) {
    const d = Math.abs(p.power - target);
    if (d < bestDiff || (d === bestDiff && p.id < best.id)) {
      best = p;
      bestDiff = d;
    }
  }
  return best;
}

export const ELEMENT_COLORS: Record<Element, string> = {
  Neutro: "oklch(0.75 0.02 90)",
  Fogo: "oklch(0.68 0.19 35)",
  Água: "oklch(0.72 0.13 230)",
  Grama: "oklch(0.72 0.16 145)",
  Elétrico: "oklch(0.85 0.16 95)",
  Gelo: "oklch(0.82 0.09 210)",
  Terra: "oklch(0.62 0.09 60)",
  Sombrio: "oklch(0.42 0.07 300)",
  Dragão: "oklch(0.58 0.16 285)",
};
