// Coordinate transform: Palworld world (Unreal cm) → Leaflet CRS.Simple pixels.
//
// th.gl's map is a slippy tile pyramid at zoom 0..4 with 512px tiles.
// At z=0 the whole map is a single 512×512 tile.
// IMPORTANT: the CDN path stores tile coordinates as /row/column, while
// Leaflet requests /column/row. TILE_URLS intentionally swaps {x}/{y}.
// CRS.Simple uses lng as pixel X and -lat as pixel Y.

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
    "https://cdn.th.gl/palworld/map-tiles/default-733001e0986faa3f88b0a970412d7fb9/{z}/{y}/{x}.webp?v=1",
  worldtree:
    "https://cdn.th.gl/palworld/map-tiles/tree-bd046c3cfb06ee41b25a111f912d407f/{z}/{y}/{x}.webp?v=1",
};

export function worldToLatLng(
  x: number,
  y: number,
  bounds: MapBounds,
): L.LatLngExpression {
  const nx = (x - bounds.minX) / (bounds.maxX - bounds.minX);
  const ny = (y - bounds.minY) / (bounds.maxY - bounds.minY);
  // CRS.Simple default: lat = -pixelY. Top of map = lat 0, bottom = lat -TILE_SIZE.
  // Higher game Y = further "up" on the map = pixel Y closer to 0 = lat closer to 0.
  const lat = -(1 - ny) * TILE_SIZE;
  const lng = nx * TILE_SIZE;
  return [lat, lng];
}

// Convert world (x, y) to the in-game grid coordinate strings th.gl shows
// (roughly world / 1000 with rounding).
export function worldToGameCoord(x: number, y: number): string {
  return `(${Math.round(x / 1000)}, ${Math.round(y / 1000)})`;
}
