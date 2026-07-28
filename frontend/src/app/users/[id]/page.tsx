"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

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
      <div className="min-h-screen bg-[#07070a] text-white flex flex-col items-center justify-center gap-2">
        <span className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Loading contributor profile...</span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#07070a] text-white flex flex-col items-center justify-center gap-4 px-6">
        <div className="max-w-md p-6 rounded-2xl border border-rose-500/10 bg-rose-500/5 text-center flex flex-col gap-3">
          <span className="text-2xl">👤</span>
          <p className="text-sm text-rose-400 font-bold">{error || "User profile not found."}</p>
        </div>
        <button
          onClick={() => router.push("/discover")}
          className="px-4 py-2 rounded-lg border border-white/10 text-xs text-zinc-400 hover:text-white transition-all"
        >
          &larr; Return to Portal
        </button>
      </div>
    );
  }

  // Determine Badge based on reputation score
  const getReputationBadge = (score: number) => {
    if (score >= 50) return { name: "Elder Preserver", color: "text-purple-400 border-purple-500/20 bg-purple-500/10" };
    if (score >= 25) return { name: "Trusted Verifier", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" };
    if (score >= 10) return { name: "Active Contributor", color: "text-amber-400 border-amber-500/20 bg-amber-500/10" };
    return { name: "Local Explorer", color: "text-blue-400 border-blue-500/20 bg-blue-500/10" };
  };

  const badge = getReputationBadge(profile.reputation_score);

  return (
    <div className="min-h-screen bg-[#07070a] text-white pb-20 relative selection:bg-[#fb923c] selection:text-black">
      {/* Category Gradient Top Banner */}
      <div className="h-60 w-full bg-gradient-to-b from-zinc-800/15 via-zinc-900/5 to-transparent relative border-b border-white/5">
        <div className="absolute inset-0 bg-[#07070a]/40" />
        <div className="max-w-4xl mx-auto px-6 h-full flex items-end pb-8 relative z-10">
          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 font-bold hover:underline mb-2"
            >
              &larr; Back
            </button>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl font-bold">
                  {profile.username[0].toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
                    {profile.username}
                    <span className="text-[10px] px-2 py-0.5 rounded border border-zinc-700 bg-zinc-800/55 text-zinc-400 uppercase tracking-widest text-center">
                      {profile.role}
                    </span>
                  </h1>
                  <p className="text-xs text-zinc-500 font-mono mt-1">
                    Joined: {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Reputation Stats Box */}
              <div className="flex gap-4 sm:self-center">
                <div className="p-4 rounded-xl border border-white/5 bg-[#0a0a0e] flex flex-col gap-1 items-center min-w-28">
                  <span className="text-2xl font-black text-amber-500">{profile.reputation_score}</span>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Reputation</span>
                </div>
                <div className="p-4 rounded-xl border border-white/5 bg-[#0a0a0e] flex flex-col gap-1 items-center min-w-28">
                  <span className="text-2xl font-black text-zinc-300">{profile.submissions.length}</span>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Submissions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-12 grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Left Stats & Badges column */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="p-5 rounded-2xl border border-white/5 bg-[#0a0a0e] flex flex-col gap-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-2">
              Community Status
            </h3>
            <div className="flex flex-col gap-3">
              <span className="text-[10px] text-zinc-500 font-mono leading-relaxed">
                Reputation is earned by contributing heritage stories (+5 per approved submission) and participating in verification reviews (+1 per review vote).
              </span>
              <div className={`p-4 rounded-xl border flex flex-col gap-1 items-center ${badge.color}`}>
                <span className="text-xs font-bold uppercase tracking-wider">{badge.name}</span>
                <span className="text-[8px] text-zinc-500 font-mono">Trophy Tier</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Contributions list column */}
        <div className="md:col-span-8 flex flex-col gap-6">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-2">
            Documented Contributions ({profile.submissions.length})
          </h3>

          {profile.submissions.length === 0 ? (
            <div className="py-16 border border-dashed border-white/5 rounded-2xl text-center text-xs text-zinc-600 flex flex-col items-center gap-2">
              <span>🏺</span>
              <span>No heritage sites submitted yet by this user.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {profile.submissions.map((site) => (
                <div
                  key={site.id}
                  onClick={() => router.push(`/heritage/${site.id}`)}
                  className="p-5 rounded-2xl border border-white/5 bg-[#09090d] hover:border-amber-500/25 transition-all cursor-pointer flex justify-between items-center group"
                >
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] px-2 py-0.5 max-w-fit rounded border border-amber-500/20 bg-amber-500/5 text-amber-500/80 font-bold uppercase tracking-wider">
                      {site.category}
                    </span>
                    <h4 className="text-sm font-bold text-white group-hover:text-amber-500 transition-colors">
                      {site.name}
                    </h4>
                    <p className="text-[10px] text-zinc-500">
                      Submitted: {new Date(site.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    site.status === "approved"
                      ? "text-emerald-400 border-emerald-500/10 bg-emerald-500/5"
                      : "text-orange-400 border-orange-500/10 bg-orange-500/5"
                  }`}>
                    {site.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
