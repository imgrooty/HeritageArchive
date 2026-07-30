"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import InteractiveTiltCard from "@/components/InteractiveTiltCard";
import ScrollReveal from "@/components/ScrollReveal";
import CustomCursor from "@/components/CustomCursor";

interface Story {
  id: number;
  language: string;
  title: string;
  content: string;
}

interface HeritageSite {
  id: number;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  status: string;
  creator_id: number;
  stories: Story[];
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

export default function ModerationPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [queue, setQueue] = useState<HeritageSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedSite, setSelectedSite] = useState<HeritageSite | null>(null);
  const [notes, setNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }
      const decoded = decodeToken(token);
      if (decoded && (decoded.role === "moderator" || decoded.role === "admin")) {
        setUser({ username: decoded.username, role: decoded.role });
      } else {
        router.push("/discover");
      }
    }
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/moderation/queue");
      setQueue(data);
      if (data.length > 0) {
        setSelectedSite(data[0]);
      } else {
        setSelectedSite(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load moderation queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchQueue();
    }
  }, [user]);

  const handleAction = async (status: "approved" | "rejected" | "changes_requested") => {
    if (!selectedSite) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await apiFetch(`/moderation/${selectedSite.id}/review`, {
        method: "POST",
        body: JSON.stringify({
          status,
          notes,
        }),
      });

      setNotes("");
      fetchQueue();
    } catch (err: any) {
      setActionError(err.message || "Failed to process review action.");
    } finally {
      setActionLoading(false);
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
                MODERATION <span className="text-[#c5a059]">QUEUE</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-devanagari tracking-wider -mt-1">
                अनुमोदन तथा गुणस्तर नियन्त्रण
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-zinc-400">AUDITOR: @{user?.username} ({user?.role})</span>
            <button
              onClick={() => router.push("/discover")}
              className="px-3.5 py-1.5 border border-white/10 hover:border-[#c5a059] text-xs font-mono text-zinc-300 hover:text-white transition-all rounded-lg"
            >
              Exit Queue
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 z-20 relative">
        
        {/* Left Column: Pending Queue List */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-[#121216] border border-white/10 rounded-2xl p-5 space-y-2">
            <span className="text-[11px] font-mono tracking-widest text-[#c5a059] uppercase font-semibold">
              SUBMISSION AUDIT QUEUE • {queue.length} PENDING
            </span>
            <h2 className="text-xl font-normal text-white font-display">Review Submissions</h2>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-zinc-500 font-mono text-xs">
                <span className="w-5 h-5 border-2 border-[#c5a059] border-t-transparent rounded-full animate-spin mr-2" />
                Loading pending queue...
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 font-mono">{error}</div>
            ) : queue.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl p-6 font-mono text-xs">
                ✓ Moderation queue empty. All submissions reviewed!
              </div>
            ) : (
              queue.map((site) => (
                <div
                  key={site.id}
                  onClick={() => setSelectedSite(site)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedSite?.id === site.id
                      ? "bg-zinc-900 border-[#c5a059] text-white"
                      : "bg-[#121216] border-white/10 text-zinc-400 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-[#c5a059] font-bold uppercase">{site.category}</span>
                    <span>REF-{site.id}</span>
                  </div>
                  <h4 className="text-sm font-medium text-white font-display">{site.name}</h4>
                  <p className="text-[11px] font-mono text-zinc-500 mt-1">
                    Coords: {site.latitude.toFixed(3)}°, {site.longitude.toFixed(3)}°
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Selected Record Review Detail */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {selectedSite ? (
            <div className="bg-[#121216] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="border-b border-white/10 pb-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono tracking-widest text-[#c5a059] uppercase font-semibold">
                    RECORD VERIFICATION AUDIT
                  </span>
                  <h3 className="text-2xl font-normal text-white font-display mt-0.5">{selectedSite.name}</h3>
                </div>
                <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold rounded-lg uppercase">
                  {selectedSite.status}
                </span>
              </div>

              {/* Story Content */}
              {selectedSite.stories && selectedSite.stories.length > 0 && (
                <div className="space-y-3 bg-[#09090b] border border-white/10 p-5 rounded-xl">
                  <div className="flex items-center justify-between text-xs font-mono text-[#c5a059]">
                    <span>TITLE: {selectedSite.stories[0].title}</span>
                    <span>LANG: {selectedSite.stories[0].language.toUpperCase()}</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-devanagari">
                    {selectedSite.stories[0].content}
                  </p>
                </div>
              )}

              {/* Review Notes Form */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <label className="text-xs font-mono text-zinc-300">Auditor Notes &amp; Verification Rationale</label>
                <textarea
                  rows={3}
                  placeholder="Optional audit notes regarding historical accuracy, coordinates verification, or content safety..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#09090b] border border-white/10 focus:border-[#c5a059] outline-none text-xs text-white p-3 rounded-xl font-body"
                />
              </div>

              {actionError && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 font-mono">
                  {actionError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => handleAction("approved")}
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-mono font-semibold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  ✓ Approve Record
                </button>
                <button
                  onClick={() => handleAction("changes_requested")}
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-mono font-semibold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  ✎ Request Edits
                </button>
                <button
                  onClick={() => handleAction("rejected")}
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-mono font-semibold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  ✕ Reject Record
                </button>
              </div>

            </div>
          ) : (
            <div className="h-full border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center p-12 text-zinc-500 font-mono text-xs">
              Select a pending record from the audit queue to inspect and review.
            </div>
          )}
        </div>

      </main>

    </div>
  );
}
