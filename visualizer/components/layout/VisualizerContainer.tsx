"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, X } from "lucide-react";
import axios from "axios";
import { EarthquakeFeature, EarthquakeData } from "@/types/earthquake";

interface SearchBarContainerProps {
  onResults: (features: EarthquakeFeature[], aiNotes?: string) => void;
}

export default function SearchBarContainer({ onResults }: SearchBarContainerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [aiNotes, setAiNotes] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [minMagnitude, setMinMagnitude] = useState<number>(0);
  const [maxMagnitude, setMaxMagnitude] = useState<number>(10);
  const [days, setDays] = useState<number>(1);
  const [date, setDate] = useState<string>("");

  const fetchEarthquakes = async () => {
    try {
      setLoading(true);

      // USGS feed
      const defaultResp = await axios.get<EarthquakeData>(
        "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
      );

      let features: EarthquakeFeature[] = defaultResp.data.features;

      // filter by magnitude
      features = features.filter(
        (f: EarthquakeFeature) =>
          f.properties.magnitude >= minMagnitude &&
          f.properties.magnitude <= maxMagnitude
      );

      // optional date filter (USGS returns unix timestamp in ms)
      if (date) {
        const selectedDate = new Date(date);
        features = features.filter((f: EarthquakeFeature) => {
          const quakeDate = new Date(f.properties.time);
          return (
            quakeDate.getFullYear() === selectedDate.getFullYear() &&
            quakeDate.getMonth() === selectedDate.getMonth() &&
            quakeDate.getDate() === selectedDate.getDate()
          );
        });
      }

      // send results to parent
      onResults(features, aiNotes ?? undefined);
    } catch (error) {
      console.error("Error fetching earthquakes:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center p-4 border rounded-lg shadow-md bg-white w-full">
      {/* Search bar */}
      <div className="flex items-center gap-2 w-full">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by place..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none"
        />
        <Button onClick={fetchEarthquakes} disabled={loading}>
          {loading ? "Searching..." : <SearchIcon className="w-4 h-4" />}
        </Button>
      </div>

      {/* Magnitude filters */}
      <div className="flex gap-3 w-full">
        <input
          type="number"
          value={minMagnitude}
          onChange={(e) => setMinMagnitude(Number(e.target.value))}
          placeholder="Min Mag"
          className="w-1/2 px-3 py-2 border rounded-lg"
        />
        <input
          type="number"
          value={maxMagnitude}
          onChange={(e) => setMaxMagnitude(Number(e.target.value))}
          placeholder="Max Mag"
          className="w-1/2 px-3 py-2 border rounded-lg"
        />
      </div>

      {/* Date filter */}
      <div className="flex gap-3 w-full">
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="w-1/2 px-3 py-2 border rounded-lg"
        >
          <option value={1}>Past Day</option>
          <option value={7}>Past 7 Days</option>
          <option value={30}>Past 30 Days</option>
        </select>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-1/2 px-3 py-2 border rounded-lg"
        />
      </div>

      {/* Optional AI notes popup */}
      {aiNotes && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border p-4 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">AI Notes</h3>
            <button onClick={() => setAiNotes(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-700">{aiNotes}</p>
        </div>
      )}
    </div>
  );
}
