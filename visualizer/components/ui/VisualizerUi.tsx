"use client";

import { Button } from "@/components/ui/button";
import { Search as SearchIcon, X } from "lucide-react";

const roles = ["Asia","North America","South America","Europe","Africa","Antarctica","Australia"];
const daysOptions = [1, 3, 10, 20, 30];

export default function SearchBarUI({
  query, setQuery,
  selectedRoles, handleRoleClick, removeRole,
  days, setDays,
  minMagnitude, setMinMagnitude,
  fromDate, setFromDate,
  toDate, setToDate,
  handleSearch, getAiNotes,
  aiNotes, setAiNotes,
  loading
}: any) {
  return (
    <section className="w-full p-4 sm:p-6">
      <div className="max-w-5xl mx-auto text-center px-2 sm:px-4 items-center">

        {/* Search Input */}
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 max-w-2xl mx-auto mb-6 bg-black/20 shadow-md rounded-full px-3 sm:px-4 py-2 border border-gray-200">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            className="flex-1 px-2 sm:px-4 py-2 outline-none text-white bg-transparent"
            placeholder="Find earthquakes by location/region"
          />
          {selectedRoles.map((role: string) => (
            <span key={role} className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-white text-black rounded-full text-xs sm:text-sm">
              {role}
              <button onClick={() => removeRole(role)} className="text-red-600 hover:text-red-800 cursor-pointer">
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

        {/* Roles */}
        <div className="flex text-xs sm:text-sm justify-center flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => handleRoleClick(role)}
              className={`px-2 sm:px-3 py-1 rounded-full border ${selectedRoles.includes(role) ? "bg-white text-black border-black" : "text-white hover:bg-gray-800 cursor-pointer"}`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 mb-6 sm:mb-8 items-center">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-3/4 flex-wrap justify-center text-white">
            
            {/* Days */}
            <div className="flex flex-col">
              <label className="mb-1 text-xs sm:text-sm">Days</label>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="px-3 py-2 rounded-lg border bg-white text-black"
              >
                {daysOptions.map((d) => (
                  <option key={d} value={d}>{d} day{d > 1 ? "s" : ""}</option>
                ))}
              </select>
            </div>

            {/* Magnitude */}
            <div className="flex flex-col">
              <label className="mb-1 text-xs sm:text-sm">Magnitude</label>
              <input
                type="number"
                value={minMagnitude}
                onChange={(e) => setMinMagnitude(Number(e.target.value))}
                className="px-3 py-2 rounded-lg border bg-white text-black"
              />
            </div>

            {/* From/To */}
            <div className="flex flex-col">
              <label className="mb-1 text-xs sm:text-sm">From</label>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="px-3 py-2 rounded-lg border bg-white text-black" />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-xs sm:text-sm">To</label>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="px-3 py-2 rounded-lg border bg-white text-black" />
            </div>
          </div>

          {/* Buttons */}
          <div className="w-full flex flex-row gap-2">
            <Button className="bg-black/60 text-white px-6 w-1/2 rounded-lg" onClick={handleSearch} disabled={loading}>Search</Button>
            <Button className="bg-green-600 text-white px-6 w-1/2 rounded-lg" onClick={getAiNotes} disabled={loading}>Get AI Notes</Button>
          </div>

          {/* AI Notes Modal */}
          {aiNotes && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="relative bg-white text-black rounded-2xl shadow-xl p-6 w-[90%] sm:w-[600px] max-h-[80vh] overflow-y-auto">
                <button className="absolute top-3 right-3" onClick={() => setAiNotes(null)}>
                  <X size={20} />
                </button>
                <h3 className="font-bold mb-3 text-lg text-center">AI Notes</h3>
                <div className="whitespace-pre-line text-sm">{aiNotes}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
