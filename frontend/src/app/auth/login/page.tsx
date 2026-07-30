"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api";
import InteractiveTiltCard from "@/components/InteractiveTiltCard";
import ScrollReveal from "@/components/ScrollReveal";
import CustomCursor from "@/components/CustomCursor";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginUser(username, password);
      router.push("/discover");
    } catch (err: any) {
      setError(err.message || "Incorrect username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f7] archive-grid-bg flex flex-col justify-center items-center px-6 relative overflow-x-hidden">
      
      <CustomCursor />

      <ScrollReveal direction="scale">
        <InteractiveTiltCard className="w-full max-w-md bg-[#121216] border border-white/10 p-8 md:p-10 space-y-6 rounded-2xl relative z-10 shadow-2xl">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#c5a059] flex items-center justify-center font-bold text-black text-lg font-devanagari mx-auto">
              ने
            </div>
            <h1 className="text-2xl font-normal text-white font-display uppercase tracking-tight">
              ARCHIVAL PORTAL LOGIN
            </h1>
            <p className="text-xs font-devanagari text-zinc-400">
              सांस्कृतिक धरोहर अभिलेख प्रणाली प्रवेश
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 font-mono text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-xs font-mono text-zinc-300">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter account username"
                className="w-full px-4 py-3 bg-[#09090b] border border-white/10 focus:border-[#c5a059] text-xs text-white outline-none rounded-xl font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-mono text-zinc-300">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#09090b] border border-white/10 focus:border-[#c5a059] text-xs text-white outline-none rounded-xl font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3 bg-[#c5a059] hover:bg-[#d4af37] disabled:opacity-50 text-black font-mono font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg"
            >
              {loading ? "Authenticating..." : "Sign In →"}
            </button>
          </form>

          <div className="pt-4 border-t border-white/10 text-center text-xs text-zinc-400 font-mono">
            Need an account?{" "}
            <a href="/auth/register" className="text-[#c5a059] font-semibold hover:underline">
              Register Contributor Record
            </a>
          </div>

        </InteractiveTiltCard>
      </ScrollReveal>

    </div>
  );
}
