"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { createNotification } from "@/lib/notifications";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";

// ─────────────────────────────────────────────
// PRIORITY DETECTION ENGINE (Logic Preserved Exactly)
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
    if (!title.trim() || !description.trim()) {
      toast.warning("Please fill out both the title and description.");
      return;
    }

    setLoading(true);

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      toast.error("You must be logged in to submit a ticket.");
      setLoading(false);
      return;
    }

    const { data: insertedTicket, error: insertError } = await supabase.from("tickets").insert([
      {
        title: title.trim(),
        description: description.trim(),
        priority: priority.level,
        status: "open",
        submitted_by: user.id,
      },
    ]).select().single();

    if (insertError) {
      toast.error(insertError.message);
      setLoading(false);
      return;
    }

    // ─────────────────────────────────────────────
    // NOTIFICATIONS ENGINE
    // ─────────────────────────────────────────────
    // Notify ALL Admins automatically
    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
    const { data: allAdmins } = await supabase.from("profiles").select("id").eq("role", "admin");
    
    if (allAdmins && insertedTicket) {
      for (const admin of allAdmins) {
        await createNotification(
          admin.id,
          insertedTicket.id,
          "new_ticket",
          `📋 New ${priority.level.toUpperCase()} ticket submitted by ${profile?.full_name || 'Employee'}:\n'${title.trim()}'`
        );
      }
    }

    toast.success("Ticket submitted successfully!");
    router.push("/employee/tickets");
  }

  return (
    <div className="max-w-2xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="shadow-lg border-slate-200">
        <form onSubmit={handleSubmit}>
          <CardHeader className="text-center pb-8 border-b border-slate-100 bg-slate-50/50 rounded-t-xl mb-6">
            <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
              <Plus className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Submit a Support Ticket</CardTitle>
            <CardDescription className="text-base text-slate-500 mt-2">
              Describe your issue and our team will help you. We use automated keyword detection to route your ticket immediately.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2.5">
              <Label htmlFor="title" className="text-slate-800 font-semibold text-sm">
                Issue Title <span className="text-blue-500">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary of your issue"
                maxLength={120}
                className="h-12 px-4 shadow-sm focus-visible:ring-blue-500 border-slate-200"
              />
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="description" className="text-slate-800 font-semibold text-sm">
                  Description <span className="text-blue-500">*</span>
                </Label>
                <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded">
                  {description.length} chars
                </span>
              </div>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the problem in detail..."
                className="min-h-40 p-4 resize-none shadow-sm focus-visible:ring-blue-500 border-slate-200"
              />
            </div>

            {/* ─── LIVE PRIORITY BADGE SECTION ─── */}
            <div className="pt-2">
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block text-center">
                Automated System Analysis
              </Label>
              <div
                className={`rounded-xl border-2 p-5 transition-all duration-500 ease-out ${priority.badgeClass} ${
                  animating ? "scale-[1.02] shadow-md -rotate-1" : "scale-100 shadow-sm"
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
                    <h4 className="font-extrabold text-base tracking-tight mb-1">
                      {priority.label}
                    </h4>
                    <p className="text-xs font-medium opacity-80 mb-3">{priority.message}</p>

                    <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden flex">
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
                      <div className="mt-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 block mb-1.5">
                          Detected Keywords:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {priority.detectedKeywords.map((kw) => (
                            <span key={kw} className="px-2 py-0.5 bg-white/70 rounded text-[10px] font-bold shadow-sm border border-black/5">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-4 border-t border-slate-100 bg-slate-50/50 rounded-b-xl px-6 py-5">
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-12 shadow-sm transition-transform hover:-translate-y-0.5"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" />
                  Submit Ticket
                </>
              )}
            </Button>
            <p className="text-xs text-slate-500 font-medium text-center">
              Priority is automatically detected based on Description keywords.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
