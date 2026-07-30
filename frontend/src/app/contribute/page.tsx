"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import InteractiveMap from "@/components/InteractiveMap";
import ScrollReveal from "@/components/ScrollReveal";
import CustomCursor from "@/components/CustomCursor";
import { apiFetch } from "@/lib/api";

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

export default function ContributePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState("temple");
  const [latitude, setLatitude] = useState(27.7172);
  const [longitude, setLongitude] = useState(85.3240);
  const [storyLang, setStoryLang] = useState("en");
  const [storyTitle, setStoryTitle] = useState("");
  const [storyContent, setStoryContent] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const categories = [
    { value: "temple", label: "Temple" },
    { value: "monument", label: "Monument" },
    { value: "festival", label: "Festival" },
    { value: "tradition", label: "Oral Tradition" },
    { value: "architecture", label: "Architecture" },
    { value: "natural", label: "Natural Heritage" },
    { value: "history", label: "Historical Site" },
  ];

  const languages = [
    { code: "en", label: "English" },
    { code: "ne", label: "Nepali (नेपाली)" },
    { code: "mai", label: "Maithili (मैथिली)" },
    { code: "bho", label: "Bhojpuri (भोजपुरी)" },
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }
      const decoded = decodeToken(token);
      if (decoded) {
        setUser({ username: decoded.username, role: decoded.role });
      } else {
        router.push("/auth/login");
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        name,
        category,
        latitude,
        longitude,
        stories: [
          {
            language: storyLang,
            title: storyTitle,
            content: storyContent,
          },
        ],
      };

      await apiFetch("/heritage", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSuccess(true);
      setName("");
      setStoryTitle("");
      setStoryContent("");
      setTimeout(() => {
        router.push("/discover");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to submit heritage site.");
    } finally {
      setLoading(false);
    }
  };

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
                CONTRIBUTE <span className="text-[#c5a059]">ARCHIVE</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-devanagari tracking-wider -mt-1">
                अभिलेख योगदान तथा दर्ता
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-zinc-400">ARCHIVIST: @{user?.username}</span>
            <button
              onClick={() => router.push("/discover")}
              className="px-3.5 py-1.5 border border-white/10 hover:border-[#c5a059] text-xs font-mono text-zinc-300 hover:text-white transition-all rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </header>

      {/* Main Submission Form */}
      <main className="max-w-4xl w-full mx-auto px-6 py-12 z-20 relative">
        <ScrollReveal direction="up">
          <div className="bg-[#121216] border border-white/10 rounded-2xl p-6 md:p-10 space-y-8 shadow-2xl">
            
            {/* Header Banner */}
            <div className="border-b border-white/10 pb-6 space-y-2">
              <span className="text-[11px] font-mono tracking-widest text-[#c5a059] uppercase font-semibold">
                SUBMISSION ENTRY FORM • NEW HERITAGE RECORD
              </span>
              <h1 className="text-3xl md:text-4xl font-normal text-white font-display">
                Document Local Heritage Site or Oral History
              </h1>
              <p className="text-xs text-zinc-400 font-body">
                Submit accurate historical information, folklore traditions, and spatial GPS coordinates to preserve them in the digital archive.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 font-mono">
                ⚠ {error}
              </div>
            )}

            {success && (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 font-mono">
                ✓ Entry submitted successfully! Redirecting to catalogue...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Step 1: Site Metadata */}
              <div className="space-y-4">
                <span className="text-xs font-mono text-[#c5a059] uppercase font-semibold tracking-wider">
                  01. Basic Site Information
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-zinc-300">Site Name / Monument Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nyatapola Pagoda"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#09090b] border border-white/10 focus:border-[#c5a059] outline-none text-xs text-white p-3 rounded-xl font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-zinc-300">Category Classification *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[#09090b] border border-white/10 focus:border-[#c5a059] outline-none text-xs text-white p-3 rounded-xl font-mono"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2: Location Map Picker */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <span className="text-xs font-mono text-[#c5a059] uppercase font-semibold tracking-wider">
                  02. Spatial Coordinates (Click on Map to Pick)
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-zinc-400">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      readOnly
                      value={latitude}
                      className="w-full bg-[#09090b] border border-white/10 text-xs text-zinc-400 p-3 rounded-xl font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-zinc-400">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      readOnly
                      value={longitude}
                      className="w-full bg-[#09090b] border border-white/10 text-xs text-zinc-400 p-3 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div className="w-full h-80 rounded-2xl overflow-hidden border border-white/10">
                  <InteractiveMap
                    isPicker
                    pickerLat={latitude}
                    pickerLng={longitude}
                    onLocationPick={(lat, lng) => {
                      setLatitude(lat);
                      setLongitude(lng);
                    }}
                    height="100%"
                  />
                </div>
              </div>

              {/* Step 3: Story & Narrative */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <span className="text-xs font-mono text-[#c5a059] uppercase font-semibold tracking-wider">
                  03. Historical Context &amp; Folklore Narrative
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-zinc-300">Narrative Language *</label>
                    <select
                      value={storyLang}
                      onChange={(e) => setStoryLang(e.target.value)}
                      className="w-full bg-[#09090b] border border-white/10 focus:border-[#c5a059] outline-none text-xs text-white p-3 rounded-xl font-mono"
                    >
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-zinc-300">Story Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="Title of historical story or ritual lore"
                      value={storyTitle}
                      onChange={(e) => setStoryTitle(e.target.value)}
                      className="w-full bg-[#09090b] border border-white/10 focus:border-[#c5a059] outline-none text-xs text-white p-3 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-zinc-300">Detailed Cultural Narrative &amp; Significance *</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Provide detailed historical significance, construction era, ritual lore, or community traditions associated with this site..."
                    value={storyContent}
                    onChange={(e) => setStoryContent(e.target.value)}
                    className="w-full bg-[#09090b] border border-white/10 focus:border-[#c5a059] outline-none text-xs text-white p-3 rounded-xl font-body leading-relaxed"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-white/10 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-[#c5a059] hover:bg-[#d4af37] disabled:opacity-50 text-black font-mono font-semibold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all"
                >
                  {loading ? "Submitting Record..." : "Submit to Archive Audit Queue →"}
                </button>
              </div>

            </form>

          </div>
        </ScrollReveal>
      </main>

    </div>
  );
}
