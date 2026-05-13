"use client";

import { useEffect, useMemo, useState } from "react";
import L, { DivIcon, LatLngExpression, latLngBounds } from "leaflet";
import { CircleMarker, MapContainer, Marker, Pane, Polygon, Popup, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";
import { GisMapLevel, MeetingAttendee, Region } from "@/lib/ops-store";

type VisitRecord = {
  id?: string;
  title: string;
  type: string;
  region: string;
  attendance: number;
  sentiment: number;
  x: number;
  y: number;
  latitude?: number;
  longitude?: number;
};

const kenyaBounds = {
  south: -4.9,
  north: 4.9,
  west: 33.9,
  east: 41.95
};

function boundsFromBoundary(boundary?: Array<{ x: number; y: number }>): LatLngExpression[] {
  return (boundary ?? []).map((point) => [point.y, point.x]);
}

function positionFromPercent(x: number, y: number): LatLngExpression {
  const latitude = kenyaBounds.north - (y / 100) * (kenyaBounds.north - kenyaBounds.south);
  const longitude = kenyaBounds.west + (x / 100) * (kenyaBounds.east - kenyaBounds.west);
  return [latitude, longitude];
}

function percentFromLatLng(latitude: number, longitude: number) {
  return {
    x: ((longitude - kenyaBounds.west) / (kenyaBounds.east - kenyaBounds.west)) * 100,
    y: ((kenyaBounds.north - latitude) / (kenyaBounds.north - kenyaBounds.south)) * 100
  };
}

function centerFromBoundary(boundary?: Array<{ x: number; y: number }>): LatLngExpression | null {
  if (!boundary?.length) return null;
  const center = boundary.reduce(
    (sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }),
    { x: 0, y: 0 }
  );
  return [center.y / boundary.length, center.x / boundary.length];
}

function regionCenter(region: Region): LatLngExpression {
  if (region.latitude !== undefined && region.longitude !== undefined) return [region.latitude, region.longitude];
  return centerFromBoundary(region.boundary) ?? positionFromPercent(region.x, region.y);
}

function regionFill(region: Region) {
  if (region.risk >= 70) return "#ef4444";
  if (region.support >= 58) return "#22c55e";
  if (region.registeredVoters >= 8000) return "#1d4ed8";
  if (region.registeredVoters >= 4000) return "#0ea5e9";
  return "#38bdf8";
}

function regionWeight(region: Region, selected: boolean) {
  return selected ? 3 : region.registeredVoters >= 6000 ? 2.2 : 1.5;
}

function regionRadius(region: Region, selected: boolean) {
  const base = region.registeredVoters >= 8000 ? 18 : region.registeredVoters >= 4000 ? 14 : 10;
  return selected ? base + 4 : base;
}

function contestAreaQuery(contestArea: string, mapLevel: GisMapLevel) {
  const area = contestArea.trim();
  if (!area) return "";
  const levelLabel: Record<GisMapLevel, string> = {
    county: "county",
    constituency: "constituency",
    ward: "ward",
    pollingStation: ""
  };
  return [area, levelLabel[mapLevel], "Kenya"].filter(Boolean).join(", ");
}

function ringFromGeoJson(geojson: unknown): LatLngExpression[] | null {
  const geometry = geojson as {
    type?: string;
    coordinates?: number[][][] | number[][][][];
  };
  if (!geometry?.type || !geometry.coordinates) return null;
  const firstRing =
    geometry.type === "Polygon"
      ? (geometry.coordinates as number[][][])[0]
      : geometry.type === "MultiPolygon"
        ? (geometry.coordinates as number[][][][])[0]?.[0]
        : null;
  if (!firstRing?.length) return null;
  return firstRing.map(([longitude, latitude]) => [latitude, longitude]);
}

