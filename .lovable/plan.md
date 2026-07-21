# Replicar palworld.th.gl (Palpagos + World Tree)

## Situação atual

O `palworld.th.gl` é um mapa WebGL2 com dataset proprietário. Não há endpoint público JSON — a página inicial retorna `WebGL2 not supported` sem o cliente e a rota `/api/nodes` responde 404. Reproduzir "exatamente igual" exige:

- **~500–1000 marcadores por mapa** com coordenadas exatas (Fast Travel, Torres, Alphas, Dungeons, Ovos, Recursos, Pesca, NPCs, Colecionáveis, Itens, Pickups, Tesouros e **417 Pals** com spawns).
- **Ícones SVG personalizados** por subcategoria (o site usa um sprite próprio).
- **Mapa vetorial WebGL** com zoom/pan fluido.

Nenhum desses três está disponível como dataset aberto pronto — cada projeto que tentou (palworld.lol, game8, ARXII-13) fez datamining próprio do `.pak` do jogo. Copiar direto do th.gl seria violar TOS.

## O que dá pra entregar

Vou entregar em duas fases. Preciso da sua confirmação antes de começar porque a fase 2 é pesada.

### Fase 1 — Paridade visual e de UX (esta entrega)

Sem depender de dataset novo, deixar a interface idêntica:

1. **Layout do sidebar** igual ao th.gl: busca no topo, seletor de mapa em accordion, linha `ALL / NONE / DEFAULT / PRESETS`, campo `Find filter…`, seção `My Filters`, e as 10 categorias na mesma ordem (Locations, Collectibles, Items, Pickups, Treasures, Fishing, Eggs, Resources, Pals, NPCs) com contador `X/Y` e botão `ALL`/`NONE` por linha.
2. **Ícones Lucide equivalentes** para cada subcategoria (Fast Travel = losango, Torre = escudo, Alpha = estrela, Ovo = ovo, Peixe = peixe, etc.) — não é o sprite do th.gl, mas é consistente e legível.
3. **Zoom e pan reais** no mapa (substituir a imagem estática por `react-leaflet` com `CRS.Simple`, permitindo scroll-zoom, drag e cluster automático de pins próximos).
4. **Filtro `Find filter…`** que filtra as próprias subcategorias pelo nome digitado.
5. **Presets** salvos em `localStorage` (usuário marca combinação e salva com nome).
6. **Popup rico** ao clicar num pin: nome, nível, coordenadas de jogo, screenshot placeholder e link "copiar coordenada".

Os marcadores continuam com o dataset atual (curado manualmente, ~40–60 pontos por mapa cobrindo os principais Fast Travel, Torres, Alphas, Dungeons e NPCs). Isso é o realista sem datamining.

### Fase 2 — Dataset completo (opcional, requer sua decisão)

Para chegar aos **417 Pals + ~1000 marcadores por mapa** do th.gl, existem três caminhos, todos com trade-offs:

- **A. Datamining do jogo**: rodar `palworld-pal-extractor` sobre o `.pak` do Palworld. Requer o jogo instalado no seu PC e algumas horas de execução; retorna JSON completo. Não posso rodar isso daqui.
- **B. Usar `ARXII-13/Palworld-Interactive-Map`** (Apache-2.0): tem um dataset parcial já datamined; posso importar direto. Cobertura estimada: ~60–70% do th.gl.
- **C. Colaborar via issue**: pedir ao dono do th.gl acesso ao dataset (ele é responsivo no Discord). Sem previsão.

## Detalhes técnicos

- `react-leaflet` + `leaflet` com `CRS.Simple` e `imageOverlay` para os PNGs de mapa; suporta zoom até nível 4 sem perder qualidade se a imagem for ≥ 4096px.
- Cada marcador: `{ id, category, sub, name, level?, x, y, mapId }`. Ícones renderizados via `L.divIcon` embrulhando um componente Lucide.
- Filtros ficam num store leve (Zustand) para reagir a busca, toggles e presets sem re-render do mapa inteiro.
- `mapa.tsx` vai ficar grande — vou quebrar em `MapCanvas`, `MapSidebar`, `MapFilters`, `MapMarker`, `useMapFilters` hook.

## O que preciso decidir com você

1. **Confirma que ícones Lucide equivalentes servem** (não vou copiar o sprite proprietário do th.gl)?
2. **Vamos com Fase 1 agora** e depois você decide entre A/B/C para a Fase 2, ou quer que eu já importe o dataset parcial do ARXII-13 nesta entrega?
