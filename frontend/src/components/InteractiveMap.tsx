"use client";

import React from "react";

export interface HeritageSite {
  id: number;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  stories?: { id: number; language: string; title: string; content: string }[];
}

interface MapProps {
  sites?: HeritageSite[];
  selectedSite?: HeritageSite | null;
  onSiteSelect?: (site: HeritageSite) => void;
  isPicker?: boolean;
  pickerLat?: number;
  pickerLng?: number;
  onLocationPick?: (lat: number, lng: number) => void;
  height?: string;
}

export default function InteractiveMap({
  sites = [],
  selectedSite,
  onSiteSelect,
  isPicker = false,
  pickerLat = 27.7172,
  pickerLng = 85.324,
  onLocationPick,
  height = "400px",
}: MapProps) {
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPicker || !onLocationPick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const pickedLng = 80.0 + x * 8.5;
    const pickedLat = 30.5 - y * 4.5;
    onLocationPick(parseFloat(pickedLat.toFixed(5)), parseFloat(pickedLng.toFixed(5)));
  };

  return (
    <div
      style={{ height }}
      onClick={handleCanvasClick}
      className="w-full h-full relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden cursor-pointer"
    >
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-slate-950/80 border border-slate-800 rounded-lg text-[10px] text-amber-400 font-mono">
        {isPicker ? "Map Picker (Click location)" : `Nepal Heritage Map (${sites.length} Active Pins)`}
      </div>

      {!isPicker &&
        sites.map((site) => {
          const xPct = ((site.longitude - 80.0) / 8.5) * 100;
          const yPct = ((30.5 - site.latitude) / 4.5) * 100;
          const isSelected = selectedSite?.id === site.id;

          return (
            <div
              key={site.id}
              onClick={(e) => {
                e.stopPropagation();
                if (onSiteSelect) onSiteSelect(site);
              }}
              style={{
                left: `${Math.max(5, Math.min(95, xPct))}%`,
                top: `${Math.max(5, Math.min(95, yPct))}%`,
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
                isSelected ? "scale-125 z-30" : "hover:scale-110 z-20"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[8px] ${
                  isSelected ? "bg-amber-400 text-slate-950 ring-4 ring-amber-500/30" : "bg-amber-500 text-slate-950"
                }`}
              >
                📍
              </div>
            </div>
          );
        })}

      {isPicker && (
        <div
          style={{
            left: `${Math.max(5, Math.min(95, ((pickerLng - 80.0) / 8.5) * 100))}%`,
            top: `${Math.max(5, Math.min(95, ((30.5 - pickerLat) / 4.5) * 100))}%`,
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-30 ring-4 ring-amber-500/40 rounded-full"
        >
          <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-xs font-bold shadow-lg">
            📍
          </div>
        </div>
      )}
    </div>
  );
}
