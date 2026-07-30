"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import LanguageSelector from "@/components/LanguageSelector";
import InteractiveMap, { HeritageSite } from "@/components/InteractiveMap";
import InteractiveTiltCard from "@/components/InteractiveTiltCard";
import ScrollReveal from "@/components/ScrollReveal";
import CustomCursor from "@/components/CustomCursor";

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
  const [selectedSite, setSelectedSite] = useState<HeritageSite | null>(null);

  const categories = [
    { value: "all", label: "All Items" },
    { value: "temple", label: "Temples" },
    { value: "monument", label: "Monuments" },
    { value: "festival", label: "Festivals" },
    { value: "tradition", label: "Traditions" },
    { value: "architecture", label: "Architecture" },
    { value: "water", label: "Water Systems" },
    { value: "natural", label: "Natural" },
    { value: "history", label: "Historical" },
  ];

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

  useEffect(() => {
    const fetchSites = async () => {
      setLoading(true);
      setError(null);
      try {
        if (isSemantic && searchQuery.trim() !== "") {
          const data = await apiFetch(`/search/semantic?query=${encodeURIComponent(searchQuery)}`);
          setSearchResults(data);
          setSites(data.map((item: any) => item.site));
        } else {
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

    const timer = setTimeout(fetchSites, 300);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, isSemantic]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      setUser(null);
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f7] archive-grid-bg flex flex-col relative overflow-x-hidden">
      
      {/* Precision Cursor */}
      <CustomCursor />

      {/* Institutional Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#09090b]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
            <div className="w-9 h-9 rounded-full bg-[#c5a059] flex items-center justify-center font-bold text-black text-sm font-devanagari">
              ने
            </div>
            <div className="flex flex-col">
              <span className="font-display font-medium text-lg tracking-tight text-white uppercase">
                HERITAGE <span className="text-[#c5a059]">CATALOGUE</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-devanagari tracking-wider -mt-1">
                अभिलेख खोज तथा नक्सा
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-mono tracking-widest text-zinc-300 uppercase">
            <a href="/" className="hover:text-[#c5a059] transition-colors">Index</a>
            <span className="text-[#c5a059]">Catalogue</span>
            <a href="/education" className="hover:text-[#c5a059] transition-colors">Research</a>
            <a href="/contribute" className="hover:text-[#c5a059] transition-colors">Contribute</a>
            {user && (user.role === "moderator" || user.role === "admin") && (
              <a href="/moderation" className="text-[#c5a059] font-bold flex items-center gap-1.5 px-3 py-1 rounded bg-[#c5a059]/10 border border-[#c5a059]/30">
                <span>Moderation</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-4">
            <LanguageSelector />
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-mono text-zinc-300">@{user.username}</p>
                  <p className="text-[10px] text-[#c5a059] uppercase font-mono tracking-wider">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 border border-white/10 hover:border-[#c5a059] text-xs font-mono text-zinc-300 hover:text-white transition-all rounded-lg"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push("/auth/login")}
                className="px-4 py-2 bg-[#c5a059] hover:bg-[#d4af37] text-black font-mono font-semibold text-xs uppercase tracking-wider rounded-lg transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[calc(100vh-5rem)] z-20 relative">
        
        {/* Left Column: Search & Results Index */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <ScrollReveal direction="down">
            <div className="space-y-4 bg-[#121216] border border-white/10 p-6 rounded-2xl">
              <span className="text-[11px] font-mono tracking-widest text-[#c5a059] uppercase font-semibold">
                CATALOGUE SEARCH • SPATIAL &amp; VECTOR INDEX
              </span>
              <h1 className="text-3xl font-normal text-white font-display tracking-tight">
                Digital Repository Search
              </h1>

              {/* Minimal Search Bar */}
              <div className="w-full flex items-center gap-3 px-4 py-2.5 bg-[#09090b] border border-white/10 focus-within:border-[#c5a059] transition-all rounded-xl">
                <span className="text-zinc-500 font-mono text-xs">🔍</span>
                <input
                  id="discover-search-input"
                  type="text"
                  placeholder={isSemantic ? "Describe what you want (e.g. ancient pagoda near Bhaktapur)..." : "Search keywords, locations, sites..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-xs text-white placeholder-zinc-500 font-mono"
                />
              </div>

              {/* AI Vector Search Toggle */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-mono text-zinc-400 tracking-wider flex items-center gap-1.5">
                  <span>🤖</span> SEMANTIC VECTOR SEARCH
                </span>
                <button
                  type="button"
                  onClick={() => setIsSemantic(!isSemantic)}
                  className={`px-3 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider rounded-lg transition-all ${
                    isSemantic
                      ? "bg-[#c5a059] text-black"
                      : "bg-zinc-900 text-zinc-400 border border-white/10 hover:text-white"
                  }`}
                >
                  {isSemantic ? "ENABLED" : "DISABLED"}
                </button>
              </div>

              {/* Category Pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`flex-shrink-0 px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-lg transition-all ${
                      selectedCategory === cat.value
                        ? "bg-[#c5a059] text-black font-semibold"
                        : "bg-[#09090b] border border-white/10 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto max-h-[600px] space-y-4 pr-1 scrollbar-thin">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-zinc-500 gap-2">
                <span className="w-6 h-6 rounded-full border-2 border-[#c5a059] border-t-transparent animate-spin" />
                <span className="text-xs font-mono tracking-widest text-zinc-400 uppercase">Querying spatial index...</span>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-950/40 border border-red-500/40 text-xs text-red-300 font-mono rounded-xl">{error}</div>
            ) : sites.length === 0 ? (
              <div className="text-center py-16 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl p-8 space-y-2">
                <span className="text-2xl">🏛️</span>
                <p className="text-xs font-mono uppercase tracking-wider">No matching catalogue records found.</p>
              </div>
            ) : (
              searchResults.map((item, idx) => (
                <ScrollReveal key={item.site.id} delay={idx * 0.04}>
                  <InteractiveTiltCard
                    badgeNumber={`REF-${item.site.id}`}
                    className={`archive-card p-5 cursor-pointer rounded-2xl ${
                      selectedSite?.id === item.site.id ? 'border-[#c5a059]' : ''
                    }`}
                  >
                    <div onClick={() => setSelectedSite(item.site)} className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] text-[#c5a059] font-mono uppercase tracking-wider">
                            {item.site.category}
                          </span>
                          <h3 className="text-lg font-normal text-white font-display mt-0.5">
                            {item.site.name}
                          </h3>
                        </div>
                        <span className="text-[11px] font-mono text-zinc-500">
                          {item.site.latitude.toFixed(3)}°, {item.site.longitude.toFixed(3)}°
                        </span>
                      </div>

                      {item.site.stories && item.site.stories.length > 0 && (
                        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 font-devanagari">
                          {item.site.stories[0].content}
                        </p>
                      )}

                      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                        <span className="text-zinc-500 font-mono text-[11px]">
                          LANG: {item.site.stories?.map(s => s.language.toUpperCase()).join(", ") || "EN"}
                        </span>
                        <a
                          href={`/heritage/${item.site.id}`}
                          className="text-[#c5a059] hover:underline font-mono text-[11px] font-semibold uppercase tracking-wider"
                        >
                          View Catalogue &rarr;
                        </a>
                      </div>
                    </div>
                  </InteractiveTiltCard>
                </ScrollReveal>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Leaflet Map View */}
        <div className="lg:col-span-7 h-[650px] lg:h-full min-h-[550px] bg-[#121216] border border-white/10 rounded-2xl overflow-hidden relative shadow-2xl">
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
