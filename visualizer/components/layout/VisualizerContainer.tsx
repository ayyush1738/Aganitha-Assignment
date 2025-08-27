import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, X } from "lucide-react";
import axios from "axios";

const roles = ["Asia", "North America", "South America", "Europe", "Africa", "Antarctica", "Australia",];
const daysOptions = [1, 3, 10, 20, 30];

const roleCoordinates: Record<string, { lat: number; lon: number; radius: number }> = {
  Asia: { lat: 34.0479, lon: 100.6197, radius: 5000 },
  "North America": { lat: 54.526, lon: -105.2551, radius: 5000 },
  "South America": { lat: -8.7832, lon: -55.4915, radius: 4000 },
  Europe: { lat: 54.526, lon: 15.2551, radius: 4000 },
  Africa: { lat: 8.7832, lon: 34.5085, radius: 5000 },
  Antarctica: { lat: -82.8628, lon: 135.0, radius: 2500 },
  Australia: { lat: -25.2744, lon: 133.7751, radius: 3000 },
};

interface SearchBarProps {
  onResults: (data: any) => void;
}

export default function SearchBar({ onResults }: SearchBarProps) {
  const [selectedContinents, setSelectedContinents] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [days, setDays] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [minMagnitude, setMinMagnitude] = useState<number>(3);
  const [aiNotes, setAiNotes] = useState<string | null>(null);

  const handleContinentClick = (continents: string) => {
    if (!selectedContinents.includes(continents)) setSelectedContinents([...selectedContinents, continents]);
  };

  const removeRole = (continents: string) => setSelectedContinents(selectedContinents.filter(c => c !== continents));

  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const now = new Date();
      const startDate: Date = fromDate
        ? new Date(fromDate)
        : new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      const endDate: Date = toDate ? new Date(toDate) : now;

      const defaultUrl =
        "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
      const defaultResp = await axios.get(defaultUrl);
      let features = defaultResp.data.features;

      features = features.filter((f: any) => f.properties.mag >= minMagnitude);

      features = features.filter((f: any) => {
        const quakeTime = new Date(f.properties.time);
        return quakeTime >= startDate && quakeTime <= endDate;
      });

      if (query.trim()) {
        features = features.filter((f: any) =>
          f.properties.place?.toLowerCase().includes(query.toLowerCase())
        );
      }

      if (selectedContinents.length > 0) {
        const coords = roleCoordinates[selectedContinents[0]];
        if (coords) {
          features = features.filter((f: any) => {
            const [lon, lat] = f.geometry.coordinates;
            return (
              haversineDistance({ lat, lon }, { lat: coords.lat, lon: coords.lon }) <=
              coords.radius
            );
          });
        }
      }
      const fdsnParams: Record<string, string | number> = {
        format: "geojson",
        starttime: startDate.toISOString().split("T")[0],
        endtime: endDate.toISOString().split("T")[0],
        minmagnitude: minMagnitude,
        orderby: "time",
      };
      if (selectedContinents.length > 0) {
        const coords = roleCoordinates[selectedContinents[0]];
        if (coords) {
          fdsnParams.latitude = coords.lat;
          fdsnParams.longitude = coords.lon;
          fdsnParams.maxradiuskm = coords.radius;
        }
      }
      const fdsnResp = await axios.get(
        "https://earthquake.usgs.gov/fdsnws/event/1/query",
        { params: fdsnParams }
      );

      const allFeatures = [...features, ...fdsnResp.data.features];
      onResults({ features: allFeatures });

      setAiNotes(null); // Clear previous notes
    } catch (err) {
      console.error(err);
      setError("Failed to fetch earthquake data. Try again later.");
    }

    setLoading(false);
  };

  const getAiNotes = async () => {
    setLoading(true);
    setError(null);
    setAiNotes(""); // Reset

    try {
      const now = new Date();
      const startDate: Date = fromDate
        ? new Date(fromDate)
        : new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      const endDate: Date = toDate ? new Date(toDate) : now;

      const defaultUrl =
        "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
      const defaultResp = await axios.get(defaultUrl);
      let features = defaultResp.data.features;

      features = features.filter((f: any) => f.properties.mag >= minMagnitude);

      features = features.filter((f: any) => {
        const quakeTime = new Date(f.properties.time);
        return quakeTime >= startDate && quakeTime <= endDate;
      });

      const earthquakeText = features
        .map((f: any) => {
          const date = new Date(f.properties.time).toLocaleString();
          return `Place: ${f.properties.place}, Magnitude: ${f.properties.mag}, Date: ${date}`;
        })
        .join("\n");

      const prompt = `
      Persona: You are a helpful AI assistant.
      
      Task:
      Analyze Earthquake Data: I will provide you with JSON data containing information about recent earthquakes. This data includes the dates, magnitudes, and locations of each event.
      Generate a Descriptive Study: Create a concise and easy-to-understand descriptive study based on the provided data.
      Synthesize Key Information: Your study should summarize the following:
      Dates and Frequency: Briefly mention the time period the data covers and any notable patterns in when the earthquakes occurred.
      Magnitude Analysis: Describe the range of earthquake magnitudes observed, highlighting the most common or any significantly strong events.
      Potential Causes (as "Notes"): In a dedicated "Notes" section, hypothesize the possible geological reasons for the earthquakes in the specified locations. This may include proximity to fault lines, tectonic plate interactions, or volcanic activity.
      Format and Constraints:
      No Tables: Do not use any tables in your response.
      Simple Language: Present the information in very simple and clear terms that a non-expert can easily understand.
      Structure: The output should be a narrative summary followed by a "Notes" section for the potential causes.

      ${earthquakeText}
    `;

      const res = await fetch("/api/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error("Groq API failed");

      const data = await res.json();
      setAiNotes(data.notes);
      onResults({ features, aiNotes: data.notes });
    } catch (err) {
      console.error(err);
      setError("Failed to generate AI notes. Try again later.");
    }

    setLoading(false);
  };

  function haversineDistance(coord1: { lat: number; lon: number }, coord2: { lat: number; lon: number }) {
    const R = 6371;
    const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
    const dLon = ((coord2.lon - coord1.lon) * Math.PI) / 180;
    const lat1 = (coord1.lat * Math.PI) / 180;
    const lat2 = (coord2.lat * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  return (
    <section className="w-full p-4 sm:p-6">
      <div className="max-w-5xl mx-auto text-center px-2 sm:px-4 items-center">
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 max-w-2xl mx-auto mb-6 bg-black/20 shadow-md rounded-full px-3 sm:px-4 py-2 border border-gray-200">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            className="flex-1 px-2 sm:px-4 py-2 outline-none text-white bg-transparent min-w-[120px] sm:min-w-[150px] text-sm sm:text-base"
            placeholder="Find earthquakes by location/region"
          />
          {selectedContinents.map((continents) => (
            <span
              key={continents}
              className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-white text-black rounded-full text-xs sm:text-sm"
            >
              {continents}
              <button
                onClick={() => removeRole(continents)}
                className="text-red-600 hover:text-red-800 cursor-pointer"
              >
                <X size={12} className="sm:w-4 sm:h-4" />
              </button>
            </span>
          ))}
          <Button
            size="sm"
            className="rounded-full px-3 sm:px-4 bg-white text-green-500 cursor-pointer"
            onClick={handleSearch}
            disabled={loading}
          >
            <SearchIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>

        <div className="flex text-xs sm:text-sm justify-center flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8 mt-6 sm:mt-10">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => handleContinentClick(role)}
              className={`px-2 sm:px-3 py-1 rounded-full border ${selectedContinents.includes(role)
                ? "bg-white text-black border-black"
                : "text-white hover:bg-gray-800 cursor-pointer"
                }`}
            >
              {role}
            </button>
          ))}
        </div>

        <div className="flex flex-col justify-center items-center gap-4 mb-6 sm:mb-8 mt-6 sm:mt-[10%]">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-3/4 flex-wrap justify-center items-center text-white">
            <div className="flex flex-col w-full sm:w-auto">
              <label className="mb-1 text-xs sm:text-sm">Days</label>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 bg-white text-black text-sm sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {daysOptions.map((d) => (
                  <option key={d} value={d}>
                    {d} day{d > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col w-full sm:w-auto">
              <label className="mb-1 text-xs sm:text-sm">Magnitude</label>
              <input
                type="number"
                value={minMagnitude}
                onChange={(e) => setMinMagnitude(Number(e.target.value))}
                min={0}
                step={0.1}
                autoComplete="off"
                className="px-3 sm:px-4 py-2 w-full sm:w-32 rounded-lg border border-gray-300 bg-white text-black text-sm sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Min Mag"
              />
            </div>

            <Button
              variant="outline"
              className="px-3 sm:px-4 py-2 md:mt-6 rounded-lg border cursor-pointer bg-black/40 border-gray-300 text-white text-sm sm:text-base hover:bg-gray-100 hover:text-black"
              onClick={() => {
                setFromDate("");
                setToDate("");
                setDays(1);
                setMinMagnitude(3);
              }}
            >
              Reset
            </Button>

            <div className="flex flex-col w-full sm:w-auto">
              <label className="mb-1 text-xs sm:text-sm">From</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                autoComplete="off"
                className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 bg-white text-black text-sm sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex flex-col w-full sm:w-auto">
              <label className="mb-1 text-xs sm:text-sm">To</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                autoComplete="off"
                className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 bg-white text-black text-sm sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="md:mt-10 w-full flex flex-row gap-2">
            <Button
              className="bg-black/60 text-white px-6 w-1/2 sm:w-full rounded-lg hover:bg-black/80 cursor-pointer text-sm sm:text-base"
              onClick={handleSearch}
              disabled={loading}
            >
              Search
            </Button>

            <Button
              className="bg-green-600 text-white px-6 w-1/2 sm:w-full rounded-lg hover:bg-green-800 cursor-pointer text-sm sm:text-base"
              onClick={getAiNotes}
              disabled={loading}
            >
              Get AI Notes
            </Button>
          </div>

          {aiNotes && (
            <div className="fixed inset-0 w-[50%] flex items-center ml-[10%] z-50">
              <div className="relative bg-white text-black rounded-2xl shadow-xl p-6 w-[90%] sm:w-[600px] max-h-[80vh] overflow-y-auto">
                <button
                  className="absolute top-3 right-3 cursor-pointer text-gray-600 hover:text-black"
                  onClick={() => setAiNotes(null)}
                >
                  <X size={20} />
                </button>

                <h3 className="font-bold mb-3 text-lg text-center">AI Notes</h3>
                <div className="whitespace-pre-line text-sm leading-relaxed">
                  {aiNotes}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}