const visitIcon = new DivIcon({
  html: '<div style="width:18px;height:18px;border-radius:999px;background:#fbbf24;border:2px solid #fff7ed;box-shadow:0 0 0 4px rgba(251,191,36,.18)"></div>',
  className: "",
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

const attendeeIcon = new DivIcon({
  html: '<div style="width:14px;height:14px;border-radius:999px;background:#34d399;border:2px solid #ecfdf5;box-shadow:0 0 0 4px rgba(52,211,153,.18)"></div>',
  className: "",
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

function ViewportController({
  contestArea,
  mapLevel,
  regions
}: {
  contestArea: string;
  mapLevel: GisMapLevel;
  regions: Region[];
}) {
  const map = useMap();
  const regionBounds = useMemo(() => {
    const points = regions.flatMap((region) =>
      region.boundary?.length ? boundsFromBoundary(region.boundary) : [regionCenter(region)]
    );
    return points.length ? latLngBounds(points as LatLngExpression[]) : undefined;
  }, [regions]);

  useEffect(() => {
    let cancelled = false;
    async function focusArea() {
      const query = contestAreaQuery(contestArea, mapLevel);
      if (!query) {
        if (regionBounds) map.fitBounds(regionBounds, { padding: [28, 28] });
        else map.setView([-0.2, 37.8], 6);
        return;
      }
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=ke&q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error("Lookup failed");
        const result = (await response.json()) as Array<{ boundingbox?: [string, string, string, string]; lat?: string; lon?: string }>;
        if (cancelled || !result[0]) return;
        const bounds = result[0].boundingbox;
        if (bounds) {
          map.fitBounds(
            [
              [Number(bounds[0]), Number(bounds[2])],
              [Number(bounds[1]), Number(bounds[3])]
            ],
            { padding: [24, 24] }
          );
          return;
        }
        if (result[0].lat && result[0].lon) {
          map.setView([Number(result[0].lat), Number(result[0].lon)], 9);
        }
      } catch {
        if (regionBounds) map.fitBounds(regionBounds, { padding: [28, 28] });
      }
    }
    focusArea();
    return () => {
      cancelled = true;
    };
  }, [contestArea, map, mapLevel, regionBounds]);

  return null;
}

function ContestBoundaryLayer({
  contestArea,
  mapLevel
}: {
  contestArea: string;
  mapLevel: GisMapLevel;
}) {
  const [boundary, setBoundary] = useState<LatLngExpression[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadBoundary() {
      const query = contestAreaQuery(contestArea, mapLevel);
      if (!query) {
        setBoundary(null);
        return;
      }
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&polygon_geojson=1&limit=1&countrycodes=ke&q=${encodeURIComponent(query)}`);
        const result = response.ok ? ((await response.json()) as Array<{ geojson?: unknown }>) : [];
        if (cancelled) return;
        setBoundary(ringFromGeoJson(result[0]?.geojson) ?? null);
      } catch {
        if (!cancelled) setBoundary(null);
      }
    }
    loadBoundary();
    return () => {
      cancelled = true;
    };
  }, [contestArea, mapLevel]);

  if (!boundary?.length) return null;
  return (
    <Polygon
      pane="contest-boundary"
      positions={boundary}
      pathOptions={{
        color: "#f97316",
        fillColor: "#f97316",
        fillOpacity: 0.07,
        lineCap: "round",
        lineJoin: "round",
        weight: 5
      }}
    >
      <Tooltip sticky direction="top" className="political-map-label">
        Contest boundary: {contestArea}
      </Tooltip>
    </Polygon>
  );
}

function VisitToggleHandler({
  onToggleVisit
}: {
  onToggleVisit: (point: { latitude: number; longitude: number; x: number; y: number }) => void;
}) {
  useMapEvents({
    dblclick(event) {
      const point = percentFromLatLng(event.latlng.lat, event.latlng.lng);
      onToggleVisit({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
        x: point.x,
        y: point.y
      });
    }
  });
  return null;
}

export function LeafletPoliticalMap({
  regions,
  selectedRegion,
  onSelectRegion,
  onToggleVisit,
  visits,
  attendees,
  contestArea,
  mapLevel
}: {
  regions: Region[];
  selectedRegion: Region;
  onSelectRegion: (region: Region) => void;
  onToggleVisit: (point: { latitude: number; longitude: number; region?: string; x?: number; y?: number }) => void;
  visits: VisitRecord[];
  attendees: MeetingAttendee[];
  contestArea: string;
  mapLevel: GisMapLevel;
}) {
  const hasResolvedPoint = regions.some((region) => region.latitude !== undefined && region.longitude !== undefined);
  return (
    <MapContainer
      center={[-0.2, 37.8]}
      zoom={6}
      minZoom={5}
      maxZoom={14}
      zoomControl={false}
      className="h-full w-full"
      attributionControl
      doubleClickZoom={false}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors &copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
      />
      <Pane name="basemap-labels" style={{ zIndex: 350, pointerEvents: "none" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
        />
      </Pane>
      <Pane name="contest-boundary" style={{ zIndex: 420 }} />
      <ViewportController contestArea={contestArea} mapLevel={mapLevel} regions={regions} />
      <ContestBoundaryLayer contestArea={contestArea} mapLevel={mapLevel} />
      <VisitToggleHandler onToggleVisit={onToggleVisit} />
      <Pane name="political-regions" style={{ zIndex: 460 }} />
      <Pane name="political-markers" style={{ zIndex: 620 }} />
      {regions.map((region) =>
        region.boundary?.length ? (
          <Polygon
            key={region.code}
            pane="political-regions"
            positions={boundsFromBoundary(region.boundary)}
            pathOptions={{
              color: selectedRegion.code === region.code ? "#facc15" : "#020617",
              weight: regionWeight(region, selectedRegion.code === region.code),
              fillColor: regionFill(region),
              fillOpacity: selectedRegion.code === region.code ? 0.7 : 0.5
            }}
            eventHandlers={{
              click: () => onSelectRegion(region),
              dblclick: (event) => {
                L.DomEvent.stop(event);
                const center = regionCenter(region) as [number, number];
                const point = percentFromLatLng(center[0], center[1]);
                onToggleVisit({ latitude: center[0], longitude: center[1], region: region.name, x: point.x, y: point.y });
              }
            }}
          >
            <Tooltip sticky permanent direction="center" className="political-map-label">
              {region.name}
            </Tooltip>
            <Popup>
              <strong>{region.name}</strong>
              <br />
              Registered voters: {region.registeredVoters.toLocaleString()}
            </Popup>
          </Polygon>
        ) : region.latitude !== undefined && region.longitude !== undefined ? (
          <CircleMarker
            key={region.code}
            pane="political-regions"
            center={regionCenter(region)}
            radius={regionRadius(region, selectedRegion.code === region.code)}
            pathOptions={{
              color: selectedRegion.code === region.code ? "#ffffff" : "#e2e8f0",
              weight: selectedRegion.code === region.code ? 3 : 1.5,
              fillColor: regionFill(region),
              fillOpacity: 0.8
            }}
            eventHandlers={{
              click: () => onSelectRegion(region),
              dblclick: (event) => {
                L.DomEvent.stop(event);
                const center = regionCenter(region) as [number, number];
                const point = percentFromLatLng(center[0], center[1]);
                onToggleVisit({ latitude: center[0], longitude: center[1], region: region.name, x: point.x, y: point.y });
              }
            }}
          >
            <Tooltip sticky permanent direction="top" offset={[0, -8]} className="political-map-label">
              {region.name}
            </Tooltip>
            <Popup>
              <strong>{region.name}</strong>
              <br />
              Registered voters: {region.registeredVoters.toLocaleString()}
            </Popup>
          </CircleMarker>
        ) : hasResolvedPoint ? null : (
          <CircleMarker
            key={region.code}
            pane="political-regions"
            center={regionCenter(region)}
            radius={regionRadius(region, selectedRegion.code === region.code)}
            pathOptions={{
              color: selectedRegion.code === region.code ? "#ffffff" : "#e2e8f0",
              weight: selectedRegion.code === region.code ? 3 : 1.5,
              fillColor: regionFill(region),
              fillOpacity: 0.45
            }}
            eventHandlers={{
              click: () => onSelectRegion(region),
              dblclick: (event) => {
                L.DomEvent.stop(event);
                const center = regionCenter(region) as [number, number];
                const point = percentFromLatLng(center[0], center[1]);
                onToggleVisit({ latitude: center[0], longitude: center[1], region: region.name, x: point.x, y: point.y });
              }
            }}
          >
            <Tooltip sticky permanent direction="top" offset={[0, -8]} className="political-map-label">
              {region.name}
            </Tooltip>
            <Popup>
              <strong>{region.name}</strong>
              <br />
              Registered voters: {region.registeredVoters.toLocaleString()}
            </Popup>
          </CircleMarker>
        )
      )}
      {visits.map((visit, index) => (
        <Marker
          key={visit.id ?? `${visit.title}-${index}`}
          pane="political-markers"
          position={visit.latitude !== undefined && visit.longitude !== undefined ? [visit.latitude, visit.longitude] : regionCenter(regions.find((region) => region.name === visit.region) ?? { code: "", name: visit.region, support: 0, risk: 0, momentum: 0, registeredVoters: 0, x: visit.x, y: visit.y })}
          icon={visitIcon}
          eventHandlers={{
            dblclick: (event) => {
              L.DomEvent.stop(event);
              const position = event.target.getLatLng();
              const point = percentFromLatLng(position.lat, position.lng);
              onToggleVisit({ latitude: position.lat, longitude: position.lng, region: visit.region, x: point.x, y: point.y });
            }
          }}
        >
          <Popup>{visit.title}</Popup>
        </Marker>
      ))}
      {attendees.map((attendee) => (
        <Marker
          key={`${attendee.phone}-${attendee.attendedAt}`}
          pane="political-markers"
          position={regionCenter(regions.find((region) => region.name === attendee.location) ?? { code: "", name: attendee.location, support: 0, risk: 0, momentum: 0, registeredVoters: 0, x: attendee.x, y: attendee.y })}
          icon={attendeeIcon}
        >
          <Popup>
            <strong>{attendee.name}</strong>
            <br />
            {attendee.location}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
