import { createFileRoute } from "@tanstack/react-router";
import { PalNav } from "@/components/PalNav";

export const Route = createFileRoute("/mapa")({
  head: () => ({
    meta: [
      { title: "Mapa Estratégia Pal — Guia de biomas de Palworld" },
      {
        name: "description",
        content:
          "Guia estratégico das regiões de Palworld: biomas, chefes de torre, dungeons e Pals raros por área.",
      },
      { property: "og:title", content: "Mapa Estratégia de Palworld" },
      {
        property: "og:description",
        content: "Biomas, torres e dungeons de Palworld.",
      },
    ],
  }),
  component: MapaPage,
});

const regions = [
  {
    name: "Planalto Ventoso",
    level: "1 - 15",
    biome: "Campos temperados",
    tower: "Torre de Rayne — Zoe & Grizzbolt",
    pals: ["Lamball", "Cattiva", "Chikipi", "Foxparks", "Pengullet"],
    color: "oklch(0.72 0.14 145)",
  },
  {
    name: "Bosque do Sábio",
    level: "10 - 25",
    biome: "Floresta densa",
    tower: "—",
    pals: ["Gumoss", "Tanzee", "Bristla", "Robinquill", "Dinossom"],
    color: "oklch(0.68 0.16 155)",
  },
  {
    name: "Deserto Ardente",
    level: "20 - 35",
    biome: "Areia + vulcânico",
    tower: "Torre de PIDF — Axel & Orserk",
    pals: ["Rooby", "Foxparks Cryst", "Anubis", "Jormuntide Ignis"],
    color: "oklch(0.72 0.17 55)",
  },
  {
    name: "Ilha Congelada",
    level: "30 - 45",
    biome: "Neve e gelo",
    tower: "Torre da Frostallion — Marcus & Faleris",
    pals: ["Cryolinx", "Reindrix", "Sibelyx", "Wumpo", "Frostallion"],
    color: "oklch(0.82 0.09 210)",
  },
  {
    name: "Ilha da Cabeça Rachada",
    level: "40 - 50",
    biome: "Vulcânico",
    tower: "Torre da Lírica — Victor & Shadowbeak",
    pals: ["Blazamut", "Suzaku", "Reptyro", "Menasting"],
    color: "oklch(0.62 0.19 25)",
  },
  {
    name: "Santuário da Ilha Sakurajima",
    level: "45 - 55",
    biome: "DLC — Ilha oriental",
    tower: "Torre de Saya — Selyne",
    pals: ["Selyne", "Xenolord", "Bastigor", "Wixen Noct"],
    color: "oklch(0.68 0.17 335)",
  },
  {
    name: "Feybreak",
    level: "50 - 60",
    biome: "DLC — Ilha do oeste",
    tower: "Torre de Bjorn & Bastigor",
    pals: ["Bjorn", "Bjorn Bastet", "Terizodon", "Wixen Aqua"],
    color: "oklch(0.7 0.15 280)",
  },
];

function MapaPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <PalNav />

        <section className="rounded-2xl bg-card p-6 shadow-sm">
          <h1 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Mapa Estratégia Pal
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Regiões principais de Palworld com faixa de nível recomendada, chefes de torre e Pals
            característicos.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {regions.map((r) => (
            <article
              key={r.name}
              className="overflow-hidden rounded-2xl bg-card shadow-[0_4px_20px_rgba(80,120,200,0.08)]"
            >
              <div className="h-2 w-full" style={{ background: r.color }} />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{r.name}</h2>
                    <p className="text-xs text-muted-foreground">{r.biome}</p>
                  </div>
                  <span
                    className="rounded-full px-2 py-1 text-[10px] font-semibold text-white"
                    style={{ background: r.color }}
                  >
                    Nv. {r.level}
                  </span>
                </div>
                <div className="mt-3 text-xs">
                  <span className="text-muted-foreground">Torre: </span>
                  <span className="text-foreground">{r.tower}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {r.pals.map((p) => (
                    <span
                      key={p}
                      className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-2xl bg-card p-6 text-xs text-muted-foreground shadow-sm">
          Dica: use a bússola do jogo para localizar Estátuas de Poder (aumentam HP/ATK/DEF do
          jogador) e Grandes Ovos raros em cada região.
        </section>
      </div>
    </main>
  );
}
