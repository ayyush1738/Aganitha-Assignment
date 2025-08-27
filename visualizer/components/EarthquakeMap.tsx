"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

//Earthquake Features Type (Contains the properties to locate the affected area)
interface EarthquakeFeature {
  type: "Feature";
  properties: {
    magnitude: number;
    place: string;
    time: number;
    title: string;
  };
  geometry: {
    type: "Point";
    coordinates: [number, number, number]; 
  };
  id: string;
}


interface EarthquakeData {
  type: "FeatureCollection";
  features: EarthquakeFeature[];
}

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
      
      {earthquakes.features.map((earthquake) => {
        const { coordinates } = earthquake.geometry;
        const { title, magnitude, time } = earthquake.properties;
        const date = new Date(time);

        // Leaflet expects [latitude, longitude]
        const position: [number, number] = [coordinates[1], coordinates[0]];

        // Circle size scaled by magnitude (adjust multiplier as needed)
        const radius = magnitude * 20000; 

        return (
          <CircleMarker
            key={earthquake.id}
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