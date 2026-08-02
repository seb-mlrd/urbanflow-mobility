'use client';

import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import polyline from '@mapbox/polyline';
import { MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet';
import type { UseGeolocationResult } from '../../../lib/hooks/useGeolocation';
import type { Itinerary } from '../../../lib/journey-types';
import { getModeLineStyle } from '../../../lib/transport-colors';
import { getItineraryEndpoints } from '../../../lib/journey-utils';

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

const DEPARTURE_ICON = createDotIcon('#16a34a');
const ARRIVAL_ICON = createDotIcon('#dc2626');

interface Props {
  geo: UseGeolocationResult;
  selectedItinerary?: Itinerary | null;
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

export function JourneyMap({ geo, selectedItinerary, children }: Props) {
  const hasUserPosition = geo.status === 'success' && geo.position !== null;
  const center = hasUserPosition ? geo.position! : LILLE_GRAND_PLACE;

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
  const departurePosition = departure ? ([departure.lat, departure.lng] as [number, number]) : undefined;
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
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
        />
        {hasUserPosition && (
          <Marker position={[center.lat, center.lng]}>
            <Popup>Votre position</Popup>
          </Marker>
        )}
        {children}
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
