"use client";

import { useState } from "react";
import Link from "next/link";
import { loginAction } from "@/app/auth/actions";
import { Lock } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleFormSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Dark modern background accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#18181b] border border-slate-800 rounded-2xl mb-5 shadow-2xl">
            <Lock className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">IT Helpdesk</h1>
          <p className="text-slate-400 mt-2 font-medium">Sign in to access your secure portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#18181b] rounded-2xl shadow-2xl p-8 border border-slate-800 backdrop-blur-sm">
          <form onSubmit={handleFormSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
               <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-start gap-3">
                 <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                 </svg>
                 <p className="text-sm text-red-200 font-medium">{error}</p>
               </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5 uppercase tracking-wider text-xs" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@company.com"
                className="w-full px-4 py-3 bg-[#09090b] rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-white placeholder-slate-600 shadow-inner"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5 uppercase tracking-wider text-xs" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#09090b] rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-white placeholder-slate-600 shadow-inner"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-bold py-3 pt-3.5 rounded-xl hover:bg-indigo-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Authenticating...
                </span>
              ) : (
                "Secure Sign In"
              )}
            </button>
          </form>

          {/* Register Link */}
          <p className="text-center text-sm text-slate-400 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
              Request access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
