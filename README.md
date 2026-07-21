# Pal Guide

Guia completo de Palworld em português, com dados oficiais extraídos do dataset [`tylercamp/palcalc`](https://github.com/tylercamp/palcalc) (299 Pals e mais de 44.851 combinações de criação, atualizado até Feybreak / Tides of Terraria).

Aplicação construída com **TanStack Start + React 19 + Vite + Tailwind CSS v4**.

## Funcionalidades

A aplicação é dividida em 4 páginas acessíveis pelo menu superior (`PalNav`):

### 1. Pesquisas reprodutivas (`/`)
Calculadora e explorador de criação (breeding).
- Seleção de dois pais (**Criando um** e **Criação II**) via dropdown com todos os 299 Pals.
- Botão **Confirmar** que calcula o filhote resultante usando a fórmula oficial `child_power = floor((parent1 + parent2 + 1) / 2)` combinada com o mapa oficial de combinações.
- Grid **Combinações populares** com scroll infinito, exibindo mais de 44.851 combinações de pais → filhote.
- Embaralhamento aleatório (Fisher-Yates) das combinações a cada carregamento, garantindo variedade.
- Busca por nome de pai ou filhote.
- Ícones reais dos Pals servidos via CDN jsDelivr.

### 2. Mapa Estratégia Pal (`/mapa`)
Guia de biomas e regiões do mapa:
- Faixas de nível recomendadas por região.
- Localização de bosses e Pals notáveis.
- Dicas estratégicas de exploração.

### 3. Livro Ilustrado Pal (`/paldex`)
Paldex completo com todos os 299 Pals (incluindo DLCs).
- Grid responsivo com ícone, número (#001…), nome e poder de criação.
- **Busca** por nome ou número.
- **Filtros**:
  - Noturno: todos / não / sim.
  - Adaptabilidade ao trabalho: multi-seleção entre todas as aptidões (Kindling, Watering, Planting, Generating Electricity, Handiwork, Gathering, Lumbering, Mining, Medicine Production, Cooling, Transporting, Farming).
  - Botão **Reiniciar** e contador de filtros ativos.
- **Modal de detalhes** ao clicar em um Pal:
  - Identificação: número, nome exibido, nome interno, variante.
  - Estatísticas: raridade, tamanho, noturno, poder de criação, preço, nível selvagem (mín/máx), HP, ataque, defesa, estamina, velocidade de corrida, velocidade de montaria, velocidade de transporte, ingestão de alimentos, estômago cheio.
  - **Adaptabilidade ao trabalho** com nível de cada aptidão.
  - **Como obter**: lista de pares de pais que geram o Pal.
  - **Filhotes gerados**: combinações onde o Pal atua como pai.

### 4. Calculadora de valor individual (`/iv`)
Calculadora de IVs (Individual Values) usando a fórmula oficial de stats do jogo para estimar HP, Ataque e Defesa potenciais de um Pal a partir de seu nível e status base.

## Design

- Tema **dark** aplicado por padrão via classe `dark` no root.
- Tokens semânticos do Tailwind v4 (`bg-background`, `bg-card`, `text-muted-foreground`, …) definidos em `src/styles.css`.
- Componentes com cantos arredondados 2xl, sombras suaves e ring translúcido nos avatares.

## Fontes de dados

- **Pals + stats + breeding**: `https://raw.githubusercontent.com/tylercamp/palcalc/...` (`db.json`, `breeding.json`).
- **Localização PT-BR**: campo `LocalizedNames` do próprio dataset.
- **Ícones**: CDN jsDelivr apontando para os assets do `palcalc`.

Todos os dados são carregados em runtime e cacheados via TanStack Query (`staleTime: 1h`).

## Estrutura de rotas

```text
src/routes/
├── __root.tsx      # shell (html/head/body, dark mode)
├── index.tsx       # / — Pesquisas reprodutivas
├── mapa.tsx        # /mapa — Mapa Estratégia Pal
├── paldex.tsx      # /paldex — Livro Ilustrado Pal
└── iv.tsx          # /iv — Calculadora de valor individual
```

Navegação compartilhada em `src/components/PalNav.tsx` usando `Link` do TanStack Router com destaque da aba ativa.

## Desenvolvimento

```bash
bun install
bun dev
```

Preview em `http://localhost:8080`.
