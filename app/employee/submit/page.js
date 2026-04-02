"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// ─────────────────────────────────────────────
// PRIORITY DETECTION ENGINE
// ─────────────────────────────────────────────
const PRIORITY_RULES = [
  {
    level: "critical",
    label: "CRITICAL PRIORITY",
    color: "red",
    keywords: [
      "hacked", "hack", "virus", "ransomware", "breach", "attack",
      "compromised", "malware", "phishing", "data leak", "unauthorized access",
      "security incident", "intrusion",
    ],
    message: "Security-related keywords detected. This will be treated as an emergency.",
    badgeClass: "bg-red-50 border-red-200 text-red-700",
    dotClass: "bg-red-500",
    scaleClass: "bg-red-500"
  },
  {
    level: "high",
    label: "HIGH PRIORITY",
    color: "orange",
    keywords: [
      "crash", "crashed", "down", "not working", "broken", "error",
      "failed", "failure", "offline", "cant login", "cannot login",
      "cannot access", "can't access", "system down", "blue screen",
      "bsod", "not responding", "wont start", "won't start",
    ],
    message: "Critical failure keywords found. This issue will be escalated quickly.",
    badgeClass: "bg-orange-50 border-orange-200 text-orange-700",
    dotClass: "bg-orange-500",
    scaleClass: "bg-orange-500"
  },
  {
    level: "medium",
    label: "MEDIUM PRIORITY",
    color: "yellow",
    keywords: [
      "slow", "laggy", "lag", "issue", "problem", "weird", "strange",
      "glitch", "freeze", "freezing", "frozen", "unresponsive",
      "keeps restarting", "restarting", "sometimes", "intermittent",
      "occasionally", "unstable",
    ],
    message: "Performance or intermittent issue keywords detected.",
    badgeClass: "bg-amber-50 border-amber-200 text-amber-700",
    dotClass: "bg-amber-500",
    scaleClass: "bg-amber-500"
  },
];

function detectPriority(text) {
  const lower = text.toLowerCase();
  for (const rule of PRIORITY_RULES) {
    const found = rule.keywords.filter((kw) => lower.includes(kw));
    if (found.length > 0) {
      return { ...rule, detectedKeywords: found };
    }
  }
  return {
    level: "low",
    label: "LOW PRIORITY",
    color: "green",
    message: "No urgent keywords detected. Handled in the normal queue.",
    badgeClass: "bg-green-50 border-green-200 text-green-700",
    dotClass: "bg-green-500",
    scaleClass: "bg-green-500",
    detectedKeywords: [],
  };
}

export default function SubmitTicketPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(detectPriority(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const detected = detectPriority(description);
    if (detected.level !== priority.level) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 500);
    }
    setPriority(detected);
  }, [description]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("You must be logged in to submit a ticket.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("tickets").insert([
      {
        title: title.trim(),
        description: description.trim(),
        priority: priority.level,
        status: "open",
        submitted_by: user.id,
      },
    ]);

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/employee/tickets?submitted=true");
  }

  const charCount = description.length;

  return (
    <div className="max-w-3xl mx-auto">
      {/* ─── Hero Header ─── */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-6 shadow-sm">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Submit It Request</h1>
        <p className="text-gray-500 mt-3 text-lg max-w-xl mx-auto">
          Describe the problem you're experiencing. We use automated keyword detection to route your ticket immediately.
        </p>
      </div>

      {/* ─── Form Card ─── */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-8 md:p-12 space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-4">
                <svg className="w-6 h-6 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 tracking-wide uppercase" htmlFor="title">
                What do you need help with? <span className="text-blue-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Can't connect to the printer"
                maxLength={120}
                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-gray-900 placeholder-gray-400 text-lg font-medium"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-gray-800 tracking-wide uppercase" htmlFor="description">
                  Details <span className="text-blue-500">*</span>
                </label>
                <div className="text-sm font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  {charCount} chars
                </div>
              </div>

              <textarea
                id="description"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Share any error messages, what you were trying to do, and when it started..."
                rows={6}
                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-gray-900 placeholder-gray-400 text-base resize-none"
              />
            </div>

            {/* ─── Animated Priority Badge ─── */}
            <div className="pt-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">
                Automated System Analysis
              </p>
              <div
                className={`rounded-2xl border-2 p-5 transition-all duration-500 ease-out ${priority.badgeClass} ${
                  animating ? "scale-105 shadow-xl -rotate-1" : "scale-100 shadow-sm"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 mt-1 relative">
                    <span className={`block w-4 h-4 rounded-full ${priority.dotClass}`} />
                    {priority.level !== "low" && (
                      <span className={`absolute inset-0 w-4 h-4 rounded-full ${priority.dotClass} animate-ping opacity-75`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-lg tracking-tight mb-1">
                      {priority.label}
                    </h4>
                    <p className="text-sm font-medium opacity-80 mb-3">{priority.message}</p>

                    <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden flex">
                      {["low", "medium", "high", "critical"].map((lvl) => (
                        <div
                          key={lvl}
                          className={`flex-1 h-full transition-colors duration-500 ${
                            priority.level === "critical" ? "bg-red-500" :
                            priority.level === "high" && ["low", "medium", "high"].includes(lvl) ? "bg-orange-500" :
                            priority.level === "medium" && ["low", "medium"].includes(lvl) ? "bg-amber-500" :
                            priority.level === "low" && lvl === "low" ? "bg-green-500" :
                            "bg-transparent"
                          }`}
                        />
                      ))}
                    </div>

                    {priority.detectedKeywords.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2 items-center">
                        <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                          Triggers:
                        </span>
                        {priority.detectedKeywords.map((kw) => (
                          <span key={kw} className="px-3 py-1 bg-white/70 rounded-full text-xs font-black shadow-sm">
                            "{kw}"
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:px-12 md:py-8 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-sm text-gray-500 font-medium text-center sm:text-left">
              You will receive a notification when the IT team is assigned to your ticket.
            </p>
            <button
              type="submit"
              disabled={loading || !title.trim() || !description.trim()}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_30px_rgb(37,99,235,0.2)] hover:shadow-[0_8px_30px_rgb(37,99,235,0.4)] hover:-translate-y-1"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12V0a12 12 0 0112 12h-4a8 8 0 00-8-8z" />
                  </svg>
                  Submitting Request...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Submit Securely
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
