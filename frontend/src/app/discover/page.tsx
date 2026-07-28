"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import LanguageSelector from "@/components/LanguageSelector";

import InteractiveMap, { HeritageSite } from "@/components/InteractiveMap";

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

function decodeToken(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export default function DiscoverPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [sites, setSites] = useState<HeritageSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and AI Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isSemantic, setIsSemantic] = useState(false);
  const [searchResults, setSearchResults] = useState<{ site: HeritageSite; similarity?: number }[]>([]);
  
  // Selected map site
  const [selectedSite, setSelectedSite] = useState<HeritageSite | null>(null);

  // Categories list
  const categories = [
    { value: "all", label: "All Items" },
    { value: "temple", label: "Temples 🏮" },
    { value: "monument", label: "Monuments 🏛️" },
    { value: "festival", label: "Festivals 🌊" },
    { value: "tradition", label: "Traditions 🗣️" },
    { value: "architecture", label: "Architecture 🧱" },
    { value: "natural", label: "Natural 🌳" },
    { value: "history", label: "Historical 📜" },
  ];

  // Decode JWT on load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = decodeToken(token);
        if (decoded) {
          setUser({ username: decoded.username, role: decoded.role });
        }
      }
    }
  }, []);

  // Fetch heritage sites on filter changes
  useEffect(() => {
    const fetchSites = async () => {
      setLoading(true);
      setError(null);
      try {
        if (isSemantic && searchQuery.trim() !== "") {
          // Trigger semantic vector search
          const data = await apiFetch(`/search/semantic?query=${encodeURIComponent(searchQuery)}`);
          setSearchResults(data);
          setSites(data.map((item: any) => item.site));
        } else {
          // Trigger standard search and filter
          let endpoint = "/heritage";
          const params: string[] = [];
          
          if (selectedCategory !== "all") {
            params.push(`category=${selectedCategory}`);
          }
          if (searchQuery.trim() !== "") {
            params.push(`search=${encodeURIComponent(searchQuery)}`);
          }
          
          if (params.length > 0) {
            endpoint += `?${params.join("&")}`;
          }

          const data = await apiFetch(endpoint);
          setSearchResults(data.map((site: any) => ({ site })));
          setSites(data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch archive records.");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchSites, 300); // Debounce typing queries
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, isSemantic]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      router.push("/");
    }
  };

  // Convert coordinates to coordinate percentage offsets inside the mock canvas
  const getMapCoordinates = (lat: number, lng: number) => {
    // Nepal coordinates mapping bounds roughly: 
    // Lat: 26.3 to 30.5
    // Lng: 80.0 to 88.2
    const yPct = 100 - ((lat - 26.0) / (31.0 - 26.0)) * 100;
    const xPct = ((lng - 80.0) / (89.0 - 80.0)) * 100;
    
    // Boundary clamps
    return {
      top: `${Math.max(10, Math.min(90, yPct))}%`,
      left: `${Math.max(10, Math.min(90, xPct))}%`,
    };
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-white flex flex-col selection:bg-[#fb923c] selection:text-black">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#07070a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-extrabold text-black text-base shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              ने
            </div>
            <span className="font-extrabold text-md tracking-tight bg-gradient-to-r from-amber-200 to-orange-400 bg-clip-text text-transparent">
              HeritageArchive
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-zinc-400 font-medium">
            <span className="text-white">Discover</span>
            <a href="/education" className="hover:text-amber-400 transition-colors">Education Portal</a>
            <a href="/contribute" className="hover:text-amber-400 transition-colors">Contribute</a>
            
            {user && (user.role === "moderator" || user.role === "admin") && (
              <a href="/moderation" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                Moderation Queue
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              </a>
            )}
          </div>

          <div className="flex items-center gap-4">
            <LanguageSelector />
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs font-bold text-zinc-300">@{user.username}</p>
                  <p className="text-[10px] text-amber-500 font-semibold uppercase tracking-wider">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push("/auth/login")}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-xs font-bold text-black"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Discover Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-4rem)] overflow-hidden">
        
        {/* Left Column - Search & Records */}
        <div className="lg:col-span-5 flex flex-col gap-6 h-full overflow-hidden">
          {/* Search Header */}
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-black">Discover Heritage</h2>
            
            {/* Search Input */}
            <div className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-white/15 bg-white/5 focus-within:border-amber-500/50 transition-all">
              <svg className="w-4.5 h-4.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                id="discover-search-input"
                name="searchQuery"
                type="text"
                placeholder={isSemantic ? "Describe what you want to find (e.g. ancient pagoda near Bhaktapur)..." : "Search by keywords..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-xs text-white placeholder-zinc-500"
              />
            </div>

            {/* AI Semantic Search Toggle */}
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white/[0.02] border border-white/5 mt-0.5">
              <span className="text-[10px] font-black text-zinc-400 tracking-wider flex items-center gap-1.5">
                <span>🤖</span> AI SEMANTIC VECTOR SEARCH
              </span>
              <button
                type="button"
                onClick={() => setIsSemantic(!isSemantic)}
                className={`px-3 py-1 rounded-lg text-[10px] font-extrabold transition-all duration-300 ${
                  isSemantic
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/10"
                    : "bg-[#0b0b0f] text-zinc-400 hover:text-white border border-white/5"
                }`}
              >
                {isSemantic ? "ENABLED" : "DISABLED"}
              </button>
            </div>

            {/* Quick Categories pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                    selectedCategory === cat.value
                      ? "bg-amber-500 text-black shadow-md shadow-amber-500/10"
                      : "border border-white/5 bg-[#0e0e13] text-zinc-400 hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Records List Container */}
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 text-zinc-500 py-12">
                <span className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                <span className="text-xs font-semibold uppercase tracking-wider">Syncing records...</span>
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl border border-rose-500/15 bg-rose-500/5 text-xs text-rose-400">{error}</div>
            ) : sites.length === 0 ? (
              <div className="text-center py-20 text-zinc-500 border border-dashed border-white/5 rounded-2xl flex flex-col items-center gap-2">
                <span className="text-xl">📭</span>
                <p className="text-xs font-semibold">No approved archive records found matching filter.</p>
              </div>
            ) : (
              searchResults.map((item) => (
                <div
                  key={item.site.id}
                  onClick={() => setSelectedSite(item.site)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col gap-3 ${
                    selectedSite?.id === item.site.id
                      ? "border-amber-500/40 bg-amber-500/[0.03]"
                      : "border-white/5 bg-[#0a0a0e] hover:border-white/10 hover:bg-[#0f0f14]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">{item.site.category}</span>
                        {item.similarity !== undefined && item.similarity !== null && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {Math.round(item.similarity * 100)}% Match
                          </span>
                        )}
                      </div>
                      <h3 className="font-extrabold text-base text-white">{item.site.name}</h3>
                    </div>
                    <span className="text-[10px] text-zinc-500 bg-white/5 px-2 py-0.5 rounded font-mono">
                      {item.site.latitude.toFixed(4)}°, {item.site.longitude.toFixed(4)}°
                    </span>
                  </div>

                  {item.site.stories && item.site.stories.length > 0 && (
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                      {item.site.stories[0].content}
                    </p>
                  )}

                  <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1">
                    <span className="text-[10px] text-zinc-500">Language: {item.site.stories?.map(s => s.language.toUpperCase()).join(", ") || "N/A"}</span>
                    <a
                      href={`/heritage/${item.site.id}`}
                      className="text-[10px] text-amber-500 font-bold hover:underline"
                    >
                      Read Detail Stories &rarr;
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column - Real Leaflet Interactive Map Interface */}
        <div className="lg:col-span-7 min-h-[500px] h-full flex flex-col rounded-3xl border border-white/5 bg-[#0a0a0e] overflow-hidden relative shadow-2xl">
          <InteractiveMap
            sites={sites}
            selectedSite={selectedSite}
            onSiteSelect={(site) => setSelectedSite(site)}
            height="100%"
          />
        </div>
      </main>
    </div>
  );
}
