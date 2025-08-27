"use client"; 

import dynamic from 'next/dynamic';
import { useMemo } from 'react';

interface EarthquakeFeature {
  type: "Feature";
  properties: { mag: number; place: string; time: number; title: string; };
  geometry: { type: "Point"; coordinates: [number, number, number]; };
  id: string;
}

interface EarthquakeData {
  type: "FeatureCollection";
  features: EarthquakeFeature[];
}

interface MapLoaderProps {
  earthquakes: EarthquakeData;
}

const MapLoader: React.FC<MapLoaderProps> = ({ earthquakes }) => {

    const Map = useMemo(() => dynamic(
    () => import('@/components/EarthquakeMap'), 
    {
      loading: () => <p>A map is loading...</p>,
      ssr: false 
    }
  ), []); 

  return <Map earthquakes={earthquakes} />;
};

export default MapLoader;