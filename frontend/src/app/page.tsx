"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import LanguageSelector from "@/components/LanguageSelector";
import InteractiveMap, { HeritageSite } from "@/components/InteractiveMap";
import ParallaxLayers from "@/components/ParallaxLayers";
import InteractiveTiltCard from "@/components/InteractiveTiltCard";
import ScrollSlider from "@/components/ScrollSlider";
import ScrollReveal from "@/components/ScrollReveal";
import Hero3DCanvas from "@/components/Hero3DCanvas";
import CustomCursor from "@/components/CustomCursor";
import AudioStoryteller from "@/components/AudioStoryteller";
import MultilingualPreservation from "@/components/MultilingualPreservation";

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

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [sites, setSites] = useState<HeritageSite[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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

    const fetchSites = async () => {
      try {
        const data = await apiFetch("/heritage");
        setSites(data);
      } catch (err) {
        console.error("Failed to load map sites:", err);
      }
    };
    fetchSites();
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      setUser(null);
      router.push("/");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/discover?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f7] archive-grid-bg relative">
      
      {/* Precision Custom Cursor */}
      <CustomCursor />

      {/* Ambient Lighting Field */}
      <ParallaxLayers />

      {/* Institutional Header Navigation */}
      <header className="fixed top-0 z-50 w-full bg-[#09090b]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Institution Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
            <div className="w-9 h-9 rounded-full bg-[#c5a059] flex items-center justify-center font-bold text-black text-sm font-devanagari">
              ने
            </div>
            <div className="flex flex-col">
              <span className="font-display font-medium text-lg tracking-tight text-white uppercase">
                HERITAGE <span className="text-[#c5a059]">ARCHIVE</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-devanagari tracking-wider -mt-1">
                नेपाल डिजिटल धरोहर नेटवर्क
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-mono tracking-widest text-zinc-300 uppercase">
            <a href="#hero" className="hover:text-[#c5a059] transition-colors py-1">
              INDEX
            </a>
            <a href="/discover" className="hover:text-[#c5a059] transition-colors py-1">
              CATALOGUE
            </a>
            <a href="/education" className="hover:text-[#c5a059] transition-colors py-1">
              RESEARCH
            </a>
            <a href="/contribute" className="hover:text-[#c5a059] transition-colors py-1">
              CONTRIBUTE
            </a>
            {user && (user.role === "moderator" || user.role === "admin") && (
              <a href="/moderation" className="text-[#c5a059] hover:text-white font-bold flex items-center gap-1.5 px-3 py-1 rounded bg-[#c5a059]/10 border border-[#c5a059]/30">
                <span>MODERATION</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-pulse" />
              </a>
            )}
          </nav>

          {/* User & Language Controls */}
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
              <div className="flex items-center gap-2 font-mono text-xs">
                <button
                  onClick={() => router.push("/auth/login")}
                  className="px-4 py-2 text-zinc-300 hover:text-white uppercase tracking-wider"
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push("/auth/register")}
                  className="px-4 py-2 bg-[#c5a059] hover:bg-[#d4af37] text-black font-semibold uppercase tracking-wider rounded-lg transition-all"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative pt-28 pb-16 px-6 max-w-7xl mx-auto z-20">
        <ScrollReveal direction="up">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center border-b border-white/10 pb-16">
            
            {/* Left Content */}
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#121216] border border-white/10 text-[11px] font-mono text-[#c5a059] uppercase tracking-widest">
                <span>DIGITAL CULTURAL PRESERVATION NETWORK • NEPAL</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal text-white font-display tracking-tight leading-tight">
                  DIGITAL ARCHIVE OF <span className="text-[#c5a059] italic">NEPAL&apos;S</span> HERITAGE &amp; TRADITIONS
                </h1>

                <p className="text-xl sm:text-2xl text-amber-100/80 font-devanagari font-light pt-1">
                  नेपालका लोपोन्मुख सांस्कृतिक धरोहर, कला तथा मौखिक परम्पराको डिजिटल अभिलेख
                </p>
              </div>

              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xl">
                A community-verified digital repository documenting sacred monuments, indigenous oral folklore, traditional rituals, and architectural heritage across Nepal.
              </p>

              {/* Minimal Search Bar */}
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md bg-[#121216] border border-white/10 rounded-xl p-1.5">
                <input
                  type="text"
                  placeholder="Search catalogue by name, region, or tradition..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent px-3 py-2 text-xs text-white focus:outline-none placeholder-zinc-500 font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#c5a059] hover:bg-[#d4af37] text-black font-mono font-semibold text-xs uppercase tracking-wider rounded-lg transition-all shrink-0"
                >
                  Search 🔍
                </button>
              </form>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => router.push("/discover")}
                  className="px-5 py-3 bg-[#c5a059] hover:bg-[#d4af37] text-black text-xs font-mono font-bold uppercase tracking-widest rounded-xl transition-all"
                >
                  Explore Cartographic Map &rarr;
                </button>
                <button
                  onClick={() => router.push("/contribute")}
                  className="px-5 py-3 bg-[#121216] hover:bg-zinc-800 border border-white/10 text-white text-xs font-mono uppercase tracking-widest rounded-xl transition-all"
                >
                  Submit Heritage Entry +
                </button>
              </div>
            </div>

            {/* Right 3D Relic Canvas */}
            <div className="lg:col-span-6 w-full">
              <Hero3DCanvas />
            </div>

          </div>
        </ScrollReveal>
      </section>

      {/* Archival Catalog Index Stats */}
      <section className="py-12 px-6 max-w-7xl mx-auto border-b border-white/10 z-20 relative">
        <ScrollReveal direction="up">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <InteractiveTiltCard className="archive-card p-6 rounded-xl text-center">
              <div className="text-3xl md:text-4xl font-mono text-[#c5a059]">120+</div>
              <p className="text-xs font-mono text-zinc-300 uppercase tracking-wider mt-2">Catalogued Sites</p>
              <p className="text-[10px] text-zinc-500 font-devanagari mt-0.5">प्रमाणित धरोहरहरू</p>
            </InteractiveTiltCard>

            <InteractiveTiltCard className="archive-card p-6 rounded-xl text-center">
              <div className="text-3xl md:text-4xl font-mono text-[#c5a059]">4</div>
              <p className="text-xs font-mono text-zinc-300 uppercase tracking-wider mt-2">Languages Preserved</p>
              <p className="text-[10px] text-zinc-500 font-devanagari mt-0.5">नेपाली • मैथिली • भोजपुरी • English</p>
            </InteractiveTiltCard>

            <InteractiveTiltCard className="archive-card p-6 rounded-xl text-center">
              <div className="text-3xl md:text-4xl font-mono text-[#c5a059]">450+</div>
              <p className="text-xs font-mono text-zinc-300 uppercase tracking-wider mt-2">Audio Records</p>
              <p className="text-[10px] text-zinc-500 font-devanagari mt-0.5">मौखिक इतिहास र लोककथा</p>
            </InteractiveTiltCard>

            <InteractiveTiltCard className="archive-card p-6 rounded-xl text-center">
              <div className="text-3xl md:text-4xl font-mono text-[#c5a059]">1,200+</div>
              <p className="text-xs font-mono text-zinc-300 uppercase tracking-wider mt-2">Guthi Validations</p>
              <p className="text-[10px] text-zinc-500 font-devanagari mt-0.5">गुठी अभिलेख प्रमाणीकरण</p>
            </InteractiveTiltCard>
          </div>
        </ScrollReveal>
      </section>

      {/* Cartographic Exploration */}
      <section id="map" className="py-16 px-6 max-w-7xl mx-auto z-20 relative">
        <ScrollReveal direction="up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-[11px] font-mono tracking-widest text-[#c5a059] uppercase font-semibold">
                CARTOGRAPHIC ARCHIVE MAP
              </span>
              <h2 className="text-3xl md:text-4xl font-normal text-white font-display mt-0.5">
                Geographic Location Index
              </h2>
            </div>
            <p className="text-xs text-zinc-400 max-w-md">
              Filter registered heritage sites by category, view spatial coordinates, and examine regional distribution.
            </p>
          </div>

          <div className="w-full h-[550px]">
            <InteractiveMap sites={sites} height="100%" />
          </div>
        </ScrollReveal>
      </section>

      {/* Pinned Exhibit Cards Slider */}
      <ScrollSlider />

      {/* Oral Folklore Sound Archive */}
      <section className="py-20 px-6 max-w-7xl mx-auto z-20 relative">
        <ScrollReveal direction="up">
          <AudioStoryteller />
        </ScrollReveal>
      </section>

      {/* Multilingual Manuscript Preservation */}
      <section className="py-16 px-6 max-w-7xl mx-auto z-20 relative">
        <ScrollReveal direction="up">
          <MultilingualPreservation />
        </ScrollReveal>
      </section>

      {/* Institutional Verification Workflow */}
      <section className="py-20 px-6 max-w-7xl mx-auto z-20 relative border-t border-white/10">
        <ScrollReveal direction="up">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-mono tracking-widest text-[#c5a059] uppercase font-semibold">
              TRUST &amp; PROVENANCE ARCHITECTURE
            </span>
            <h2 className="text-3xl md:text-4xl font-normal text-white font-display mt-0.5">
              Verification &amp; Curation Pipeline
            </h2>
            <p className="text-xs text-zinc-400 mt-2 font-devanagari">
              प्रमाणित अभिलेख, गुठी प्रमाणीकरण तथा संस्करण नियन्त्रण
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <InteractiveTiltCard className="archive-card p-6 rounded-xl flex flex-col justify-between">
              <div className="w-10 h-10 rounded-lg bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center text-[#c5a059] font-mono text-sm font-bold mb-4">
                01
              </div>
              <h4 className="text-base font-medium text-white font-display">Community Submission</h4>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Local contributors upload documentation, photographs, and precise GPS location markers.
              </p>
            </InteractiveTiltCard>

            <InteractiveTiltCard className="archive-card p-6 rounded-xl flex flex-col justify-between">
              <div className="w-10 h-10 rounded-lg bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center text-[#c5a059] font-mono text-sm font-bold mb-4">
                02
              </div>
              <h4 className="text-base font-medium text-white font-display">Moderator Audit</h4>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Platform moderators review media resolution, safety compliance, and spatial metadata.
              </p>
            </InteractiveTiltCard>

            <InteractiveTiltCard className="archive-card p-6 rounded-xl flex flex-col justify-between">
              <div className="w-10 h-10 rounded-lg bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center text-[#c5a059] font-mono text-sm font-bold mb-4">
                03
              </div>
              <h4 className="text-base font-medium text-white font-display">Guthi Validation</h4>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Local Guthi elders and cultural researchers confirm ritual lore and historical context.
              </p>
            </InteractiveTiltCard>

            <InteractiveTiltCard className="archive-card p-6 rounded-xl flex flex-col justify-between">
              <div className="w-10 h-10 rounded-lg bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center text-[#c5a059] font-mono text-sm font-bold mb-4">
                04
              </div>
              <h4 className="text-base font-medium text-white font-display">Multilingual Translation</h4>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                NLP translation models generate Nepali, Maithili, English, and Bhojpuri records with version control.
              </p>
            </InteractiveTiltCard>
          </div>
        </ScrollReveal>
      </section>

      {/* Institutional Footer */}
      <footer className="w-full bg-[#060608] border-t border-white/10 py-10 px-6 z-20 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#c5a059] flex items-center justify-center font-bold text-black text-xs font-devanagari">
              ने
            </div>
            <div>
              <span className="font-display text-sm text-white uppercase tracking-wider">
                CULTURAL HERITAGE ARCHIVE NETWORK
              </span>
              <p className="text-[10px] text-zinc-500 font-mono">
                © {new Date().getFullYear()} Digital Preservation Network • All Content Attribution Intact
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-zinc-400 font-mono uppercase">
            <a href="/discover" className="hover:text-[#c5a059] transition-colors">Catalogue</a>
            <a href="/education" className="hover:text-[#c5a059] transition-colors">Research</a>
            <a href="/contribute" className="hover:text-[#c5a059] transition-colors">Contribute</a>
            <a href="/auth/login" className="hover:text-[#c5a059] transition-colors">Sign In</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
