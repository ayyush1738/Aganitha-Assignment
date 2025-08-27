"use client";

import { useState } from "react";
import MapLoader from "@/components/MapLoader";
import VisualizerContainer from "@/components/layout/VisualizerContainer";
import { EarthquakeData } from "@/types/earthquake";

export default function Hero() {
  const [earthquakeData, setEarthquakeData] = useState<EarthquakeData | null>(
    null
  );

  return (
    <div className="h-full bg-[url('/ahrcived.png')] bg-cover bg-center flex items-center justify-center flex-col">
      <h1 className="font-sans text-center text-2xl md:text-3xl mt-10">From mapping tremors to creating detailed AI-generated notes With Just One Click</h1>
      <p className="font-sans mt-2 text-center">Built For Students Want to Learn Deeper About Earthquake Events!</p>
      <div className="h-[90%] w-[95%] my-20 md:h-[70%] md:w-[90%] bg-black/40 shadow-2xl rounded-4xl flex flex-col md:flex-row justify-between p-4 md:p-10 gap-4 md:gap-6">
        <div
          className={`transition-all w-full ${earthquakeData ? "md:w-1/2" : "md:w-full"}`}
        >
          <VisualizerContainer onResults={setEarthquakeData} />
        </div>

        {earthquakeData && (
          <div className="w-full md:w-1/2 rounded-3xl bg-black overflow-hidden h-80 md:h-auto">
            <MapLoader earthquakes={earthquakeData} />
          </div>
        )}
      </div>
    </div>


  );
}