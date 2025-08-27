"use client"; 

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { EarthquakeData } from "@/types/earthquake";


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