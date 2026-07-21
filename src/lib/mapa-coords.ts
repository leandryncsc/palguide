// Coordinate transform: Palworld world (Unreal cm) → Leaflet CRS.Simple pixels.
//
// Values below are extracted verbatim from palworld.th.gl's tilesConfig:
//   pixel_x = a * game_lng + b   (at z=0)
//   pixel_y = c * game_lat + d   (at z=0)
// where p[0] = game_lat and p[1] = game_lng.
//
// Our Leaflet map uses CRS.Simple with a 512×512 tile at z=0, so the pyramid
// pixel space is lat ∈ [-512, 0], lng ∈ [0, 512]. In CRS.Simple:
//   leaflet_lng = pixel_x
//   leaflet_lat = -pixel_y

import L from "leaflet";

export const TILE_SIZE = 512;
export const MAX_NATIVE_ZOOM = 4;

type MapKey = "palpagos" | "worldtree";

// [a, b, c, d] transformation from th.gl config.
const TRANSFORM: Record<MapKey, [number, number, number, number]> = {
  palpagos: [0.000353395913859746, 256, -0.000353395913859746, 123.47653230259525],
  worldtree: [
    0.0014979651664584533,
    1225.6306053008072,
    -0.0014979651664584533,
    1032.3204475170935,
  ],
};

export const TILE_URLS: Record<MapKey, string> = {
  palpagos:
    "https://cdn.th.gl/palworld/map-tiles/default-733001e0986faa3f88b0a970412d7fb9/{z}/{y}/{x}.webp?v=1",
  worldtree:
    "https://cdn.th.gl/palworld/map-tiles/tree-bd046c3cfb06ee41b25a111f912d407f/{z}/{y}/{x}.webp?v=1",
};

// Kept for API compatibility; callers pass this along to worldToLatLng.
export type MapBounds = { key: MapKey };
export const MAP_BOUNDS: Record<MapKey, MapBounds> = {
  palpagos: { key: "palpagos" },
  worldtree: { key: "worldtree" },
};

export function worldToLatLng(
  gameLat: number,
  gameLng: number,
  bounds: MapBounds,
): L.LatLngExpression {
  const [a, b, c, d] = TRANSFORM[bounds.key];
  const pixelX = a * gameLng + b;
  const pixelY = c * gameLat + d;
  return [-pixelY, pixelX];
}

export function worldToGameCoord(x: number, y: number): string {
  return `(${Math.round(x / 1000)}, ${Math.round(y / 1000)})`;
}
