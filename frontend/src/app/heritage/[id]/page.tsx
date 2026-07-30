"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch, API_BASE_URL } from "@/lib/api";
import InteractiveTiltCard from "@/components/InteractiveTiltCard";
import ScrollReveal from "@/components/ScrollReveal";
import LanguageSelector from "@/components/LanguageSelector";
import CustomCursor from "@/components/CustomCursor";

interface Story {
  id: number;
  language: string;
  title: string;
  content: string;
  contributor_id: number;
  created_at: string;
  is_translation: boolean;
  translation_method: string;
  translation_status: string;
  original_story_id?: number | null;
}

interface Media {
  id: number;
  media_url: string;
  media_type: string;
  contributor_id: number;
}

interface HeritageSite {
  id: number;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  status: string;
  creator_id: number;
  created_at: string;
  updated_at: string;
  stories: Story[];
  media: Media[];
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

export default function HeritageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [site, setSite] = useState<HeritageSite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState("en");

  const languages = [
    { code: "ne", label: "नेपाली (Nepali)" },
    { code: "mai", label: "मैथिली (Maithili)" },
    { code: "bho", label: "भोजपुरी (Bhojpuri)" },
    { code: "en", label: "English" },
  ];

  useEffect(() => {
    const fetchSiteDetails = async () => {
      if (!id) return;
      try {
        const data = await apiFetch(`/heritage/${id}`);
        setSite(data);
        if (data.stories && data.stories.length > 0) {
          const hasSelected = data.stories.some((s: Story) => s.language === selectedLang);
          if (!hasSelected) {
            setSelectedLang(data.stories[0].language);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load heritage detail.");
      } finally {
        setLoading(false);
      }
    };

    fetchSiteDetails();
  }, [id]);

  const activeStory = site?.stories.find((s) => s.language === selectedLang) || site?.stories[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-[#f4f4f7] flex flex-col items-center justify-center gap-3">
        <span className="w-8 h-8 rounded-full border-2 border-[#c5a059] border-t-transparent animate-spin" />
        <span className="text-xs font-mono tracking-widest text-zinc-400 uppercase">Fetching Archival Record #{id}...</span>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="min-h-screen bg-[#09090b] text-[#f4f4f7] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <span className="text-4xl">🏛️</span>
        <h2 className="text-2xl font-normal text-white font-display">Catalogue Record Not Found</h2>
        <p className="text-xs text-zinc-400 font-mono">{error || "The requested heritage entry could not be retrieved."}</p>
        <button
          onClick={() => router.push("/discover")}
          className="px-5 py-2 bg-[#c5a059] text-black font-mono font-semibold text-xs uppercase tracking-wider rounded-lg"
        >
          Return to Catalogue
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f7] archive-grid-bg flex flex-col relative overflow-x-hidden">
      
      <CustomCursor />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#09090b]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
            <div className="w-9 h-9 rounded-full bg-[#c5a059] flex items-center justify-center font-bold text-black text-sm font-devanagari">
              ने
            </div>
            <div className="flex flex-col">
              <span className="font-display font-medium text-lg tracking-tight text-white uppercase">
                HERITAGE <span className="text-[#c5a059]">RECORD</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-mono tracking-wider -mt-1">
                REF: NE-HER-00{site.id}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSelector />
            <button
              onClick={() => router.push("/discover")}
              className="px-4 py-2 border border-white/10 hover:border-[#c5a059] text-xs font-mono text-zinc-300 hover:text-white transition-all rounded-lg"
            >
              ← Back to Catalogue
            </button>
          </div>
        </div>
      </header>

      {/* Record Content */}
      <main className="max-w-7xl w-full mx-auto px-6 py-10 space-y-10 z-20 relative">
        
        {/* Banner Section */}
        <ScrollReveal direction="up">
          <div className="bg-[#121216] border border-white/10 rounded-2xl p-6 md:p-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 font-mono text-xs text-[#c5a059]">
                <span className="px-2.5 py-0.5 rounded bg-[#c5a059]/10 border border-[#c5a059]/30 text-[10px] font-bold uppercase">
                  {site.category}
                </span>
                <span>• CATALOGUE ENTRY #{site.id}</span>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase">
                STATUS: {site.status}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-normal text-white font-display">
              {site.name}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-xs font-mono text-zinc-400 pt-2">
              <span>📍 Coordinates: {site.latitude.toFixed(4)}° N, {site.longitude.toFixed(4)}° E</span>
              <span>📅 Recorded: {new Date(site.created_at).toLocaleDateString()}</span>
              <span>🏛️ Guthi Verified</span>
            </div>
          </div>
        </ScrollReveal>

        {/* Media & Manuscript Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Media Gallery */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xs font-mono tracking-widest text-[#c5a059] uppercase font-semibold">
              ARCHIVAL VISUAL RECORD ATTACHMENTS
            </h3>
            {site.media && site.media.length > 0 ? (
              <div className="space-y-4">
                {site.media.map((item) => {
                  const mediaUrl = item.media_url.startsWith("http") ? item.media_url : `${API_BASE_URL}${item.media_url}`;
                  if (item.media_type === "audio") {
                    return (
                      <div key={item.id} className="rounded-2xl p-4 border border-[#c5a059]/30 bg-[#121216]">
                        <div className="flex items-center gap-2 text-xs font-mono text-[#c5a059] mb-2 font-bold">
                          <span>🎵</span>
                          <span>TRADITIONAL AUDIO ARCHIVE RECORD</span>
                        </div>
                        <audio controls src={mediaUrl} className="w-full filter invert" />
                      </div>
                    );
                  } else if (item.media_type === "video") {
                    return (
                      <div key={item.id} className="rounded-2xl overflow-hidden border border-white/10 bg-[#121216]">
                        <video controls src={mediaUrl} className="w-full h-72 object-cover" />
                      </div>
                    );
                  }
                  return (
                    <div key={item.id} className="rounded-2xl overflow-hidden border border-white/10 bg-[#121216]">
                      <img src={mediaUrl} alt={site.name} className="w-full h-72 object-cover" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-64 rounded-2xl border border-dashed border-zinc-800 flex flex-col items-center justify-center text-zinc-500 gap-2">
                <span className="text-3xl">🖼️</span>
                <span className="text-xs font-mono uppercase">No photographic attachments uploaded</span>
              </div>
            )}
          </div>

          {/* Right Text Story Translation */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#121216] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
              
              {/* Language Switcher */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-xs font-mono tracking-widest text-[#c5a059] uppercase font-semibold">
                  HISTORICAL NARRATIVE &amp; TRANSLATIONS
                </span>
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#09090b] border border-white/10">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLang(lang.code)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                        selectedLang === lang.code ? "bg-[#c5a059] text-black font-semibold" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {lang.code.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {activeStory ? (
                <div className="space-y-4">
                  <h4 className="text-2xl font-normal text-white font-display">
                    {activeStory.title}
                  </h4>
                  <p className="text-sm text-zinc-300 leading-relaxed font-devanagari whitespace-pre-line">
                    {activeStory.content}
                  </p>
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                    <span>TRANSLATION METHOD: {activeStory.translation_method || "ORIGINAL COMMUNITY ENTRY"}</span>
                    <span>STATUS: {activeStory.translation_status || "VERIFIED"}</span>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-zinc-500 font-mono text-xs">
                  No translation available in selected language ({selectedLang.toUpperCase()}).
                </div>
              )}

            </div>
          </div>

        </div>

      </main>

    </div>
  );
}
