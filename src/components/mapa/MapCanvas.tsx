import { useEffect, useMemo, useRef } from "react";
import { MapContainer, ImageOverlay, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import "leaflet/dist/leaflet.css";

export type CanvasMarker = {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  categoryColor: string;
  subLabel?: string;
  level?: number | string;
  coord: string;
  x: number; // 0-100
  y: number; // 0-100
  note?: string;
  icon: React.ReactNode;
};

type Props = {
  image: string;
  markers: CanvasMarker[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

const MAP_W = 1000;
const MAP_H = 1000;

function buildIcon(color: string, node: React.ReactNode, highlighted: boolean) {
  const svg = renderToStaticMarkup(node as React.ReactElement);
  const size = highlighted ? 32 : 26;
  const ring = highlighted ? "box-shadow: 0 0 0 2px #fff, 0 0 0 4px " + color + ";" : "";
  const html = `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${color};display:flex;align-items:center;justify-content:center;color:white;border:2px solid rgba(255,255,255,0.9);${ring}">${svg}</div>`;
  return L.divIcon({
    html,
    className: "pal-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function FitOnLoad({ image }: { image: string }) {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds([0, 0], [MAP_H, MAP_W]);
    map.setMaxBounds(bounds.pad(0.1));
    map.fitBounds(bounds);
  }, [map, image]);
  return null;
}

export default function MapCanvas({ image, markers, selectedId, onSelect }: Props) {
  const bounds = useMemo(
    () => L.latLngBounds([0, 0], [MAP_H, MAP_W]),
    [],
  );
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="h-[70vh] w-full overflow-hidden rounded-2xl bg-black">
      <MapContainer
        crs={L.CRS.Simple}
        bounds={bounds}
        minZoom={-2}
        maxZoom={2}
        zoom={0}
        attributionControl={false}
        zoomControl={true}
        style={{ height: "100%", width: "100%", background: "#0b1220" }}
      >
        <FitOnLoad image={image} />
        <ImageOverlay url={image} bounds={bounds} />
        {markers.map((m) => {
          const lat = MAP_H - (m.y / 100) * MAP_H;
          const lng = (m.x / 100) * MAP_W;
          return (
            <Marker
              key={m.id}
              position={[lat, lng]}
              icon={buildIcon(m.categoryColor, m.icon, selectedId === m.id)}
              eventHandlers={{
                click: () => onSelect(m.id),
                popupclose: () => onSelect(null),
              }}
            >
              <Popup>
                <div className="min-w-[180px] font-sans">
                  <div
                    className="mb-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
                    style={{ background: m.categoryColor }}
                  >
                    {m.categoryLabel}
                    {m.subLabel ? ` · ${m.subLabel}` : ""}
                  </div>
                  <div className="text-sm font-bold">{m.name}</div>
                  {m.level != null && (
                    <div className="text-xs opacity-70">Nv. {m.level}</div>
                  )}
                  <div className="mt-1 font-mono text-[11px] opacity-70">{m.coord}</div>
                  {m.note && <div className="mt-1 text-xs">{m.note}</div>}
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(m.coord).catch(() => {});
                    }}
                    className="mt-2 rounded bg-slate-800 px-2 py-1 text-[10px] font-semibold text-white hover:bg-slate-700"
                  >
                    Copiar coordenada
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
