"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import InteractiveMap from "@/components/InteractiveMap";
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
  const [latitude, setLatitude] = useState(27.7172); // Kathmandu default
  const [longitude, setLongitude] = useState(85.3240);
  const [storyLang, setStoryLang] = useState("en");
  const [storyTitle, setStoryTitle] = useState("");
  const [storyContent, setStoryContent] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // AI & Discovery States
  const [suggestingCategory, setSuggestingCategory] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const categories = [
    { value: "temple", label: "Temple 🏮" },
    { value: "monument", label: "Monument 🏛️" },
    { value: "festival", label: "Festival 🌊" },
    { value: "tradition", label: "Oral Tradition 🗣️" },
    { value: "architecture", label: "Architecture 🧱" },
    { value: "natural", label: "Natural Heritage 🌳" },
    { value: "history", label: "Historical Site 📜" },
  ];

  const languages = [
    { code: "en", label: "English" },
    { code: "ne", label: "Nepali (नेपाली)" },
    { code: "mai", label: "Maithili (मैथिली)" },
    { code: "bho", label: "Bhojpuri (भोजपुरी)" },
  ];

  // Auth Guard: Verify user is logged in
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

  // Handle map canvas clicks to pick coordinates
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0 to 1
    const y = (e.clientY - rect.top) / rect.height; // 0 to 1

    // Map x, y ratios to Nepal geographic bounds
    // Lng: 80.0 to 88.5
    // Lat: 26.0 to 30.5
    const pickedLng = 80.0 + x * 8.5;
    const pickedLat = 30.5 - y * 4.5; // Top of canvas is North (higher lat)

    setLatitude(parseFloat(pickedLat.toFixed(5)));
    setLongitude(parseFloat(pickedLng.toFixed(5)));
  };

  const handleSuggestCategory = async () => {
    if (!storyTitle.trim() || !storyContent.trim()) {
      alert("Please enter a story title and description content first to analyze category keywords.");
      return;
    }
    setSuggestingCategory(true);
    try {
      const res = await apiFetch("/heritage/suggest-category", {
        method: "POST",
        body: JSON.stringify({ title: storyTitle, content: storyContent }),
      });
      if (res && res.category) {
        setCategory(res.category);
      }
    } catch (err) {
      console.error("AI Category suggestion failed:", err);
    } finally {
      setSuggestingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, force: boolean = false) => {
    if (e) e.preventDefault();
    setError(null);
    setDuplicateWarning(null);
    setLoading(true);

    try {
      const payload = {
        name,
        category,
        latitude,
        longitude,
        initial_story: {
          language: storyLang,
          title: storyTitle,
          content: storyContent,
        },
      };

      if (!force) {
        // Run duplicate detection check
        const checkRes = await apiFetch("/heritage/check-duplicate", {
          method: "POST",
          body: JSON.stringify({
            title: storyTitle,
            content: storyContent,
            latitude,
            longitude,
          }),
        });
        if (checkRes && checkRes.duplicate) {
          setDuplicateWarning(checkRes.reason);
          setLoading(false);
          return;
        }
      }

      await apiFetch("/heritage", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/discover");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to submit heritage record.");
    } finally {
      setLoading(false);
    }
  };

  // Convert current lat/lng to percentage offset for rendering marker pin on the map picker
  const getMarkerStyle = () => {
    const xPct = ((longitude - 80.0) / 8.5) * 100;
    const yPct = ((30.5 - latitude) / 4.5) * 100;
    return {
      left: `${Math.max(0, Math.min(100, xPct))}%`,
      top: `${Math.max(0, Math.min(100, yPct))}%`,
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
            <a href="/discover" className="hover:text-amber-400 transition-colors">Discover</a>
            <a href="/education" className="hover:text-amber-400 transition-colors">Education Portal</a>
            <span className="text-white">Contribute</span>
            
            {user && (user.role === "moderator" || user.role === "admin") && (
              <a href="/moderation" className="hover:text-amber-400 transition-colors">Moderation Queue</a>
            )}
          </div>

          <div className="text-xs text-right">
            {user && (
              <>
                <p className="font-bold text-zinc-350">@{user.username}</p>
                <p className="text-[10px] text-amber-500 font-semibold uppercase tracking-wider">{user.role}</p>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="max-w-5xl w-full mx-auto px-6 py-12 flex-1">
        <div className="mb-10 text-center md:text-left">
          <h2 className="text-3xl font-black bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Submit Cultural Heritage
          </h2>
          <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-semibold">
            Preserve history &bull; Local community submission
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-xs font-semibold text-emerald-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Submission completed successfully! The record is sent to the moderation queue.
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-xs font-semibold text-rose-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left panel: Site metadata & coordinates */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="p-6 rounded-2xl border border-white/5 bg-[#0b0b0f] flex flex-col gap-4">
              <h3 className="text-xs font-bold text-zinc-450 uppercase tracking-widest mb-2 border-b border-white/5 pb-2">Heritage Details</h3>
              
              <div className="flex flex-col gap-1">
                <label htmlFor="site-name" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Site Name</label>
                <input
                  id="site-name"
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Nyatapola Temple"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-zinc-650 focus:outline-none focus:border-amber-500/50 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label htmlFor="site-category" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Category</label>
                  <button
                    type="button"
                    onClick={handleSuggestCategory}
                    disabled={suggestingCategory}
                    className="text-[9px] font-black text-amber-500 hover:text-amber-400 uppercase flex items-center gap-1 tracking-wider"
                  >
                    <span>🪄</span> {suggestingCategory ? "suggesting..." : "AI Suggest Category"}
                  </button>
                </div>
                <select
                  id="site-category"
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-white/10 bg-[#0e0e13] text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Coordinates fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="site-latitude" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Latitude</label>
                  <input
                    id="site-latitude"
                    name="latitude"
                    type="number"
                    step="0.00001"
                    required
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                    className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="site-longitude" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Longitude</label>
                  <input
                    id="site-longitude"
                    name="longitude"
                    type="number"
                    step="0.00001"
                    required
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                    className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Real Leaflet Map Picker Section */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Map Coordinate Picker (Click or Drag Marker to Select)</span>
                <span className="text-[10px] font-mono text-amber-400">
                  {latitude.toFixed(5)}°, {longitude.toFixed(5)}°
                </span>
              </div>
              <InteractiveMap
                isPicker={true}
                pickerLat={latitude}
                pickerLng={longitude}
                onLocationPick={(lat, lng) => {
                  setLatitude(lat);
                  setLongitude(lng);
                }}
                height="260px"
              />
            </div>
          </div>

          {/* Right panel: Primary story details */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="p-6 rounded-2xl border border-white/5 bg-[#0b0b0f] flex flex-col gap-4">
              <h3 className="text-xs font-bold text-zinc-450 uppercase tracking-widest mb-2 border-b border-white/5 pb-2">Primary Story Context</h3>

              <div className="flex flex-col gap-1">
                <label htmlFor="story-language" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Language</label>
                <select
                  id="story-language"
                  name="storyLang"
                  value={storyLang}
                  onChange={(e) => setStoryLang(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-white/10 bg-[#0e0e13] text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all"
                >
                  {languages.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="story-title" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Story Title</label>
                <input
                  id="story-title"
                  name="storyTitle"
                  type="text"
                  required
                  placeholder="e.g. Historical Significance of the Pagoda"
                  value={storyTitle}
                  onChange={(e) => setStoryTitle(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-zinc-650 focus:outline-none focus:border-amber-500/50 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="story-content" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Historical & Cultural Context</label>
                <textarea
                  id="story-content"
                  name="storyContent"
                  required
                  rows={6}
                  placeholder="Describe the history, significance, cultural beliefs, or traditions associated with this heritage site..."
                  value={storyContent}
                  onChange={(e) => setStoryContent(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-zinc-650 focus:outline-none focus:border-amber-500/50 transition-all resize-none"
                />
              </div>
            </div>

            {duplicateWarning && (
              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-xs font-semibold text-rose-300 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-base">⚠️</span>
                  <div>
                    <p className="font-bold">Duplicate Entry Alert</p>
                    <p className="mt-0.5 font-medium text-zinc-300">{duplicateWarning}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setDuplicateWarning(null)}
                    className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 font-bold text-[10px] text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancel & Review
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, true)}
                    className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 font-bold text-[10px] text-white transition-colors"
                  >
                    Submit Anyway
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 font-bold text-sm text-black shadow-lg hover:shadow-orange-600/15 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  Submitting to Queue...
                </>
              ) : (
                "Submit Heritage Site"
              )}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}
