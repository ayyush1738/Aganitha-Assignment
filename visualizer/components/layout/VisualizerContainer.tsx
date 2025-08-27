import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, X } from "lucide-react";
import axios from "axios";

const roles = [
  "Asia",
  "North America",
  "South America",
  "Europe",
  "Africa",
  "Antarctica",
  "Australia",
];

const roleCoordinates: Record<string, { lat: number; lon: number; radius: number }> = {
  Asia: { lat: 34.0479, lon: 100.6197, radius: 5000 },
  "North America": { lat: 54.526, lon: -105.2551, radius: 5000 },
  "South America": { lat: -8.7832, lon: -55.4915, radius: 4000 },
  Europe: { lat: 54.526, lon: 15.2551, radius: 4000 },
  Africa: { lat: 8.7832, lon: 34.5085, radius: 5000 },
  Antarctica: { lat: -82.8628, lon: 135.0, radius: 2500 },
  Australia: { lat: -25.2744, lon: 133.7751, radius: 3000 },
};

const daysOptions = [1, 3, 10, 20, 30];

interface SearchBarProps {
  onResults: (data: any) => void;
}

export default function SearchBar({ onResults }: SearchBarProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [days, setDays] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [minMagnitude, setMinMagnitude] = useState<number>(3);

  // Store AI notes
  const [aiNotes, setAiNotes] = useState<string | null>(null);

  const handleRoleClick = (role: string) => {
    if (!selectedRoles.includes(role)) setSelectedRoles([...selectedRoles, role]);
  };

  const removeRole = (role: string) => setSelectedRoles(selectedRoles.filter(r => r !== role));

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

      if (selectedRoles.length > 0) {
        const coords = roleCoordinates[selectedRoles[0]];
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

      // Merge with FDSN API
      const fdsnParams: Record<string, string | number> = {
        format: "geojson",
        starttime: startDate.toISOString().split("T")[0],
        endtime: endDate.toISOString().split("T")[0],
        minmagnitude: minMagnitude,
        orderby: "time",
      };
      if (selectedRoles.length > 0) {
        const coords = roleCoordinates[selectedRoles[0]];
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