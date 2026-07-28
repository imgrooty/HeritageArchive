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

export default function InteractiveMap({
  sites = [],
  selectedSite = null,
  onSiteSelect,
  isPicker = false,
  pickerLat = 27.7172,
  pickerLng = 85.3240,
  onLocationPick,
  height = "100%",
}: InteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: number]: any }>({});
  const pickerMarkerRef = useRef<any>(null);
  const [isLeafletReady, setIsLeafletReady] = useState(false);

  // Category emoji mapping
  const categoryEmojis: Record<string, string> = {
    temple: "🏮",
    monument: "🏛️",
    festival: "🌊",
    tradition: "🗣️",
    traditional_practice: "🎨",
    architecture: "🧱",
    natural: "🌳",
    natural_heritage: "🌳",
    history: "📜",
    historical_site: "📜",
  };

  // Category color mapping
  const categoryColors: Record<string, string> = {
    temple: "#f59e0b",
    monument: "#a855f7",
    festival: "#f97316",
    tradition: "#14b8a6",
    traditional_practice: "#14b8a6",
    architecture: "#0ea5e9",
    natural: "#10b981",
    natural_heritage: "#10b981",
    history: "#eab308",
    historical_site: "#eab308",
  };

  // Load Leaflet dynamically on client side
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

    return () => {
      // script cleanup if unmounted
    };
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!isLeafletReady || !containerRef.current || mapInstanceRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Center around Nepal (Kathmandu default or picker coords)
    const initialLat = isPicker ? pickerLat : 27.7172;
    const initialLng = isPicker ? pickerLng : 85.3240;
    const initialZoom = isPicker ? 11 : 7;

    const map = L.map(containerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: false,
    });

    // Add CartoDB Dark Matter tile layer for a modern dark theme
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    // Custom Zoom controls at top right
    L.control.zoom({ position: "topright" }).addTo(map);

    mapInstanceRef.current = map;

    // If location picker mode, handle map clicks to select coordinates
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

  // Update Markers for Heritage Sites
  useEffect(() => {
    if (!mapInstanceRef.current || !isLeafletReady || isPicker) return;

    const L = (window as any).L;
    const map = mapInstanceRef.current;

    // Clear existing markers
    Object.values(markersRef.current).forEach((m: any) => m.remove());
    markersRef.current = {};

    if (sites.length === 0) return;

    const bounds = L.latLngBounds([]);

    sites.forEach((site) => {
      const color = categoryColors[site.category] || "#f59e0b";
      const emoji = categoryEmojis[site.category] || "📍";

      // Custom Glowing DivIcon
      const customIcon = L.divIcon({
        className: "custom-map-pin",
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: rgba(14, 14, 20, 0.9);
            border: 2px solid ${color};
            box-shadow: 0 0 15px ${color}80;
            font-size: 16px;
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            <span>${emoji}</span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([site.latitude, site.longitude], { icon: customIcon }).addTo(map);

      // Popup Content
      const mediaUrl = site.media && site.media.length > 0 ? site.media[0].media_url : null;
      const fullMediaUrl = mediaUrl ? (mediaUrl.startsWith("http") ? mediaUrl : `${API_BASE_URL}${mediaUrl}`) : null;
      const firstStory = site.stories && site.stories.length > 0 ? site.stories[0].content : "Local cultural heritage site.";

      const popupHtml = `
        <div style="
          min-width: 220px;
          max-width: 260px;
          font-family: system-ui, sans-serif;
          color: #fff;
          background: #0e0e13;
          border-radius: 12px;
          overflow: hidden;
          padding: 10px;
        ">
          ${
            fullMediaUrl
              ? `<img src="${fullMediaUrl}" style="width:100%; height:110px; object-fit:cover; border-radius:8px; margin-bottom:8px;" />`
              : ""
          }
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <span style="
              font-size:9px;
              font-weight:bold;
              color:${color};
              text-transform:uppercase;
              letter-spacing:1px;
            ">${site.category}</span>
            <span style="font-size:9px; color:#10b981; font-weight:bold;">${site.status.toUpperCase()}</span>
          </div>
          <h4 style="margin:0 0 6px 0; font-size:14px; font-weight:bold; color:#fff;">${site.name}</h4>
          <p style="
            font-size:11px;
            color:#a1a1aa;
            margin:0 0 10px 0;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            line-height: 1.4;
          ">${firstStory}</p>
          <a href="/heritage/${site.id}" style="
            display:block;
            text-align:center;
            padding:6px 0;
            background:${color};
            color:#000;
            font-size:11px;
            font-weight:bold;
            border-radius:6px;
            text-decoration:none;
          ">Explore Heritage Entry &rarr;</a>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: "custom-leaflet-popup",
        maxWidth: 280,
      });

      marker.on("click", () => {
        if (onSiteSelect) {
          onSiteSelect(site);
        }
      });

      markersRef.current[site.id] = marker;
      bounds.extend([site.latitude, site.longitude]);
    });

    // Auto fit bounds if multiple sites exist
    if (sites.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    } else if (sites.length === 1) {
      map.setView([sites[0].latitude, sites[0].longitude], 12);
    }
  }, [sites, isLeafletReady, isPicker]);

  // Pan Map when selectedSite changes
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedSite || isPicker) return;
    const map = mapInstanceRef.current;
    map.flyTo([selectedSite.latitude, selectedSite.longitude], 13, { duration: 1.2 });
    if (markersRef.current[selectedSite.id]) {
      markersRef.current[selectedSite.id].openPopup();
    }
  }, [selectedSite]);

  // Update Picker Pin Marker
  useEffect(() => {
    if (!mapInstanceRef.current || !isLeafletReady || !isPicker) return;
    const L = (window as any).L;
    const map = mapInstanceRef.current;

    if (pickerMarkerRef.current) {
      pickerMarkerRef.current.remove();
    }

    const pickerIcon = L.divIcon({
      className: "picker-map-pin",
      html: `
        <div style="
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #f59e0b;
          color: #000;
          font-weight: bold;
          box-shadow: 0 0 20px rgba(245, 158, 11, 0.8);
          font-size: 20px;
        ">
          📍
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    const marker = L.marker([pickerLat, pickerLng], {
      icon: pickerIcon,
      draggable: true,
    }).addTo(map);

    marker.on("dragend", (e: any) => {
      const { lat, lng } = e.target.getLatLng();
      if (onLocationPick) {
        onLocationPick(parseFloat(lat.toFixed(5)), parseFloat(lng.toFixed(5)));
      }
    });

    pickerMarkerRef.current = marker;
    map.panTo([pickerLat, pickerLng]);
  }, [pickerLat, pickerLng, isLeafletReady, isPicker]);

  return (
    <div style={{ width: "100%", height }} className="relative rounded-2xl overflow-hidden shadow-2xl">
      {!isLeafletReady && (
        <div className="absolute inset-0 z-20 bg-[#07070a] flex flex-col items-center justify-center gap-2 text-zinc-500">
          <span className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Loading Interactive Map...</span>
        </div>
      )}
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} className="z-10" />
    </div>
  );
}
