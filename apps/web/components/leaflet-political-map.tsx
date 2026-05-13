"use client";

import { useEffect, useMemo } from "react";
import L, { DivIcon, LatLngBoundsExpression, LatLngExpression, latLngBounds } from "leaflet";
import { CircleMarker, MapContainer, Marker, Polygon, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import { MeetingAttendee, Region } from "@/lib/ops-store";

type VisitRecord = {
  id?: string;
  title: string;
  type: string;
  region: string;
  attendance: number;
  sentiment: number;
  x: number;
  y: number;
};

function boundsFromBoundary(boundary?: Array<{ x: number; y: number }>): LatLngExpression[] {
  return (boundary ?? []).map((point) => [point.y, point.x]);
}

function positionFromPercent(x: number, y: number): LatLngExpression {
  return [y, x];
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
  regions
}: {
  contestArea: string;
  regions: Region[];
}) {
  const map = useMap();
  const regionBounds = useMemo(() => {
    const points = regions.flatMap((region) =>
      region.boundary?.length ? boundsFromBoundary(region.boundary) : [positionFromPercent(region.x, region.y)]
    );
    return points.length ? latLngBounds(points as LatLngExpression[]) : undefined;
  }, [regions]);

  useEffect(() => {
    let cancelled = false;
    async function focusArea() {
      const query = contestArea.trim();
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
  }, [contestArea, map, regionBounds]);

  return null;
}

export function LeafletPoliticalMap({
  regions,
  selectedRegion,
  onSelectRegion,
  visits,
  attendees,
  contestArea
}: {
  regions: Region[];
  selectedRegion: Region;
  onSelectRegion: (region: Region) => void;
  visits: VisitRecord[];
  attendees: MeetingAttendee[];
  contestArea: string;
}) {
  return (
    <MapContainer
      center={[-0.2, 37.8]}
      zoom={6}
      minZoom={5}
      maxZoom={14}
      zoomControl={false}
      className="h-full w-full"
      attributionControl
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors &copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
      />
      <ViewportController contestArea={contestArea} regions={regions} />
      {regions.map((region) =>
        region.boundary?.length ? (
          <Polygon
            key={region.code}
            positions={boundsFromBoundary(region.boundary)}
            pathOptions={{
              color: selectedRegion.code === region.code ? "#0f172a" : "#334155",
              weight: regionWeight(region, selectedRegion.code === region.code),
              fillColor: regionFill(region),
              fillOpacity: selectedRegion.code === region.code ? 0.62 : 0.42
            }}
            eventHandlers={{ click: () => onSelectRegion(region) }}
          >
            <Tooltip sticky>{region.name}</Tooltip>
            <Popup>
              <strong>{region.name}</strong>
              <br />
              Registered voters: {region.registeredVoters.toLocaleString()}
            </Popup>
          </Polygon>
        ) : (
          <CircleMarker
            key={region.code}
            center={positionFromPercent(region.x, region.y)}
            radius={regionRadius(region, selectedRegion.code === region.code)}
            pathOptions={{
              color: selectedRegion.code === region.code ? "#ffffff" : "#e2e8f0",
              weight: selectedRegion.code === region.code ? 3 : 1.5,
              fillColor: regionFill(region),
              fillOpacity: 0.8
            }}
            eventHandlers={{ click: () => onSelectRegion(region) }}
          >
            <Tooltip sticky>{region.name}</Tooltip>
            <Popup>
              <strong>{region.name}</strong>
              <br />
              Registered voters: {region.registeredVoters.toLocaleString()}
            </Popup>
          </CircleMarker>
        )
      )}
      {visits.map((visit, index) => (
        <Marker key={visit.id ?? `${visit.title}-${index}`} position={positionFromPercent(visit.x, visit.y)} icon={visitIcon}>
          <Popup>{visit.title}</Popup>
        </Marker>
      ))}
      {attendees.map((attendee) => (
        <Marker key={`${attendee.phone}-${attendee.attendedAt}`} position={positionFromPercent(attendee.x, attendee.y)} icon={attendeeIcon}>
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
