# Usar o dataset real do palworld.th.gl

## O que descobri

O th.gl carrega dois arquivos binários (CBOR-LD) via CDN público:

- `cdn.th.gl/palworld/nodes/default.<hash>.raw` → **Palpagos Island**: 70.088 pinos em 472 tipos
- `cdn.th.gl/palworld/nodes/tree.<hash>.raw` → **The World Tree**: 3.115 pinos em 137 tipos

Já decodifiquei os dois em JSON aqui no sandbox. Cada pino tem `type`, `mapName`, `p:[x,y,z]` e às vezes um `id`.

Os tiles do mapa também são públicos:

- Palpagos: `cdn.th.gl/palworld/map-tiles/default-<hash>/{z}/{x}/{y}.webp`
- World Tree: `cdn.th.gl/palworld/map-tiles/tree-<hash>/{z}/{x}/{y}.webp`

## O que vou entregar

1. **Salvar os JSONs decodificados** em `public/data/palpagos.json` (~6,3 MB) e `public/data/tree.json` (~275 KB). Servidos com gzip ficam bem menores; carregam uma vez e são cacheados.
2. **Taxonomia automática** em `src/lib/mapa-taxonomy.ts` que mapeia os 508 tipos únicos para as 10 categorias do th.gl por prefixo:
   - `fasttravel`, `warp_point`, `respawn_point`, `goddess_statue`, `dungeon_*`, `hackable_tower`, `watchtower`, `enemy_camp`, `dimensional_rift`, `boss_tower` → **Locations**
   - `lifmunk_effigy`, `effigy_*`, `note` → **Collectibles**
   - `treasure_*`, `treasure_box`, `treasure_map` → **Treasures**
   - `grass_treasure`, `junk_yard`, `red_berry`, `mushroom`, `cave_mushroom`, `kinship_peach`, `skill_fruit`, `poppy`, `nightStone`, `icicle_piece`, `windchimes*` → **Pickups / Items**
   - `wood`, `stone_pickup`, `copper`, `paldiumOre`, `quartz`, `coal`, `sulfur`, `crude_oil`, `rainbowCrystal`, `chromium` → **Resources**
   - `magnet_fishing_spot*`, `fishing_spot*` → **Fishing**
   - `egg_*` → **Eggs**
   - `npc_*` → **NPCs**
   - `boss_*`, `predator_*` → subcategoria destacada em **Pals**
   - resto (nomes de criaturas) → **Pals**
   
   Cada subcategoria = o próprio `type` (nome legível gerado por regra: `egg_dragon` → "Egg — Dragon"), com contador X/Y automático.
3. **Tiles reais** via `L.tileLayer` no `MapCanvas.tsx` apontando para o CDN do th.gl, com CRS.Simple e bounds calibrados empiricamente (X/Y do jogo → pixel do tile).
4. **Coord transform** em `src/lib/mapa-coords.ts` — função `worldToLatLng(map, [x,y,z])` que mapeia coordenadas Unreal do dataset para o sistema de tiles.
5. **`mapa.tsx` reescrito para carregar os JSONs** via `fetch('/data/palpagos.json')`, construir a lista de marcadores com a taxonomia, e reusar o sidebar existente (ALL/NONE/DEFAULT, presets, Find filter, contadores). A UI não muda; só a fonte de dados.

## Ponto importante sobre uso do CDN alheio

Os tiles e o dataset ficam num CDN público do th.gl. Não há autenticação, mas é dataset proprietário deles (dataminaram do jogo). Se você publicar o site, ele passa a fazer hotlink dos assets — o th.gl pode bloquear via Referer a qualquer momento e o mapa quebra. Alternativa: baixar os tiles todos e hospedar no seu projeto (~centenas de MB, cabe se você quiser). Me diz se prefere hotlink (rápido, arriscado) ou baixar tudo (lento, estável).

## Detalhes técnicos

- Arquivos JSON servidos de `public/data/` viram estáticos no build; Vite não processa, então o tamanho não afeta o bundle JS.
- A calibração do coord transform vou fazer usando 3 fast-travel conhecidos como âncoras (world coords → pixel esperado no tile), calculando escala e offset por regressão linear.
- Ícones continuam Lucide por subcategoria — não vou baixar o sprite webp do th.gl.
- Zoom máximo dos tiles vou detectar em runtime tentando `z=6` e caindo pra `z=5` se 404.

## O que preciso de você

1. **Hotlink ou hospedar tiles localmente?** (padrão: hotlink)
2. **Confirma que topa 6,3 MB de JSON estático** no projeto pra ter os 70k pinos?
