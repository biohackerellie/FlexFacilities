'use client';

import { LatLngTuple } from 'leaflet';
import * as React from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { getAllMapCoords } from '@/lib/actions/facilities';

interface MapProps {
  zoom?: number;
  promise: Promise<Awaited<ReturnType<typeof getAllMapCoords>>>;
}

const defaults = {
  zoom: 13,
  center: [0, 0] as LatLngTuple,
};
const LargeMap = (MapProps: MapProps) => {
  const { zoom = defaults.zoom } = MapProps;
  const data = React.use(MapProps.promise);
  const coords = data?.coords;

  return (
    <MapContainer
      center={data?.center ?? defaults.center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {coords &&
        coords.map((coord, i) => (
          <Marker position={coord.latlng} key={i}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
};
export default LargeMap;
