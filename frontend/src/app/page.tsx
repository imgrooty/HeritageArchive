"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import LanguageSelector from "@/components/LanguageSelector";
import InteractiveMap, { HeritageSite } from "@/components/InteractiveMap";

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

  // Animation refs
  const heroRef = useRef<HTMLDivElement>(null);
  const heroBgRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);

  const [activeStoryLang, setActiveStoryLang] = useState<"ne" | "en" | "mai">("ne");
  const [activeRegionPin, setActiveRegionPin] = useState<string>("kathmandu");

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

  // Parallax Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      if (heroBgRef.current) {
        const scrolled = window.scrollY;
        heroBgRef.current.style.transform = `translate3d(0, ${scrolled * 0.35}px, 0)`;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      setUser(null);
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-white selection:bg-amber-500 selection:text-black font-sans">
      
      {/* Sticky Header Navigation */}
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#07070a]/75 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo Badge */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push("/")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 flex items-center justify-center font-black text-black text-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:scale-105 transition-transform duration-300">
              ने
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-gradient-gold">
                Cultural Heritage Archive
              </span>
              <span className="text-[10px] text-amber-400/80 font-devanagari font-bold tracking-widest uppercase -mt-1">
                नेपाल सांस्कृतिक धरोहर
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wider text-zinc-400 uppercase">
            <a href="#about" className="hover:text-amber-400 transition-colors">Mission</a>
            <a href="/discover" className="hover:text-amber-400 transition-colors">Discover Archive</a>
            <a href="/education" className="hover:text-amber-400 transition-colors">Education</a>
            <a href="/contribute" className="hover:text-amber-400 transition-colors">Contribute</a>
            {user && (user.role === "moderator" || user.role === "admin") && (
              <a href="/moderation" className="hover:text-amber-400 transition-colors flex items-center gap-1.5 text-orange-400">
                <span>Moderation Queue</span>
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              </a>
            )}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-4">
            <LanguageSelector />
            
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-zinc-200">@{user.username}</p>
                  <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-widest">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-bold text-zinc-400 hover:text-white transition-all"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push("/auth/login")}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push("/auth/register")}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-xs font-extrabold text-black hover:scale-105 shadow-lg shadow-amber-500/20 transition-all"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* SECTION 1: Parallax Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden">
        {/* Parallax Hero Background Image */}
        <div
          ref={heroBgRef}
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-110 opacity-30"
          style={{ backgroundImage: "url('/hero_heritage_nepal.png')" }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#07070a]/60 via-[#07070a]/80 to-[#07070a]" />

        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center flex flex-col items-center gap-8">
          
          {/* Devanagari Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-md shadow-lg shadow-amber-500/10">
            <span className="text-amber-400 text-xs animate-spin">☸</span>
            <span className="text-xs font-devanagari font-bold text-amber-300 tracking-wider">
              सांस्कृतिक सम्पदाको डिजिटल अभिलेख • Cultural Heritage Archive
            </span>
          </div>

          {/* Main Titles */}
          <div ref={heroTitleRef} className="flex flex-col items-center gap-4 max-w-4xl">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif-accent font-normal tracking-tight text-white leading-[1.1]">
              Preserve Local Stories <br />
              <span className="text-gradient-amber font-devanagari font-bold">हस्तान्तरण गरौँ नयाँ पुस्तालाई</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-zinc-300 leading-relaxed font-normal max-w-2xl">
              A community-driven digital vault for documenting, translating, and discovering Nepal's endangered cultural sites, oral traditions, and sacred architecture.
            </p>
          </div>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            <button
              onClick={() => router.push("/discover")}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-black font-extrabold text-sm shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <span>Explore Interactive Archive</span>
              <span className="text-base">➔</span>
            </button>
            <button
              onClick={() => router.push("/contribute")}
              className="px-8 py-4 rounded-2xl glass-card text-white font-bold text-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex items-center gap-2"
            >
              <span>Contribute Heritage Entry</span>
              <span className="text-amber-400">✦</span>
            </button>
          </div>

          {/* Live Archive Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl mt-12 pt-12 border-t border-white/10">
            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-black text-amber-400 font-serif-accent">100%</span>
              <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Original Narratives</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-black text-amber-400 font-serif-accent">4</span>
              <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Regional Languages</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-black text-amber-400 font-serif-accent">GIS</span>
              <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Geographic Precision</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-black text-amber-400 font-serif-accent">NLP</span>
              <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Semantic Search</span>
            </div>
          </div>

        </div>
      </section>


      {/* SECTION 2: Mission & Core Value Proposition */}
      <section id="about" className="py-24 px-6 relative border-t border-white/5 bg-[#08080c]">
        <div className="max-w-7xl mx-auto flex flex-col gap-16">
          
          <div className="text-center flex flex-col items-center gap-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Our Mission</span>
            <h2 className="text-3xl sm:text-5xl font-serif-accent font-normal text-white">
              Why Digital Cultural Preservation Matters
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
              Local traditions, sacred sites, and oral histories are vulnerable to time and urban changes. We bridge community memory with modern web technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="reveal-card glass-card p-8 rounded-3xl flex flex-col gap-5 relative overflow-hidden group">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🗺️
              </div>
              <h3 className="text-xl font-bold text-white">Geographic Grounding</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Every heritage site is connected to exact PostGIS map coordinates. Discover ancient pagodas, sacred lakes, and historical monuments right in your region.
              </p>
              <div className="mt-auto pt-4 text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                <span>Interactive Map Discovery</span>
                <span>→</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="reveal-card glass-card p-8 rounded-3xl flex flex-col gap-5 relative overflow-hidden group">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🗣️
              </div>
              <h3 className="text-xl font-bold text-white">Oral Traditions & Media</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Preserve oral storytelling, traditional music, 360° panoramas, and video documentations directly from community elders and local experts.
              </p>
              <div className="mt-auto pt-4 text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                <span>Community Narratives</span>
                <span>→</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="reveal-card glass-card p-8 rounded-3xl flex flex-col gap-5 relative overflow-hidden group">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🌐
              </div>
              <h3 className="text-xl font-bold text-white">Multilingual Preservation</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Documented in original scripts (Nepali, Maithili, Bhojpuri) and seamlessly accessible in English with AI translation and community verification.
              </p>
              <div className="mt-auto pt-4 text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                <span>NLP Translation Pipeline</span>
                <span>→</span>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* SECTION 3: Featured Heritage Showcase (With AI-Generated Images) */}
      <section className="py-28 px-6 relative border-t border-white/5 bg-[#07070a]">
        <div className="max-w-7xl mx-auto flex flex-col gap-16">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Archive Spotlight</span>
              <h2 className="text-3xl sm:text-5xl font-serif-accent font-normal text-white">
                Living Heritage Showcase
              </h2>
            </div>
            <button
              onClick={() => router.push("/discover")}
              className="self-start md:self-auto px-6 py-3 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold transition-all"
            >
              View Full Archive Catalogue &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Item 1 */}
            <div className="reveal-card glass-card rounded-3xl overflow-hidden flex flex-col group cursor-pointer" onClick={() => router.push("/discover")}>
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src="/hero_heritage_nepal.png"
                  alt="Nyatapola Temple Bhaktapur"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090d] via-transparent to-transparent opacity-90" />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-amber-400 uppercase tracking-wider border border-white/10">
                  Temple • 1702 AD
                </span>
              </div>
              <div className="p-6 flex flex-col gap-2">
                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                  Nyatapola Five-Storey Pagoda
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-2">
                  Bhaktapur's iconic 18th-century pagoda standing 30 meters tall with intricate Newari woodcarvings and stone guardians.
                </p>
                <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono mt-3 border-t border-white/5 pt-3">
                  <span>Bhaktapur Durbar Square</span>
                  <span className="text-emerald-400 font-bold">VERIFIED</span>
                </div>
              </div>
            </div>

            {/* Item 2 */}
            <div className="reveal-card glass-card rounded-3xl overflow-hidden flex flex-col group cursor-pointer" onClick={() => router.push("/discover")}>
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src="/janaki_mandir_janakpur.png"
                  alt="Janaki Mandir Janakpur"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090d] via-transparent to-transparent opacity-90" />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-amber-400 uppercase tracking-wider border border-white/10">
                  Monument • Mithila
                </span>
              </div>
              <div className="p-6 flex flex-col gap-2">
                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                  Janaki Mandir Palace
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-2">
                  Grand bright-white three-storey Hindu palace architecture in Janakpurdham celebrating Mithila culture and traditions.
                </p>
                <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono mt-3 border-t border-white/5 pt-3">
                  <span>Janakpurdham, Dhanusha</span>
                  <span className="text-emerald-400 font-bold">VERIFIED</span>
                </div>
              </div>
            </div>

            {/* Item 3 */}
            <div className="reveal-card glass-card rounded-3xl overflow-hidden flex flex-col group cursor-pointer" onClick={() => router.push("/discover")}>
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src="/mithila_cultural_art.png"
                  alt="Mithila Folk Painting Art"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090d] via-transparent to-transparent opacity-90" />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-amber-400 uppercase tracking-wider border border-white/10">
                  Tradition • Folk Art
                </span>
              </div>
              <div className="p-6 flex flex-col gap-2">
                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                  Mithila Wall Paintings & Art
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-2">
                  Ancient Madhubani and Mithila folk wall painting art depicting festivals, nature, and sacred rituals in natural pigments.
                </p>
                <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono mt-3 border-t border-white/5 pt-3">
                  <span>Terai-Madhesh Region</span>
                  <span className="text-emerald-400 font-bold">VERIFIED</span>
                </div>
              </div>
            </div>

            {/* Item 4 */}
            <div className="reveal-card glass-card rounded-3xl overflow-hidden flex flex-col group cursor-pointer" onClick={() => router.push("/discover")}>
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src="/traditional_pottery_craft.png"
                  alt="Traditional Pottery Craft"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090d] via-transparent to-transparent opacity-90" />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-amber-400 uppercase tracking-wider border border-white/10">
                  Intangible Craft
                </span>
              </div>
              <div className="p-6 flex flex-col gap-2">
                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                  Terracotta Pottery Crafting
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-2">
                  Centuries-old technique of spinning clay oil lamps (*Pala*) and traditional terracotta vessels in pottery square.
                </p>
                <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono mt-3 border-t border-white/5 pt-3">
                  <span>Pottery Square, Bhaktapur</span>
                  <span className="text-emerald-400 font-bold">VERIFIED</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* SECTION 4: Multilingual Dual Typography & Narrative Showcase */}
      <section className="py-24 px-6 relative border-t border-white/5 bg-[#09090e]">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          
          <div className="text-center flex flex-col items-center gap-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Preserving Original Context</span>
            <h2 className="text-3xl sm:text-5xl font-serif-accent font-normal text-white">
              Dual-Language Narrative Preservation
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
              Original stories are preserved in their native scripts (Nepali, Maithili, Bhojpuri) and translated into English for global discovery.
            </p>

            {/* Language Tab Selector */}
            <div className="flex gap-2 p-1.5 rounded-2xl bg-black/50 border border-white/10 mt-4">
              <button
                onClick={() => setActiveStoryLang("ne")}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeStoryLang === "ne"
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                🇳🇵 नेपाली (Nepali)
              </button>
              <button
                onClick={() => setActiveStoryLang("mai")}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeStoryLang === "mai"
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                🪷 मैथिली (Maithili)
              </button>
              <button
                onClick={() => setActiveStoryLang("en")}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeStoryLang === "en"
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                🌐 English Translation
              </button>
            </div>
          </div>

          {/* Side-by-side Dual Column Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Box: Devanagari Original */}
            <div className="glass-card p-8 rounded-3xl flex flex-col gap-4 border-amber-500/20 relative">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-xs font-devanagari font-bold text-amber-400">
                  {activeStoryLang === "mai" ? "मूल कथा (मैथिली)" : "मूल इतिहास (नेपाली)"}
                </span>
                <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-widest">
                  Original Source
                </span>
              </div>

              {activeStoryLang === "mai" ? (
                <div className="space-y-3 font-devanagari">
                  <h3 className="text-2xl font-bold text-white leading-snug">
                    जानकी मन्दिरक ऐतिहासिक आ सांस्कृतिक महत्व
                  </h3>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    जनकपुरधाम स्थित जानकी मन्दिर मैथिल संस्कृति आ परम्पराक एक मुख्य केन्द्र थिक। ई मन्दिर सन् १९११ मे रानी वृषभानु देवी द्वारा निर्माण कराओल गेल छल। मन्दिरक वास्तुकला मे राजपूत आ मुगल शैलीक अनुपम संगम देखब लेल भेटैत अछि।
                  </p>
                </div>
              ) : (
                <div className="space-y-3 font-devanagari">
                  <h3 className="text-2xl font-bold text-white leading-snug">
                    न्यातपोल मन्दिरको निर्माण र जात्रा परम्परा
                  </h3>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    भक्तपुरको दरबार क्षेत्रमा रहेको न्यातपोल मन्दिर राजा भूपतिन्द्र मल्लद्वारा वि.सं. १७५९ (सन् १७०२) मा निर्माण गरिएको हो। यो पाँच तले प्यागोडा शैलीको मन्दिर शिखरसम्मै विशेष इन्जिनियरिङ कौशलका साथ निर्माण गरिएको छ।
                  </p>
                </div>
              )}
            </div>

            {/* Right Box: English Translation */}
            <div className="glass-card p-8 rounded-3xl flex flex-col gap-4 relative">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  English Narrative Translation
                </span>
                <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                  Community Verified
                </span>
              </div>

              {activeStoryLang === "mai" ? (
                <div className="space-y-3 font-sans">
                  <h3 className="text-xl font-bold text-white leading-snug">
                    Historical & Cultural Significance of Janaki Mandir
                  </h3>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    Located in Janakpurdham, Janaki Mandir stands as a central pillar of Maithil heritage and art. Built in 1911 by Queen Vrishabhanu of Tikamgarh, the temple blends Rajput and Mughal architectural motifs into a pristine white palace.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 font-sans">
                  <h3 className="text-xl font-bold text-white leading-snug">
                    Nyatapola Temple Construction & Jatra Customs
                  </h3>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    Situated in Bhaktapur Durbar Square, the five-storey Nyatapola pagoda was commissioned in 1702 AD by King Bhupatindra Malla. Its structural craftsmanship features guardian sculptures and traditional Newari wood carving.
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>
      </section>


      {/* SECTION 5: AI & Knowledge Graph Architecture Visualizer */}
      <section className="py-28 px-6 relative border-t border-white/5 bg-[#07070a]">
        <div className="max-w-7xl mx-auto flex flex-col gap-16">
          
          <div className="text-center flex flex-col items-center gap-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Technology Stack</span>
            <h2 className="text-3xl sm:text-5xl font-serif-accent font-normal text-white">
              AI Vector Discovery & Knowledge Graph
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
              Connecting sites, festivals, oral traditions, and local communities into a structured, searchable cultural network.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left 4 cols: Features list */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="p-6 rounded-2xl glass-card border-l-4 border-l-amber-500 flex flex-col gap-2">
                <h4 className="text-base font-bold text-white">384-D Vector Embeddings</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Queries are converted into dense vector representations to support concept-based semantic search even when exact keywords differ across languages.
                </p>
              </div>

              <div className="p-6 rounded-2xl glass-card border-l-4 border-l-orange-500 flex flex-col gap-2">
                <h4 className="text-base font-bold text-white">PostGIS Spatial Queries</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Geographic boundary filtering and proximity duplicate detection ensure heritage entries stay accurate to within 150 meters.
                </p>
              </div>

              <div className="p-6 rounded-2xl glass-card border-l-4 border-l-emerald-500 flex flex-col gap-2">
                <h4 className="text-base font-bold text-white">Community Verification Flow</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Submissions enter a moderation queue where verified community members vote, suggest edits, and log change revisions.
                </p>
              </div>
            </div>

            {/* Right 7 cols: Graph Visualizer Canvas */}
            <div className="lg:col-span-7 p-8 rounded-3xl glass-panel border border-white/10 flex flex-col gap-6 relative overflow-hidden">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <span>🕸️</span> Cultural Entity Graph Visualization
                </span>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  LIVE MODEL
                </span>
              </div>

              {/* Mock Graph Node Diagram */}
              <div className="relative w-full h-[320px] bg-[#050508] rounded-2xl border border-white/5 p-6 flex items-center justify-center overflow-hidden">
                
                {/* Connecting SVGs */}
                <svg className="absolute inset-0 w-full h-full stroke-white/10" strokeWidth="1.5" strokeDasharray="4 4">
                  <line x1="20%" y1="50%" x2="50%" y2="25%" />
                  <line x1="50%" y1="25%" x2="80%" y2="50%" />
                  <line x1="50%" y1="25%" x2="50%" y2="75%" />
                  <line x1="20%" y1="50%" x2="50%" y2="75%" />
                  <line x1="80%" y1="50%" x2="50%" y2="75%" />
                </svg>

                {/* Node 1: Nyatapola (Center Top) */}
                <div className="absolute top-[18%] left-[42%] p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/10 animate-bounce" style={{ animationDuration: "4s" }}>
                  <span>🛕</span> Nyatapola Pagoda
                </div>

                {/* Node 2: Bisket Jatra (Left Center) */}
                <div className="absolute top-[45%] left-[8%] p-3.5 rounded-2xl bg-purple-500/15 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center gap-2">
                  <span>🌊</span> Bisket Jatra Festival
                </div>

                {/* Node 3: Newari Woodcraft (Right Center) */}
                <div className="absolute top-[45%] right-[8%] p-3.5 rounded-2xl bg-teal-500/15 border border-teal-500/40 text-teal-300 text-xs font-bold flex items-center gap-2">
                  <span>🎨</span> Woodcarving Craft
                </div>

                {/* Node 4: Bhaktapur Community (Bottom Center) */}
                <div className="absolute bottom-[18%] left-[40%] p-3.5 rounded-2xl bg-sky-500/15 border border-sky-500/40 text-sky-300 text-xs font-bold flex items-center gap-2">
                  <span>👥</span> Newar Community
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>


      {/* SECTION 6: Geographical Heritage Map Explorer */}
      <section className="py-24 px-6 relative border-t border-white/5 bg-[#08080c]">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Interactive GIS Discovery</span>
              <h2 className="text-3xl sm:text-5xl font-serif-accent font-normal text-white">
                Geographical Heritage Map Explorer
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
                Locate monuments, festival routes, and sacred heritage across Nepal with precise PostGIS coordinates.
              </p>
            </div>
            <button
              onClick={() => router.push("/discover")}
              className="px-6 py-3 rounded-xl bg-amber-500 text-black text-xs font-extrabold hover:scale-105 transition-all self-start md:self-auto"
            >
              Open Full-Screen Explorer &rarr;
            </button>
          </div>

          {/* Real Leaflet Map Container */}
          <div className="w-full h-[480px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
            <InteractiveMap
              sites={[
                {
                  id: 1,
                  name: "Nyatapola Temple",
                  category: "temple",
                  latitude: 27.6715,
                  longitude: 85.4298,
                  status: "approved",
                  creator_id: 1,
                  media: [{ id: 1, media_url: "/hero_heritage_nepal.png", media_type: "image" }],
                  stories: [{ id: 1, language: "en", title: "Nyatapola", content: "Iconic five-storey pagoda in Bhaktapur Durbar Square built in 1702 AD." }]
                },
                {
                  id: 2,
                  name: "Janaki Mandir Palace",
                  category: "monument",
                  latitude: 26.7297,
                  longitude: 85.9262,
                  status: "approved",
                  creator_id: 1,
                  media: [{ id: 2, media_url: "/janaki_mandir_janakpur.png", media_type: "image" }],
                  stories: [{ id: 2, language: "en", title: "Janaki Mandir", content: "Grand bright-white three-storey Hindu temple in Janakpurdham celebrating Mithila architecture." }]
                },
                {
                  id: 3,
                  name: "Lumbini Sacred Garden",
                  category: "historical_site",
                  latitude: 27.4800,
                  longitude: 83.2750,
                  status: "approved",
                  creator_id: 1,
                  media: [{ id: 3, media_url: "/hero_heritage_nepal.png", media_type: "image" }],
                  stories: [{ id: 3, language: "en", title: "Lumbini", content: "UNESCO World Heritage Site recognized as the birthplace of Siddhartha Gautama (Lord Buddha)." }]
                },
                {
                  id: 4,
                  name: "Terracotta Pottery Square",
                  category: "traditional_practice",
                  latitude: 27.6722,
                  longitude: 85.4255,
                  status: "approved",
                  creator_id: 1,
                  media: [{ id: 4, media_url: "/traditional_pottery_craft.png", media_type: "image" }],
                  stories: [{ id: 4, language: "en", title: "Pottery Square", content: "Centuries-old technique of spinning clay oil lamps and terracotta vessels." }]
                }
              ]}
              height="100%"
            />
          </div>

        </div>
      </section>


      {/* SECTION 7: Contributor Reputation & Community Trust */}
      <section className="py-28 px-6 relative border-t border-white/5 bg-[#07070a]">
        <div className="max-w-7xl mx-auto flex flex-col gap-16">
          
          <div className="text-center flex flex-col items-center gap-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Community Verification</span>
            <h2 className="text-3xl sm:text-5xl font-serif-accent font-normal text-white">
              Contributor Reputation Tiers
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
              Earn reputation points by contributing authentic heritage entries (+5 rep) and participating in verification votes (+1 rep).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Tier 1 */}
            <div className="p-6 rounded-3xl glass-card flex flex-col gap-3 border-blue-500/20">
              <span className="text-3xl">🌱</span>
              <h3 className="text-lg font-bold text-blue-400">Local Explorer</h3>
              <p className="text-[10px] text-zinc-500 font-mono">0 - 9 Reputation Points</p>
              <p className="text-xs text-zinc-400 leading-relaxed mt-2">
                New community members discovering heritage records and submitting initial site suggestions.
              </p>
            </div>

            {/* Tier 2 */}
            <div className="p-6 rounded-3xl glass-card flex flex-col gap-3 border-amber-500/20">
              <span className="text-3xl">📜</span>
              <h3 className="text-lg font-bold text-amber-400">Active Contributor</h3>
              <p className="text-[10px] text-zinc-500 font-mono">10 - 24 Reputation Points</p>
              <p className="text-xs text-zinc-400 leading-relaxed mt-2">
                Members who have submitted approved heritage entries and enriched story descriptions.
              </p>
            </div>

            {/* Tier 3 */}
            <div className="p-6 rounded-3xl glass-card flex flex-col gap-3 border-emerald-500/20">
              <span className="text-3xl">🛡️</span>
              <h3 className="text-lg font-bold text-emerald-400">Trusted Verifier</h3>
              <p className="text-[10px] text-zinc-500 font-mono">25 - 49 Reputation Points</p>
              <p className="text-xs text-zinc-400 leading-relaxed mt-2">
                Experienced reviewers who regularly verify local accuracy, coordinates, and festival dates.
              </p>
            </div>

            {/* Tier 4 */}
            <div className="p-6 rounded-3xl glass-card flex flex-col gap-3 border-purple-500/20">
              <span className="text-3xl">👑</span>
              <h3 className="text-lg font-bold text-purple-400">Elder Preserver</h3>
              <p className="text-[10px] text-zinc-500 font-mono">50+ Reputation Points</p>
              <p className="text-xs text-zinc-400 leading-relaxed mt-2">
                Top heritage guardians leading community verification and reviewing translation edits.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* SECTION 8: Comprehensive Modern Footer */}
      <footer className="border-t border-white/10 bg-[#040407] pt-20 pb-12 px-6 relative">
        <div className="max-w-7xl mx-auto flex flex-col gap-16">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            
            {/* Col 1: Brand Info */}
            <div className="md:col-span-5 flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center font-black text-black text-lg">
                  ने
                </div>
                <span className="font-extrabold text-lg text-gradient-gold">
                  Cultural Heritage Archive
                </span>
              </div>
              
              <p className="text-xs text-zinc-400 leading-relaxed max-w-md">
                A community-driven digital preservation platform connecting local knowledge, oral traditions, multilingual translation, and PostGIS maps.
              </p>

              {/* Devanagari Slogan */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 max-w-md font-devanagari">
                <p className="text-xs text-amber-300/90 italic leading-relaxed">
                  "जो इतिहास बिर्सन्छ, उसले भविष्य निर्माण गर्न सक्दैन।"
                </p>
                <p className="text-[10px] text-zinc-500 font-sans mt-1">
                  — Preserving the past to inspire the future.
                </p>
              </div>
            </div>

            {/* Col 2: Navigation Links */}
            <div className="md:col-span-2 flex flex-col gap-4 text-xs">
              <span className="font-bold text-white uppercase tracking-widest">Navigation</span>
              <a href="/discover" className="text-zinc-400 hover:text-amber-400 transition-colors">Discover Archive</a>
              <a href="/contribute" className="text-zinc-400 hover:text-amber-400 transition-colors">Submit Heritage</a>
              <a href="/education" className="text-zinc-400 hover:text-amber-400 transition-colors">Education Portal</a>
              <a href="/moderation" className="text-zinc-400 hover:text-amber-400 transition-colors">Moderation Queue</a>
            </div>

            {/* Col 3: Languages Supported */}
            <div className="md:col-span-2 flex flex-col gap-4 text-xs">
              <span className="font-bold text-white uppercase tracking-widest">Languages</span>
              <span className="text-zinc-400">🇳🇵 नेपाली (Nepali)</span>
              <span className="text-zinc-400">🪷 मैथिली (Maithili)</span>
              <span className="text-zinc-400">🏺 भोजपुरी (Bhojpuri)</span>
              <span className="text-zinc-400">🌐 English</span>
            </div>

            {/* Col 4: Platform Stack */}
            <div className="md:col-span-3 flex flex-col gap-4 text-xs">
              <span className="font-bold text-white uppercase tracking-widest">Tech Architecture</span>
              <span className="text-zinc-400">FastAPI & Python 3.12 Backend</span>
              <span className="text-zinc-400">PostgreSQL + PostGIS Database</span>
              <span className="text-zinc-400">Next.js 16 + TypeScript + Tailwind</span>
              <span className="text-zinc-400">Lenis + GSAP ScrollTrigger</span>
            </div>

          </div>

          {/* Bottom Copyright & Legal Line */}
          <div className="flex flex-col sm:flex-row justify-between items-center border-t border-white/5 pt-8 text-[11px] text-zinc-500 font-mono gap-4">
            <p>© 2026 Cultural Heritage Archive. Built under Open Community Preservation Principles.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-amber-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-amber-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-amber-400 transition-colors">Open Data API</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
