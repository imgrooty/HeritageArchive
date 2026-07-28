"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-white flex flex-col justify-center items-center px-6 relative selection:bg-[#fb923c] selection:text-black">
      {/* Background Ambient Glow */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-amber-600/10 to-transparent blur-[100px] pointer-events-none" />

      {/* Registration Card */}
      <div className="w-full max-w-md p-8 rounded-3xl border border-white/5 bg-[#0b0b0f]/80 backdrop-blur-xl shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 items-center justify-center font-extrabold text-black text-2xl shadow-[0_0_20px_rgba(245,158,11,0.25)] mb-4">
            ने
          </div>
          <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-amber-200 to-orange-400 bg-clip-text text-transparent">
            Create an account
          </h2>
          <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-semibold">
            Join the Heritage Archive
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-xs font-semibold text-emerald-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Registration successful! Redirecting to login...
          </div>
        )}

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
            <label htmlFor="reg-username" className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Username</label>
            <input
              id="reg-username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. nepal_historian"
              className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-zinc-650 focus:outline-none focus:border-amber-500/50 transition-all"
            />
            <p className="text-[10px] text-zinc-500">
              Tip: Include <span className="text-amber-500 font-semibold">"moderator"</span> or <span className="text-amber-500 font-semibold">"contributor"</span> in your username to auto-assign that role.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="reg-email" className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Email Address</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. editor@archive.org"
              className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-zinc-650 focus:outline-none focus:border-amber-500/50 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="reg-password" className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Password</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-zinc-650 focus:outline-none focus:border-amber-500/50 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 font-bold text-sm text-black shadow-lg hover:shadow-orange-600/15 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                Registering...
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-zinc-500">
          Already have an account?{" "}
          <a href="/auth/login" className="font-bold text-amber-500 hover:text-amber-400 transition-colors">
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}
