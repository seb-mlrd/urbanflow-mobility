'use client';

import { useEffect, useMemo, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import polyline from '@mapbox/polyline';
import { Bike, Scooter as ScooterIcon } from 'lucide-react';
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import type { UseGeolocationResult } from '../../../lib/hooks/useGeolocation';
import { useMobilitySpots } from '../../../lib/hooks/useMobilitySpots';
import type { Scooter } from '@urbanflow/shared';
import type { Itinerary } from '../../../lib/journey-types';
import { getModeLineStyle } from '../../../lib/transport-colors';
import { getItineraryEndpoints } from '../../../lib/journey-utils';
import { haversineDistanceMeters } from '../../../lib/geo-distance';

L.Icon.Default.mergeOptions({
  iconUrl: '/leaflet/marker-icon.png',
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

const LILLE_GRAND_PLACE = { lat: 50.6365, lng: 3.0635 };

function createDotIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<span style="display:block;width:16px;height:16px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 0 2px rgba(0,0,0,0.6);"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function createPictogramIcon(color: string, glyph: React.ReactElement) {
  const glyphHtml = renderToStaticMarkup(glyph);
  return L.divIcon({
    className: '',
    html: `<span style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 0 2px rgba(0,0,0,0.6);color:white;">${glyphHtml}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

const DEPARTURE_ICON = createDotIcon('#16a34a');
const ARRIVAL_ICON = createDotIcon('#dc2626');
const BIKE_STATION_ICON = createPictogramIcon(
  '#0284c7',
  <Bike size={16} strokeWidth={2.5} aria-hidden="true" />,
);
const scooterIconCache = new Map<number, L.DivIcon>();

function getScooterIcon(count: number) {
  const cached = scooterIconCache.get(count);
  if (cached) return cached;

  const glyphHtml = renderToStaticMarkup(
    <ScooterIcon size={16} strokeWidth={2.5} aria-hidden="true" />,
  );
  const badgeHtml =
    count > 1
      ? `<span style="position:absolute;top:-4px;right:-4px;min-width:16px;height:16px;padding:0 3px;border-radius:9999px;background:white;color:#ea580c;font-size:10px;line-height:14px;font-weight:700;text-align:center;border:1px solid #ea580c;">${count}</span>`
      : '';
  const icon = L.divIcon({
    className: '',
    html: `<span style="position:relative;display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:9999px;background:#ea580c;border:2px solid white;box-shadow:0 0 2px rgba(0,0,0,0.6);color:white;">${glyphHtml}${badgeHtml}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
  scooterIconCache.set(count, icon);
  return icon;
}

interface ScooterGroup {
  key: string;
  lat: number;
  lon: number;
  scooters: Scooter[];
}

const MIN_CLUSTER_RADIUS_METERS = 20;
const CLUSTER_PIXEL_RADIUS = 40;

function metersPerPixel(zoom: number, lat: number) {
  return (156543.03392 * Math.cos((lat * Math.PI) / 180)) / 2 ** zoom;
}

function clusterScooters(scooters: Scooter[], zoom: number): ScooterGroup[] {
  if (scooters.length === 0) return [];

  const avgLat = scooters.reduce((sum, s) => sum + s.lat, 0) / scooters.length;
  const radiusMeters = Math.max(
    MIN_CLUSTER_RADIUS_METERS,
    CLUSTER_PIXEL_RADIUS * metersPerPixel(zoom, avgLat),
  );

  const groups: ScooterGroup[] = [];
  for (const scooter of scooters) {
    const nearby = groups.find(
      (group) =>
        haversineDistanceMeters(
          { lat: group.lat, lng: group.lon },
          { lat: scooter.lat, lng: scooter.lon },
        ) <= radiusMeters,
    );
    if (nearby) nearby.scooters.push(scooter);
    else groups.push({ key: scooter.id, lat: scooter.lat, lon: scooter.lon, scooters: [scooter] });
  }
  return groups;
}

const MIN_MOBILITY_SPOTS_ZOOM = 15;

function ScooterMarkers({ scooters, zoom }: { scooters: Scooter[]; zoom: number }) {
  const groups = useMemo(() => clusterScooters(scooters, zoom), [scooters, zoom]);

  if (zoom < MIN_MOBILITY_SPOTS_ZOOM) return null;

  return (
    <>
      {groups.map((group) => (
        <Marker
          key={group.key}
          position={[group.lat, group.lon]}
          icon={getScooterIcon(group.scooters.length)}
        >
          <Popup>
            {group.scooters.length} trottinette{group.scooters.length > 1 ? 's' : ''} disponible
            {group.scooters.length > 1 ? 's' : ''}
            <ul className="mt-1 pl-4 list-disc">
              {group.scooters.map((scooter) => (
                <li key={scooter.id}>
                  {Math.round(scooter.rangeMeters / 1000)} km d&apos;autonomie
                </li>
              ))}
            </ul>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

interface BikeStation {
  id: string;
  lat: number;
  lon: number;
  name: string;
  bikesAvailable: number;
  docksAvailable: number;
}

function MobilitySpots({
  bikeStations,
  scooters,
}: {
  bikeStations: BikeStation[];
  scooters: Scooter[];
}) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) });

  return (
    <>
      {zoom >= MIN_MOBILITY_SPOTS_ZOOM &&
        bikeStations.map((station) => (
          <Marker key={station.id} position={[station.lat, station.lon]} icon={BIKE_STATION_ICON}>
            <Popup>
              {station.name}
              <br />
              {station.bikesAvailable} vélo{station.bikesAvailable > 1 ? 's' : ''} disponible
              {station.bikesAvailable > 1 ? 's' : ''}
              <br />
              {station.docksAvailable} place{station.docksAvailable > 1 ? 's' : ''} libre
              {station.docksAvailable > 1 ? 's' : ''}
            </Popup>
          </Marker>
        ))}
      <ScooterMarkers scooters={scooters} zoom={zoom} />
    </>
  );
}

interface Props {
  geo: UseGeolocationResult;
  selectedItinerary?: Itinerary | null;
  showMobilitySpots?: boolean;
  children?: React.ReactNode;
}

interface DecodedLeg {
  mode: string;
  positions: [number, number][];
}

function FitBoundsOnChange({ decodedLegs }: { decodedLegs: DecodedLeg[] }) {
  const map = useMap();

  useEffect(() => {
    const positions = decodedLegs.flatMap((l) => l.positions);
    if (positions.length === 0) return;
    map.fitBounds(L.latLngBounds(positions), { padding: [32, 32] });
  }, [decodedLegs, map]);

  return null;
}

export function JourneyMap({ geo, selectedItinerary, showMobilitySpots = true, children }: Props) {
  const hasUserPosition = geo.status === 'success' && geo.position !== null;
  const center = hasUserPosition ? geo.position! : LILLE_GRAND_PLACE;
  const { bikeStations, scooters } = useMobilitySpots({ enabled: showMobilitySpots });

  const decodedLegs = useMemo<DecodedLeg[]>(() => {
    if (!selectedItinerary) return [];
    return selectedItinerary.legs
      .filter((leg) => leg.legGeometry?.points)
      .map((leg) => ({
        mode: leg.mode,
        positions: polyline.decode(leg.legGeometry!.points) as [number, number][],
      }));
  }, [selectedItinerary]);

  const { departure, arrival } = useMemo(
    () => getItineraryEndpoints(selectedItinerary),
    [selectedItinerary],
  );
  const departurePosition = departure
    ? ([departure.lat, departure.lng] as [number, number])
    : undefined;
  const arrivalPosition = arrival ? ([arrival.lat, arrival.lng] as [number, number]) : undefined;
  const hasDistinctEndpoints =
    departurePosition &&
    arrivalPosition &&
    (departurePosition[0] !== arrivalPosition[0] || departurePosition[1] !== arrivalPosition[1]);

  return (
    <div className="h-full w-full rounded-xl md:rounded-none overflow-hidden">
      <MapContainer
        key={hasUserPosition ? 'user' : 'fallback'}
        center={[center.lat, center.lng]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png"
          attribution="Wikimedia maps &copy; OpenStreetMap contributors"
        />
        {hasUserPosition && (
          <Marker position={[center.lat, center.lng]}>
            <Popup>Votre position</Popup>
          </Marker>
        )}
        {children}
        <MobilitySpots bikeStations={bikeStations} scooters={scooters} />
        {hasDistinctEndpoints && (
          <>
            <Marker position={departurePosition} icon={DEPARTURE_ICON}>
              <Tooltip permanent direction="top" offset={[0, -8]}>
                Départ
              </Tooltip>
              <Popup>Départ</Popup>
            </Marker>
            <Marker position={arrivalPosition} icon={ARRIVAL_ICON}>
              <Tooltip permanent direction="top" offset={[0, -8]}>
                Arrivée
              </Tooltip>
              <Popup>Arrivée</Popup>
            </Marker>
          </>
        )}
        {decodedLegs.map((leg, i) => (
          <Polyline key={i} positions={leg.positions} pathOptions={getModeLineStyle(leg.mode)} />
        ))}
        <FitBoundsOnChange decodedLegs={decodedLegs} />
      </MapContainer>
    </div>
  );
}
