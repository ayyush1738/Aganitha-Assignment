"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, X } from "lucide-react";

interface SearchBarUIProps {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  selectedRoles: string[];
  handleRoleClick: (role: string) => void;
  removeRole: (role: string) => void;
  days: number;
  setDays: React.Dispatch<React.SetStateAction<number>>;
  minMagnitude: number;
  setMinMagnitude: React.Dispatch<React.SetStateAction<number>>;
  fromDate: string;
  setFromDate: React.Dispatch<React.SetStateAction<string>>;
  toDate: string;
  setToDate: React.Dispatch<React.SetStateAction<string>>;
  handleSearch: () => void;
  getAiNotes: () => void;
  aiNotes: string | null;
  setAiNotes: React.Dispatch<React.SetStateAction<string | null>>;
  loading: boolean;
}

export default function SearchBarUI({
  query,
  setQuery,
  selectedRoles,
  handleRoleClick,
  removeRole,
  days,
  setDays,
  minMagnitude,
  setMinMagnitude,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  handleSearch,
  getAiNotes,
  aiNotes,
  setAiNotes,
  loading,
}: SearchBarUIProps) {
  const roles = [
    "Asia",
    "North America",
    "South America",
    "Europe",
    "Africa",
    "Australia",
    "Antarctica",
  ];

  const daysOptions = [1, 7, 30];

  return (
    <div className="w-full flex flex-col items-center gap-4 p-4">
      {/* Search input */}
      <div className="flex w-full max-w-2xl items-center gap-2">
        <input
          type="text"
          placeholder="Search earthquakes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 p-2 text-black"
        />
        <Button onClick={handleSearch} disabled={loading}>
          <SearchIcon className="h-5 w-5 mr-1" />
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      {/* Role selection */}
      <div className="flex flex-wrap gap-2">
        {roles.map((role) => (
          <Button
            key={role}
            variant={selectedRoles.includes(role) ? "default" : "outline"}
            onClick={() => handleRoleClick(role)}
            className="rounded-full"
          >
            {role}
          </Button>
        ))}
      </div>

      {/* Selected roles */}
      <div className="flex flex-wrap gap-2">
        {selectedRoles.map((role) => (
          <div
            key={role}
            className="flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full"
          >
            {role}
            <X
              className="ml-2 h-4 w-4 cursor-pointer"
              onClick={() => removeRole(role)}
            />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap justify-center items-center gap-3">
        {/* Days filter */}
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {daysOptions.map((option) => (
            <option key={option} value={option}>
              Last {option} day{option > 1 ? "s" : ""}
            </option>
          ))}
        </select>

        {/* Magnitude filter */}
        <input
          type="number"
          placeholder="Min Magnitude"
          value={minMagnitude}
          onChange={(e) => setMinMagnitude(Number(e.target.value))}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        {/* Date filters */}
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* AI Notes Button */}
      <div className="flex justify-center mt-4">
        <Button onClick={getAiNotes} disabled={loading}>
          {loading ? "Loading AI Notes..." : "Get AI Notes"}
        </Button>
      </div>

      {/* AI Notes Popup */}
      {aiNotes && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <button
              onClick={() => setAiNotes(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold mb-2">AI Notes</h2>
            <p className="text-gray-700 whitespace-pre-line">{aiNotes}</p>
          </div>
        </div>
      )}
    </div>
  );
}
