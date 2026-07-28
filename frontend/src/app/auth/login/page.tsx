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
      <div className="w-full max-w-md p-8 rounded-3xl border border-white/5 bg-[#0b0b0f]/80 backdrop-blur-xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-amber-200 to-orange-400 bg-clip-text text-transparent">
            Welcome back
          </h2>
          <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-semibold">
            HeritageArchive Portal
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-xs font-semibold text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="username" className="text-[11px] font-bold uppercase text-zinc-400">Username</label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-[11px] font-bold uppercase text-zinc-400">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 font-bold text-sm text-black shadow-lg"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
