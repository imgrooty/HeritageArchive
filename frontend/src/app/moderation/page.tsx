"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

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
  
  // Selection & Action states
  const [selectedSite, setSelectedSite] = useState<HeritageSite | null>(null);
  const [notes, setNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Load user session & verify roles
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
        router.push("/discover"); // Send unauthorized users back to Discover
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
      const payload = {
        status,
        notes: notes.trim() !== "" ? notes : null,
      };
      await apiFetch(`/moderation/${selectedSite.id}/action`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setNotes("");
      await fetchQueue(); // Refresh queue
    } catch (err: any) {
      setActionError(err.message || "Failed to submit moderation action.");
    } finally {
      setActionLoading(false);
    }
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
            <a href="/contribute" className="hover:text-amber-400 transition-colors">Contribute</a>
            <span className="text-white flex items-center gap-1">
              Moderation Queue
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            </span>
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

      {/* Main Panel grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-4rem)] overflow-hidden">
        
        {/* Left Side: Pending Queue */}
        <div className="lg:col-span-4 flex flex-col gap-5 h-full overflow-hidden">
          <div>
            <h2 className="text-2xl font-black">Moderation Queue</h2>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mt-1">Review pending items</p>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 text-zinc-500 py-12">
                <span className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                <span className="text-xs font-semibold uppercase tracking-wider">Syncing queue...</span>
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl border border-rose-500/15 bg-rose-500/5 text-xs text-rose-400">{error}</div>
            ) : queue.length === 0 ? (
              <div className="text-center py-20 text-zinc-550 border border-dashed border-white/5 rounded-2xl flex flex-col items-center gap-2">
                <span className="text-lg">🎉</span>
                <p className="text-xs font-semibold">Queue is clear! No pending submissions.</p>
              </div>
            ) : (
              queue.map((site) => (
                <div
                  key={site.id}
                  onClick={() => setSelectedSite(site)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedSite?.id === site.id
                      ? "border-amber-500 bg-amber-500/[0.03]"
                      : "border-white/5 bg-[#0a0a0e] hover:border-white/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider">{site.category}</span>
                      <h4 className="font-extrabold text-sm text-white">{site.name}</h4>
                    </div>
                    <span className="text-[9px] text-zinc-500 font-mono">#{site.id}</span>
                  </div>
                  {site.stories && site.stories.length > 0 && (
                    <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2 mt-2">
                      {site.stories[0].content}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Detail review & action */}
        <div className="lg:col-span-8 h-full flex flex-col rounded-3xl border border-white/5 bg-[#0a0a0e] overflow-hidden relative shadow-2xl p-6">
          {selectedSite ? (
            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
              {/* Submission header attributes */}
              <div className="border-b border-white/5 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">{selectedSite.category}</span>
                  <h3 className="text-2xl font-black text-white mt-0.5">{selectedSite.name}</h3>
                  <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                    Coordinates: {selectedSite.latitude.toFixed(5)}°, {selectedSite.longitude.toFixed(5)}° &bull; Submitter ID: #{selectedSite.creator_id}
                  </p>
                </div>
                <div className="px-3 py-1 rounded bg-orange-500/10 border border-orange-500/20 text-[10px] font-bold text-orange-400 uppercase tracking-widest self-start">
                  Awaiting Review
                </div>
              </div>

              {/* Story scrollable context */}
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
                {selectedSite.stories && selectedSite.stories.map((story) => (
                  <div key={story.id} className="flex flex-col gap-2">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                      Story: {story.title} ({story.language.toUpperCase()})
                    </h4>
                    <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap bg-white/[0.01] p-4 rounded-xl border border-white/5">
                      {story.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Actions panel */}
              <div className="border-t border-white/5 pt-5 flex flex-col gap-4">
                {actionError && (
                  <p className="text-xs font-semibold text-rose-400">{actionError}</p>
                )}

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="moderation-notes" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Moderation Notes / Comments (Optional)</label>
                  <textarea
                    id="moderation-notes"
                    name="notes"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Provide justification notes (mandatory for changes requested or rejections)..."
                    className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-amber-500/50 transition-all resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => handleAction("approved")}
                    disabled={actionLoading}
                    className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-black transition-colors shadow-lg shadow-emerald-500/5 flex items-center justify-center gap-1.5"
                  >
                    {actionLoading ? "Processing..." : "Approve & Publish"}
                  </button>

                  <button
                    onClick={() => handleAction("changes_requested")}
                    disabled={actionLoading}
                    className="px-5 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
                  >
                    Request Changes
                  </button>

                  <button
                    onClick={() => handleAction("rejected")}
                    disabled={actionLoading}
                    className="px-5 py-3 rounded-xl border border-rose-500/20 hover:bg-rose-500/10 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-zinc-550 py-20 text-center">
              <span className="text-3xl">🗳️</span>
              <p className="text-xs font-semibold">Select a heritage site from the queue to start reviewing.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
