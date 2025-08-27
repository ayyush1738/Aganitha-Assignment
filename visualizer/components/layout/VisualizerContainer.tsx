"use client";

import { useState } from "react";
import axios from "axios";
import SearchBarUI from "@/components/ui/VisualizerUi"; // <-- New UI Component

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

export default function SearchBarContainer({ onResults }: SearchBarProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [days, setDays] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [minMagnitude, setMinMagnitude] = useState<number>(3);
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
      const startDate: Date = fromDate ? new Date(fromDate) : new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      const endDate: Date = toDate ? new Date(toDate) : now;

      // Default feed
      const defaultUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
      const defaultResp = await axios.get(defaultUrl);
      let features = defaultResp.data.features;

      // Filter by mag, time, place
      features = features
        .filter((f: any) => f.properties.mag >= minMagnitude)
        .filter((f: any) => {
          const quakeTime = new Date(f.properties.time);
          return quakeTime >= startDate && quakeTime <= endDate;
        });

      if (query.trim()) {
        features = features.filter((f: any) =>
          f.properties.place?.toLowerCase().includes(query.toLowerCase())
        );
      }

      // Filter by selected region
      if (selectedRoles.length > 0) {
        const coords = roleCoordinates[selectedRoles[0]];
        if (coords) {
          features = features.filter((f: any) => {
            const [lon, lat] = f.geometry.coordinates;
            return haversineDistance({ lat, lon }, { lat: coords.lat, lon: coords.lon }) <= coords.radius;
          });
        }
      }

      // Merge with FDSN API
      const fdsnResp = await axios.get("https://earthquake.usgs.gov/fdsnws/event/1/query", {
        params: {
          format: "geojson",
          starttime: startDate.toISOString().split("T")[0],
          endtime: endDate.toISOString().split("T")[0],
          minmagnitude: minMagnitude,
          orderby: "time",
          ...(selectedRoles.length > 0 ? roleCoordinates[selectedRoles[0]] : {}),
        },
      });

      const allFeatures = [...features, ...fdsnResp.data.features];
      onResults({ features: allFeatures });
      setAiNotes(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch earthquake data. Try again later.");
    }

    setLoading(false);
  };

  const getAiNotes = async () => {
    setLoading(true);
    setError(null);
    setAiNotes("");

    try {
      const now = new Date();
      const startDate: Date = fromDate ? new Date(fromDate) : new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      const endDate: Date = toDate ? new Date(toDate) : now;

      const defaultUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
      const defaultResp = await axios.get(defaultUrl);
      let features = defaultResp.data.features.filter((f: any) => f.properties.mag >= minMagnitude);

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

      const res = await fetch("/api/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: earthquakeText }),
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
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  return (
    <SearchBarUI
      {...{
        query, setQuery,
        selectedRoles, setSelectedRoles, handleRoleClick, removeRole,
        days, setDays,
        minMagnitude, setMinMagnitude,
        fromDate, setFromDate,
        toDate, setToDate,
        handleSearch, getAiNotes,
        aiNotes, setAiNotes,
        loading, error
      }}
    />
  );
}
