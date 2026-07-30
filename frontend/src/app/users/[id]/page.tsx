"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import CustomCursor from "@/components/CustomCursor";

interface ProfileSite {
  id: number;
  name: string;
  category: string;
  status: string;
  created_at: string;
}

interface UserProfile {
  id: number;
  username: string;
  role: string;
  reputation_score: number;
  created_at: string;
  submissions: ProfileSite[];
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      try {
        const data = await apiFetch(`/users/${id}/profile`);
        setProfile(data);
      } catch (err: any) {
        setError(err.message || "Failed to retrieve user profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-[#f4f4f7] flex flex-col items-center justify-center gap-2">
        <span className="w-6 h-6 rounded-full border-2 border-[#c5a059] border-t-transparent animate-spin" />
        <span className="text-xs font-mono tracking-widest text-zinc-400 uppercase">Loading contributor profile...</span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#09090b] text-[#f4f4f7] flex flex-col items-center justify-center gap-4 px-6">
        <div className="max-w-md p-6 rounded-2xl border border-red-500/20 bg-red-950/20 text-center flex flex-col gap-3">
          <span className="text-2xl">👤</span>
          <p className="text-xs font-mono text-red-300">{error || "Contributor profile not found."}</p>
        </div>
        <button
          onClick={() => router.push("/discover")}
          className="px-4 py-2 rounded-xl border border-white/10 text-xs font-mono text-zinc-400 hover:text-white transition-all"
        >
          ← Return to Catalogue
        </button>
      </div>
    );
  }

  const getReputationBadge = (score: number) => {
    if (score >= 50) return { name: "Elder Preserver", color: "text-[#c5a059] border-[#c5a059]/30 bg-[#c5a059]/10" };
    if (score >= 25) return { name: "Trusted Verifier", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" };
    if (score >= 10) return { name: "Active Contributor", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" };
    return { name: "Local Explorer", color: "text-zinc-300 border-white/10 bg-zinc-900" };
  };

  const badge = getReputationBadge(profile.reputation_score);

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
                CONTRIBUTOR <span className="text-[#c5a059]">PROFILE</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-mono tracking-wider -mt-1">
                USER REF #{profile.id}
              </span>
            </div>
          </div>

          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-white/10 hover:border-[#c5a059] text-xs font-mono text-zinc-300 hover:text-white transition-all rounded-lg"
          >
            ← Back
          </button>
        </div>
      </header>

      {/* Main Profile Layout */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 space-y-8 z-20 relative">
        
        {/* User Card Header */}
        <div className="bg-[#121216] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center text-2xl font-bold font-display text-[#c5a059]">
                {profile.username[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-normal text-white font-display flex items-center gap-3">
                  {profile.username}
                  <span className="text-[10px] px-2.5 py-0.5 rounded bg-zinc-900 border border-white/10 text-[#c5a059] font-mono uppercase tracking-wider">
                    {profile.role}
                  </span>
                </h1>
                <p className="text-xs text-zinc-400 font-mono mt-1">
                  Registered: {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="p-4 rounded-xl bg-[#09090b] border border-white/10 text-center min-w-28">
                <div className="text-2xl font-mono text-[#c5a059]">{profile.reputation_score}</div>
                <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider mt-0.5">Reputation</div>
              </div>
              <div className="p-4 rounded-xl bg-[#09090b] border border-white/10 text-center min-w-28">
                <div className="text-2xl font-mono text-white">{profile.submissions.length}</div>
                <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider mt-0.5">Submissions</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Badge Column */}
          <div className="md:col-span-4">
            <div className="p-6 rounded-2xl bg-[#121216] border border-white/10 space-y-4">
              <span className="text-[11px] font-mono tracking-widest text-[#c5a059] uppercase font-semibold">
                COMMUNITY TIER
              </span>
              <div className={`p-4 rounded-xl border text-center ${badge.color}`}>
                <span className="text-xs font-mono font-bold uppercase tracking-wider">{badge.name}</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono leading-relaxed">
                Reputation is earned by contributing heritage stories (+5 points per approved entry) and participating in verification reviews.
              </p>
            </div>
          </div>

          {/* Submissions List Column */}
          <div className="md:col-span-8 space-y-4">
            <h3 className="text-xs font-mono tracking-widest text-[#c5a059] uppercase font-semibold">
              SUBMITTED ARCHIVAL ENTRIES ({profile.submissions.length})
            </h3>
            {profile.submissions.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-zinc-800 text-center text-zinc-500 font-mono text-xs">
                No heritage entries submitted yet.
              </div>
            ) : (
              <div className="space-y-3">
                {profile.submissions.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => router.push(`/heritage/${sub.id}`)}
                    className="p-4 rounded-xl bg-[#121216] border border-white/10 hover:border-[#c5a059] transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-mono text-[#c5a059] uppercase">{sub.category}</span>
                      <h4 className="text-sm font-medium text-white font-display">{sub.name}</h4>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-semibold uppercase">{sub.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </main>

    </div>
  );
}
