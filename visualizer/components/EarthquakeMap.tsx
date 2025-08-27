"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { EarthquakeData } from "@/types/earthquake";
import "leaflet/dist/leaflet.css";



interface EarthquakeMapProps {
  earthquakes: EarthquakeData;
}

const EarthquakeMap: React.FC<EarthquakeMapProps> = ({ earthquakes }) => {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {earthquakes.features.map((earthquake, index) => {
        const { coordinates } = earthquake.geometry;
        const { title, magnitude, time } = earthquake.properties;
        const date = new Date(time);

        // Leaflet expects [latitude, longitude]
        const position: [number, number] = [coordinates[1], coordinates[0]];

        return (
          <CircleMarker
            key={`${earthquake.id}_${index}`} // ✅ unique key
            center={position}
            radius={magnitude * 4} // marker size based on magnitude
            color="red"
            fillColor="red"
            fillOpacity={0.4}
            stroke={false}
          >
            <Popup>
              <b>{title}</b>
              <br />
              Magnitude: {magnitude}
              <br />
              Time: {date.toLocaleString()}
            </Popup>
          </CircleMarker>
        );
      })}

    </MapContainer>
  );
};

export default EarthquakeMap;