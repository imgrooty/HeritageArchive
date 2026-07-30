"use client";

import React, { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "@/lib/api";

interface Story {
  id: number;
  language: string;
  title: string;
  content: string;
}

interface Media {
  id: number;
  media_url: string;
  media_type: string;
}

export interface HeritageSite {
  id: number;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  status: string;
  creator_id: number;
  stories?: Story[];
  media?: Media[];
}

interface InteractiveMapProps {
  sites?: HeritageSite[];
  selectedSite?: HeritageSite | null;
  onSiteSelect?: (site: HeritageSite) => void;
  isPicker?: boolean;
  pickerLat?: number;
  pickerLng?: number;
  onLocationPick?: (lat: number, lng: number) => void;
  height?: string;
}

const CATEGORY_CONFIG: { [key: string]: { label: string; icon: string; color: string } } = {
  all: { label: "All Sites", icon: "🌐", color: "#c5a059" },
  temple: { label: "Temples", icon: "🛕", color: "#f59e0b" },
  monument: { label: "Monuments", icon: "🏛️", color: "#10b981" },
  festival: { label: "Festivals", icon: "🏮", color: "#ef4444" },
  tradition: { label: "Traditions", icon: "🎭", color: "#f97316" },
  architecture: { label: "Architecture", icon: "🏰", color: "#8b5cf6" },
  water: { label: "Water Systems", icon: "💧", color: "#06b6d4" },
  natural: { label: "Sacred Natural", icon: "🏔️", color: "#14b8a6" },
  history: { label: "Dynasties & Epics", icon: "📜", color: "#d97706" },
};

const REGION_PRESETS = [
  { name: "Kathmandu Valley", lat: 27.7172, lng: 85.324 },
  { name: "Janakpurdham", lat: 26.7271, lng: 85.9238 },
  { name: "Solukhumbu", lat: 27.8400, lng: 86.7600 },
  { name: "Lo Manthang", lat: 29.1800, lng: 83.9700 },
  { name: "Gorkha Palace", lat: 28.0000, lng: 84.6300 },
  { name: "Panauti", lat: 27.5800, lng: 85.5200 },
  { name: "Muktinath", lat: 28.8200, lng: 83.8700 },
];

export default function InteractiveMap({
  sites = [],
  selectedSite = null,
  onSiteSelect,
  isPicker = false,
  pickerLat = 27.7172,
  pickerLng = 85.324,
  onLocationPick,
  height = "100%",
}: InteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: number]: any }>({});
  const [isLeafletReady, setIsLeafletReady] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ((window as any).L) {
      setIsLeafletReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    script.crossOrigin = "";
    script.onload = () => {
      setIsLeafletReady(true);
    };
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!isLeafletReady || !containerRef.current || mapInstanceRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    const initialLat = isPicker ? pickerLat : 27.7172;
    const initialLng = isPicker ? pickerLng : 85.324;

    const map = L.map(containerRef.current, {
      center: [initialLat, initialLng],
      zoom: isPicker ? 11 : 7,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);

    mapInstanceRef.current = map;

    if (isPicker) {
      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        if (onLocationPick) {
          onLocationPick(parseFloat(lat.toFixed(5)), parseFloat(lng.toFixed(5)));
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isLeafletReady]);

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !isLeafletReady || isPicker) return;

    const L = (window as any).L;
    const map = mapInstanceRef.current;

    Object.values(markersRef.current).forEach((m: any) => m.remove());
    markersRef.current = {};

    let filteredSites = activeCategory === "all"
      ? sites
      : sites.filter((s) => s.category.toLowerCase() === activeCategory.toLowerCase());

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filteredSites = filteredSites.filter(
        (s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
      );
    }

    if (filteredSites.length === 0) return;

    const bounds = L.latLngBounds([]);

    filteredSites.forEach((site) => {
      const catKey = site.category.toLowerCase();
      const cfg = CATEGORY_CONFIG[catKey] || { label: site.category, icon: "📍", color: "#c5a059" };

      const customIcon = L.divIcon({
        className: "custom-map-pin",
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: #09090b;
            border: 2px solid ${cfg.color};
            box-shadow: 0 0 16px ${cfg.color}80;
            font-size: 16px;
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            <span>${cfg.icon}</span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([site.latitude, site.longitude], { icon: customIcon }).addTo(map);

      // Find image media
      const imgMedia = site.media?.find((m) => m.media_type === "image");
      const imageMediaUrl = imgMedia ? imgMedia.media_url : null;
      const fullImageUrl = imageMediaUrl
        ? imageMediaUrl.startsWith("http")
          ? imageMediaUrl
          : `${API_BASE_URL}${imageMediaUrl}`
        : null;

      // Find audio media
      const audioMedia = site.media?.find((m) => m.media_type === "audio");
      const audioMediaUrl = audioMedia ? audioMedia.media_url : null;
      const fullAudioUrl = audioMediaUrl
        ? audioMediaUrl.startsWith("http")
          ? audioMediaUrl
          : `${API_BASE_URL}${audioMediaUrl}`
        : null;

      const popupHtml = `
        <div style="
          min-width: 240px;
          max-width: 280px;
          font-family: system-ui, -apple-system, sans-serif;
          color: #fff;
          background: #121216;
          border-radius: 12px;
          overflow: hidden;
          padding: 12px;
          border: 1px solid rgba(255,255,255,0.12);
        ">
          ${
            fullImageUrl
              ? `<img src="${fullImageUrl}" style="width:100%; height:110px; object-fit:cover; border-radius:8px; margin-bottom:8px;" />`
              : ""
          }
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:10px; font-weight:bold; color:${cfg.color}; text-transform:uppercase; background:${cfg.color}20; padding:2px 6px; border-radius:4px;">
              ${cfg.icon} ${site.category}
            </span>
            <span style="font-size:9px; color:#10b981; font-weight:bold;">${site.status.toUpperCase()}</span>
          </div>
          <h4 style="margin:0 0 6px 0; font-size:14px; font-weight:600; color:#fff; line-height:1.3;">${site.name}</h4>
          ${
            fullAudioUrl
              ? `
              <div style="margin: 8px 0; padding: 6px; background: rgba(197, 160, 89, 0.1); border-radius: 6px; border: 1px solid rgba(197, 160, 89, 0.3);">
                <div style="font-size: 10px; color: #c5a059; font-weight: 600; margin-bottom: 4px;">🎵 Audio Track Available</div>
                <audio controls src="${fullAudioUrl}" style="width: 100%; height: 28px; filter: invert(0.9);"></audio>
              </div>
              `
              : ""
          }
          <a href="/heritage/${site.id}" style="
            display:block;
            text-align:center;
            padding:7px 0;
            background: linear-gradient(135deg, #c5a059 0%, #a37f37 100%);
            color:#000;
            font-size:12px;
            font-weight:700;
            border-radius:8px;
            text-decoration:none;
            margin-top:10px;
          ">View Catalogue Entry &rarr;</a>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 300 });

      marker.on("click", () => {
        if (onSiteSelect) onSiteSelect(site);
      });

      markersRef.current[site.id] = marker;
      bounds.extend([site.latitude, site.longitude]);
    });

    if (filteredSites.length > 1) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    } else if (filteredSites.length === 1) {
      map.setView([filteredSites[0].latitude, filteredSites[0].longitude], 12);
    }
  }, [sites, activeCategory, searchQuery, isLeafletReady, isPicker]);

  const jumpToRegion = (lat: number, lng: number) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([lat, lng], 11, { duration: 1.2 });
  };

  return (
    <div style={{ width: "100%", height }} className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#09090b]">
      {!isPicker && (
        <div className="absolute top-4 left-4 right-4 z-20 flex flex-col gap-2 pointer-events-none">
          {/* Top Bar with Filter & Search */}
          <div className="flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-950/90 border border-white/10 backdrop-blur-md overflow-x-auto max-w-full">
              {Object.entries(CATEGORY_CONFIG).map(([catKey, cfg]) => (
                <button
                  key={catKey}
                  onClick={() => setActiveCategory(catKey)}
                  className={`px-3 py-1 rounded-lg text-xs transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeCategory === catKey
                      ? "bg-[#c5a059] text-black font-semibold shadow-md"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>{cfg.icon}</span>
                  <span>{cfg.label}</span>
                </button>
              ))}
            </div>

            {/* In-Map Search Input */}
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search map locations..."
                className="px-3 py-1.5 pl-8 rounded-xl bg-zinc-950/90 border border-white/10 backdrop-blur-md text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#c5a059] w-48 transition-all"
              />
              <span className="absolute left-2.5 text-zinc-500 text-xs">🔍</span>
            </div>
          </div>

          {/* Region Jump Presets */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-zinc-950/90 border border-white/10 backdrop-blur-md text-xs pointer-events-auto overflow-x-auto self-start">
            <span className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase px-2">Focus Region:</span>
            {REGION_PRESETS.map((reg) => (
              <button
                key={reg.name}
                onClick={() => jumpToRegion(reg.lat, reg.lng)}
                className="px-2.5 py-1 rounded-lg text-zinc-400 hover:text-[#c5a059] hover:bg-white/5 transition-all font-mono text-[11px] whitespace-nowrap"
              >
                📍 {reg.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {!isLeafletReady && (
        <div className="absolute inset-0 z-20 bg-[#09090b] flex flex-col items-center justify-center gap-2 text-zinc-500">
          <span className="w-6 h-6 rounded-full border-2 border-[#c5a059] border-t-transparent animate-spin" />
          <span className="text-xs font-mono tracking-widest text-zinc-400">LOADING CARTOGRAPHIC ENGINE...</span>
        </div>
      )}

      <div ref={containerRef} style={{ width: "100%", height: "100%" }} className="z-10" />
    </div>
  );
}
