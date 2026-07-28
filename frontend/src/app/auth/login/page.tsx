"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api";

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
    <div className="min-h-screen bg-[#07070a] text-white flex flex-col justify-center items-center px-6 relative selection:bg-[#fb923c] selection:text-black">
      {/* Background Ambient Glow */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-amber-600/10 to-transparent blur-[100px] pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md p-8 rounded-3xl border border-white/5 bg-[#0b0b0f]/80 backdrop-blur-xl shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 items-center justify-center font-extrabold text-black text-2xl shadow-[0_0_20px_rgba(245,158,11,0.25)] mb-4">
            ने
          </div>
          <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-amber-200 to-orange-400 bg-clip-text text-transparent">
            Welcome back
          </h2>
          <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-semibold">
            HeritageArchive Portal
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-xs font-semibold text-rose-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="username" className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 font-bold text-sm text-black shadow-lg hover:shadow-orange-600/15 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-zinc-500">
          Don't have an account?{" "}
          <a href="/auth/register" className="font-bold text-amber-500 hover:text-amber-400 transition-colors">
            Register now
          </a>
        </div>
      </div>
    </div>
  );
}
