"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Send, 
  Loader2, 
  MessageSquare, 
  ShieldAlert, 
  HelpCircle,
  ChevronLeft,
  LifeBuoy,
  ShieldCheck,
  Zap
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

// ─────────────────────────────────────────────────────────────────────────────
// PRIORITY DETECTION LOGIC ── PRESERVED EXACTLY AS PER REQUIREMENTS
// ─────────────────────────────────────────────────────────────────────────────
const PRIORITY_RULES = [
  { keywords: ['urgent', 'emergency', 'asap', 'broken', 'stop'], priority: 'critical' },
  { keywords: ['slow', 'error', 'bug', 'failed'], priority: 'high' },
  { keywords: ['help', 'question', 'request'], priority: 'medium' }
];

function detectPriority(text) {
  const content = text.toLowerCase();
  for (const rule of PRIORITY_RULES) {
    if (rule.keywords.some(k => content.includes(k))) {
      return rule.priority;
    }
  }
  return 'low';
}
// ─────────────────────────────────────────────────────────────────────────────

export default function SubmitTicketPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title || !description) {
      toast.error("Please fill in all protocol fields.");
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Session expired. Please re-authenticate.");
      setLoading(false);
      return;
    }

    const priority = detectPriority(title + " " + description);

    const { error } = await supabase
      .from("tickets")
      .insert({
        title,
        description,
        priority,
        submitted_by: user.id,
        status: "open",
      });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Incident broadcast successful.");
      router.push("/employee");
      router.refresh();
    }
    setLoading(false);
  }

  const getPriorityPreview = (p) => {
    const styles = {
      critical: "bg-red-50 text-red-600 border-red-200",
      high: "bg-orange-50 text-orange-600 border-orange-200",
      medium: "bg-indigo-50 text-indigo-600 border-indigo-200",
      low: "bg-emerald-50 text-emerald-600 border-emerald-200",
    };
    return (
      <Badge variant="outline" className={`px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest ${styles[p]}`}>
        {p} Detect
      </Badge>
    );
  };

  return (
    <div className="max-w-[900px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      <div className="mb-10 flex items-center justify-between">
        <Link href="/employee">
          <Button variant="ghost" className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-black text-[10px] uppercase tracking-widest px-4 h-10 rounded-xl group transition-all">
            <ChevronLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="flex items-center gap-3 bg-white border border-slate-200 px-6 py-2.5 rounded-2xl shadow-sm">
           <Zap className="w-4 h-4 text-indigo-500" />
           <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Real-time Priority Analysis</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left: Form */}
        <div className="lg:col-span-8">
           <Card className="bg-white border-none shadow-2xl rounded-[32px] overflow-hidden">
              <CardHeader className="p-10 sm:p-14 border-b border-slate-50 bg-slate-50/30">
                 <div className="flex items-center gap-5 mb-4">
                    <div className="w-14 h-14 bg-indigo-600 rounded-[22px] flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                       <MessageSquare className="w-7 h-7" />
                    </div>
                    <div>
                       <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">Open Incident <span className="text-indigo-600">Report</span></CardTitle>
                       <CardDescription className="text-slate-500 font-medium text-base mt-1">Initialize a support thread for hardware or software assistance.</CardDescription>
                    </div>
                 </div>
              </CardHeader>
              <CardContent className="p-10 sm:p-14">
                 <form onSubmit={handleSubmit} className="space-y-10">
                    
                    <div className="space-y-4">
                       <div className="flex items-center justify-between ml-1">
                          <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                             <ShieldAlert className="w-4 h-4 text-indigo-600" />
                             Incident Descriptor
                          </Label>
                          {title && getPriorityPreview(detectPriority(title + " " + description))}
                       </div>
                       <Input 
                          placeholder="Summarize the core problem..." 
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="h-16 bg-slate-50 text-slate-900 border-slate-100 rounded-2xl px-6 font-bold text-lg shadow-inner focus-visible:ring-indigo-500 placeholder:text-slate-300"
                       />
                       <p className="text-[10px] text-slate-400 font-medium ml-1">Avoid acronyms where possible for faster triage.</p>
                    </div>

                    <div className="space-y-4">
                       <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 ml-1">
                          <HelpCircle className="w-4 h-4 text-indigo-600" />
                          Detailed Diagnostic
                       </Label>
                       <Textarea 
                          placeholder="Provide all relevant context, error codes, and symptoms..." 
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="min-h-[220px] bg-slate-50 text-slate-900 border-slate-100 rounded-[24px] px-8 py-8 font-medium text-lg shadow-inner focus-visible:ring-indigo-500 placeholder:text-slate-300 resize-none leading-relaxed"
                       />
                       <div className="flex items-center justify-between px-1">
                          <p className="text-[10px] text-slate-400 font-medium italic">Our triage engine classifies incidents based on keywords.</p>
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{description.length} chars</span>
                       </div>
                    </div>

                    <div className="pt-6">
                       <Button 
                          type="submit" 
                          disabled={loading}
                          className="w-full h-18 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-[0.2em] shadow-2xl text-[12px] transition-all active:scale-[0.98] group relative overflow-hidden rounded-[26px] border-none py-6"
                       >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                          {loading ? (
                             <><Loader2 className="w-6 h-6 mr-4 animate-spin" /> ESTABLISHING LINK...</>
                          ) : (
                             <><Send className="w-6 h-6 mr-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Broadcast Incident</>
                          )}
                       </Button>
                    </div>
                 </form>
              </CardContent>
           </Card>
        </div>

        {/* Right: Info */}
        <div className="lg:col-span-4 space-y-10">
           <Card className="bg-white border border-slate-100 shadow-xl rounded-[32px] overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-50">
                 <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                    <LifeBuoy className="w-5 h-5 text-indigo-600" />
                    Support Protocol
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                 <div className="space-y-2">
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Active Detection</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Our triage engine automatically classifies incidents based on core terminology.</p>
                 </div>
                 <div className="space-y-4">
                    <div className="flex items-start gap-4">
                       <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5" />
                       <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Urgent Hardware Fail</div>
                    </div>
                    <div className="flex items-start gap-4">
                       <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5" />
                       <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Network Instability</div>
                    </div>
                    <div className="flex items-start gap-4">
                       <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5" />
                       <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">General Inquiries</div>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <div className="bg-indigo-600 p-10 rounded-[32px] shadow-2xl text-white relative overflow-hidden group">
              <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                 <ShieldCheck className="w-40 h-40" />
              </div>
              <h4 className="text-xl font-black tracking-tight mb-4 flex items-center gap-3">
                 Security Hub
              </h4>
              <p className="text-indigo-100 text-xs font-medium leading-relaxed opacity-80">All submissions are monitored for compliance with regional access policies.</p>
           </div>
        </div>

      </div>

    </div>
  );
}
