"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// ─────────────────────────────────────────────
// PRIORITY DETECTION ENGINE
// Scans the description text in real-time and
// returns the highest matching priority level.
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
    badgeClass: "bg-red-100 border-red-300 text-red-800",
    dotClass: "bg-red-500",
    iconBg: "bg-red-500",
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
    badgeClass: "bg-orange-100 border-orange-300 text-orange-800",
    dotClass: "bg-orange-500",
    iconBg: "bg-orange-500",
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
    badgeClass: "bg-yellow-100 border-yellow-300 text-yellow-800",
    dotClass: "bg-yellow-500",
    iconBg: "bg-yellow-500",
  },
];

/**
 * detectPriority — scans text and returns the highest priority match.
 * Returns an object with { level, label, badgeClass, dotClass, iconBg, message, detectedKeywords }
 */
function detectPriority(text) {
  const lower = text.toLowerCase();

  for (const rule of PRIORITY_RULES) {
    const found = rule.keywords.filter((kw) => lower.includes(kw));
    if (found.length > 0) {
      return { ...rule, detectedKeywords: found };
    }
  }

  // Default: LOW priority
  return {
    level: "low",
    label: "LOW PRIORITY",
    color: "green",
    message: "No urgent keywords detected. This will be handled in normal queue.",
    badgeClass: "bg-green-100 border-green-300 text-green-800",
    dotClass: "bg-green-500",
    iconBg: "bg-green-500",
    detectedKeywords: [],
  };
}

// ─────────────────────────────────────────────
// SUBMIT TICKET PAGE
// The standout feature of this application.
// ─────────────────────────────────────────────

/**
 * SubmitTicketPage — allows an employee to submit a new IT ticket.
 *
 * STANDOUT FEATURE: Live Priority Detection
 *   - As the user types the description, keywords are scanned instantly
 *   - A color-coded priority badge appears and updates in real time
 *   - The employee never manually picks priority — it is auto-detected
 *   - The detected priority level is saved with the ticket on submission
 */
export default function SubmitTicketPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(detectPriority("")); // Start at LOW
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [animating, setAnimating] = useState(false);

  // Re-run detection every time description changes
  useEffect(() => {
    const detected = detectPriority(description);

    // Only animate if priority level actually changed
    if (detected.level !== priority.level) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 400);
    }

    setPriority(detected);
  }, [description]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Get the current authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("You must be logged in to submit a ticket.");
      setLoading(false);
      return;
    }

    // Insert the new ticket into Supabase
    const { error: insertError } = await supabase.from("tickets").insert([
      {
        title: title.trim(),
        description: description.trim(),
        priority: priority.level,  // The auto-detected priority
        status: "open",
        submitted_by: user.id,
      },
    ]);

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    // Redirect to tickets list with success message in URL
    router.push("/employee/tickets?submitted=true");
  }

  const charCount = description.length;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Submit IT Request</h1>
        <p className="text-gray-500 mt-1">
          Describe your issue and our team will get back to you as soon as possible.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Title Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="title">
                Issue Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cannot connect to company VPN"
                maxLength={120}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder-gray-400 text-sm"
              />
            </div>

            {/* Description Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700" htmlFor="description">
                  Describe the Problem <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-gray-400">{charCount} characters</span>
              </div>

              <p className="text-xs text-gray-400 mb-2">
                💡 <strong>Tip:</strong> The more detail you provide, the faster we can help. Mention what happened, when it started, and what you&apos;ve tried.
              </p>

              <textarea
                id="description"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. My laptop crashed this morning with a blue screen error. It keeps restarting every 10 minutes. I tried restarting it but the problem persists..."
                rows={7}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder-gray-400 text-sm resize-none"
              />
            </div>

            {/* ═══════════════════════════════════════════════════ */}
            {/* LIVE PRIORITY DETECTION BADGE — The standout feature */}
            {/* ═══════════════════════════════════════════════════ */}
            <div
              className={`rounded-xl border-2 p-4 transition-all duration-300 ${priority.badgeClass} ${
                animating ? "scale-[1.02] shadow-md" : "scale-100"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Pulsing dot */}
                <div className="flex-shrink-0 mt-0.5 relative">
                  <span className={`block w-3 h-3 rounded-full ${priority.dotClass}`} />
                  {priority.level !== "low" && (
                    <span className={`absolute inset-0 w-3 h-3 rounded-full ${priority.dotClass} animate-ping opacity-60`} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm tracking-wide">
                      {priority.label}
                    </span>
                    <span className="text-xs opacity-60 italic">
                      — auto-detected
                    </span>
                  </div>

                  <p className="text-sm mt-1 opacity-80">{priority.message}</p>

                  {/* Show which keywords triggered the priority */}
                  {priority.detectedKeywords && priority.detectedKeywords.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="text-xs opacity-60 font-medium">Keywords detected:</span>
                      {priority.detectedKeywords.map((kw) => (
                        <span
                          key={kw}
                          className="inline-block bg-white bg-opacity-60 border border-current border-opacity-30 rounded-full px-2 py-0.5 text-xs font-semibold"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Visual priority scale */}
                  <div className="mt-3 grid grid-cols-4 gap-1">
                    {["low", "medium", "high", "critical"].map((lvl) => (
                      <div
                        key={lvl}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          lvl === priority.level
                            ? priority.level === "critical" ? "bg-red-500"
                            : priority.level === "high" ? "bg-orange-500"
                            : priority.level === "medium" ? "bg-yellow-500"
                            : "bg-green-500"
                            : "bg-black bg-opacity-10"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-1 mt-0.5">
                    {["Low", "Med", "High", "Critical"].map((l) => (
                      <span key={l} className="text-center text-[10px] opacity-50">{l}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* ═══════════════════════════════════════════════════ */}

          </div>

          {/* Form Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              You&apos;ll receive updates when our IT team responds to your ticket.
            </p>
            <button
              type="submit"
              disabled={loading || !title.trim() || !description.trim()}
              className="flex-shrink-0 flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Submit Ticket
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
