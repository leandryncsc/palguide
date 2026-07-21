import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import { renderToStaticMarkup } from "react-dom/server";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { MAP_BOUNDS, TILE_URLS, TILE_SIZE, MAX_NATIVE_ZOOM, worldToLatLng } from "@/lib/mapa-coords";

export type CanvasMarker = {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  categoryColor: string;
  subLabel?: string;
  coord: string;
  worldX: number;
  worldY: number;
  note?: string;
  icon: React.ReactNode;
};

type MapId = "palpagos" | "worldtree";

type Props = {
  mapId: MapId;
  markers: CanvasMarker[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

function buildIcon(color: string, node: React.ReactNode, highlighted: boolean) {
  const svg = renderToStaticMarkup(node as React.ReactElement);
  const size = highlighted ? 28 : 22;
  const ring = highlighted ? `box-shadow: 0 0 0 2px #fff, 0 0 0 4px ${color};` : "";
  const html = `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${color};display:flex;align-items:center;justify-content:center;color:white;border:2px solid rgba(255,255,255,0.9);${ring}">${svg}</div>`;
  return L.divIcon({
    html,
    className: "pal-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function FitOnMapChange({ mapId }: { mapId: MapId }) {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds([-TILE_SIZE, 0], [0, TILE_SIZE]);
    map.setMaxBounds(bounds.pad(0.2));
    map.fitBounds(bounds);
  }, [map, mapId]);
  return null;
}

function ClusterLayer({
  markers,
  selectedId,
  onSelect,
  mapId,
}: {
  markers: CanvasMarker[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  mapId: MapId;
}) {
  const map = useMap();
  const groupRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const group = (L as any).markerClusterGroup({
      chunkedLoading: true,
      chunkInterval: 100,
      maxClusterRadius: 50,
      disableClusteringAtZoom: MAX_NATIVE_ZOOM,
      spiderfyOnMaxZoom: false,
    }) as L.MarkerClusterGroup;
    groupRef.current = group;
    map.addLayer(group);
    return () => {
      map.removeLayer(group);
      groupRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    group.clearLayers();
    const bounds = MAP_BOUNDS[mapId];
    const leafletMarkers: L.Marker[] = [];
    for (const m of markers) {
      const pos = worldToLatLng(m.worldX, m.worldY, bounds);
      const marker = L.marker(pos, {
        icon: buildIcon(m.categoryColor, m.icon, selectedId === m.id),
      });
      marker.bindPopup(
        `<div style="min-width:180px;font-family:inherit">
          <div style="display:inline-block;padding:2px 6px;border-radius:4px;background:${m.categoryColor};color:white;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">
            ${m.categoryLabel}${m.subLabel ? " · " + m.subLabel : ""}
          </div>
          <div style="font-size:13px;font-weight:700">${escapeHtml(m.name)}</div>
          <div style="margin-top:4px;font-family:ui-monospace,monospace;font-size:11px;opacity:.7">${m.coord}</div>
          ${m.note ? `<div style="margin-top:4px;font-size:12px">${escapeHtml(m.note)}</div>` : ""}
        </div>`,
      );
      marker.on("click", () => onSelect(m.id));
      marker.on("popupclose", () => onSelect(null));
      leafletMarkers.push(marker);
    }
    group.addLayers(leafletMarkers);
  }, [markers, selectedId, onSelect, mapId]);

  return null;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default function MapCanvas({ mapId, markers, selectedId, onSelect }: Props) {
  const bounds = useMemo(() => L.latLngBounds([-TILE_SIZE, 0], [0, TILE_SIZE]), []);

  return (
    <div className="h-[70vh] w-full overflow-hidden rounded-2xl bg-black">
      <MapContainer
        crs={L.CRS.Simple}
        bounds={bounds}
        minZoom={0}
        maxZoom={MAX_NATIVE_ZOOM + 2}
        zoom={2}
        attributionControl={false}
        zoomControl={true}
        style={{ height: "100%", width: "100%", background: "#0b1220" }}
      >
        <FitOnMapChange mapId={mapId} />
        <TileLayer
          key={mapId}
          url={TILE_URLS[mapId]}
          tileSize={TILE_SIZE}
          minZoom={0}
          maxNativeZoom={MAX_NATIVE_ZOOM}
          maxZoom={MAX_NATIVE_ZOOM + 2}
          noWrap
          bounds={bounds}
        />
        <ClusterLayer mapId={mapId} markers={markers} selectedId={selectedId} onSelect={onSelect} />
      </MapContainer>
    </div>
  );
}
