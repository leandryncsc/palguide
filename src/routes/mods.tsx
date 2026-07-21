import { createFileRoute } from "@tanstack/react-router";
import { PalNav } from "@/components/PalNav";

export const Route = createFileRoute("/mods")({
  head: () => ({
    meta: [
      { title: "Palu MOD — Mods populares de Palworld" },
      {
        name: "description",
        content:
          "Lista curada dos mods mais populares de Palworld: qualidade de vida, novos Pals, texturas e ferramentas de save.",
      },
      { property: "og:title", content: "Palu MOD — Mods de Palworld" },
      { property: "og:description", content: "Mods populares de Palworld." },
    ],
  }),
  component: ModsPage,
});

const categories = [
  {
    title: "Qualidade de Vida",
    mods: [
      {
        name: "Better Palbox",
        desc: "Ordenação, filtros e busca dentro da caixa de Pals.",
        url: "https://www.nexusmods.com/palworld/",
      },
      {
        name: "Faster Crafting",
        desc: "Reduz o tempo de fabricação e acelera bases inteiras.",
        url: "https://www.nexusmods.com/palworld/",
      },
      {
        name: "No Weight Limit",
        desc: "Remove o limite de peso do inventário.",
        url: "https://www.nexusmods.com/palworld/",
      },
    ],
  },
  {
    title: "Novos Pals e Skins",
    mods: [
      {
        name: "Pokéworld",
        desc: "Substitui modelos de Pals por Pokémon clássicos.",
        url: "https://www.nexusmods.com/palworld/",
      },
      {
        name: "Shiny Pals Reshade",
        desc: "Variantes shiny de todos os Pals do jogo.",
        url: "https://www.nexusmods.com/palworld/",
      },
    ],
  },
  {
    title: "Save e Debug",
    mods: [
      {
        name: "PalEdit",
        desc: "Editor de save: renomear Pals, alterar IVs, passivas e nível.",
        url: "https://github.com/EternalWraith/PalEdit",
      },
      {
        name: "palworld-save-tools",
        desc: "Converte saves .sav em JSON para edição avançada.",
        url: "https://github.com/cheahjs/palworld-save-tools",
      },
    ],
  },
  {
    title: "Servidor Dedicado",
    mods: [
      {
        name: "PalGuard",
        desc: "Painel de admin, teleporte e proteção anti-abuso.",
        url: "https://github.com/magicaltrevor/PalGuard",
      },
      {
        name: "PalServerTool",
        desc: "Ferramenta para iniciar e configurar o servidor no Windows.",
        url: "https://github.com/",
      },
    ],
  },
];

function ModsPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <PalNav />

        <section className="rounded-2xl bg-card p-6 shadow-sm">
          <h1 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Palu MOD
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Coleção de mods populares para Palworld. Sempre faça backup do save antes de instalar
            mods e verifique compatibilidade com a versão atual do jogo.
          </p>
        </section>

        {categories.map((cat) => (
          <section key={cat.title} className="rounded-2xl bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-foreground">{cat.title}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {cat.mods.map((m) => (
                <a
                  key={m.name}
                  href={m.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group flex flex-col gap-1 rounded-xl border border-input bg-background/40 p-4 transition hover:border-primary hover:bg-card"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary">
                      {m.name}
                    </span>
                    <span className="text-xs text-muted-foreground">↗</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{m.desc}</span>
                </a>
              ))}
            </div>
          </section>
        ))}

        <p className="pb-4 text-center text-[11px] text-muted-foreground">
          Links direcionam para Nexus Mods e GitHub oficiais dos autores.
        </p>
      </div>
    </main>
  );
}
