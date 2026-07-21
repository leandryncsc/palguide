// Coordinate transform: Palworld world (Unreal cm) → Leaflet CRS.Simple pixels.
//
// th.gl's map is a slippy tile pyramid at zoom 0..4 with 512px tiles.
// At z=0 the whole map is a single 512×512 tile.
// CRS.Simple treats [lat, lng] as [pixelY_from_top, pixelX_from_left].
// So world (x, y) → latlng ((1 - ny) * 512, nx * 512) where ny/nx ∈ [0,1].

import L from "leaflet";

export const TILE_SIZE = 512;
export const MAX_NATIVE_ZOOM = 4;

export type MapBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

// Empirical bounds — chosen to fit each tile pyramid.
export const MAP_BOUNDS: Record<"palpagos" | "worldtree", MapBounds> = {
  // Symmetric ±1.1M covers main Palpagos + Sakurajima + Feybreak.
  palpagos: { minX: -1_100_000, maxX: 1_100_000, minY: -1_100_000, maxY: 1_100_000 },
  // The Tree pyramid is a smaller region; fit around observed data with margin.
  worldtree: { minX: 335_000, maxX: 655_000, minY: -793_000, maxY: -473_000 },
};

export const TILE_URLS: Record<"palpagos" | "worldtree", string> = {
  palpagos:
    "https://cdn.th.gl/palworld/map-tiles/default-733001e0986faa3f88b0a970412d7fb9/{z}/{x}/{y}.webp?v=1",
  worldtree:
    "https://cdn.th.gl/palworld/map-tiles/tree-bd046c3cfb06ee41b25a111f912d407f/{z}/{x}/{y}.webp?v=1",
};

export function worldToLatLng(
  x: number,
  y: number,
  bounds: MapBounds,
): L.LatLngExpression {
  const nx = (x - bounds.minX) / (bounds.maxX - bounds.minX);
  const ny = (y - bounds.minY) / (bounds.maxY - bounds.minY);
  // Leaflet lat grows downward with CRS.Simple; higher game Y = further "up" on the map,
  // which visually is smaller pixel Y. So flip on lat.
  const lat = (1 - ny) * TILE_SIZE;
  const lng = nx * TILE_SIZE;
  return [lat, lng];
}

// Convert world (x, y) to the in-game grid coordinate strings th.gl shows
// (roughly world / 1000 with rounding).
export function worldToGameCoord(x: number, y: number): string {
  return `(${Math.round(x / 1000)}, ${Math.round(y / 1000)})`;
}
