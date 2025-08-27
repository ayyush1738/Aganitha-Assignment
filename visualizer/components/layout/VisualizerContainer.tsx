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