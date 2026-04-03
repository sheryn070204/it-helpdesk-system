"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Mail, 
  Lock, 
  Loader2, 
  LifeBuoy, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Fingerprint
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success("Identity verified. Accessing Hub...");
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profile?.role === "admin") {
        router.push("/admin");
      } else if (profile?.role === "it_staff" || profile?.role === "it-staff") {
        router.push("/it-staff");
      } else {
        router.push("/employee");
      }
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex bg-[#09090b] text-slate-100 selection:bg-indigo-500/30 overflow-hidden relative">
      
      {/* ─── BACKGROUND ACCENTS ─── */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      {/* ─── LEFT PANEL: VISUAL ─── */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-20 relative z-10 border-r border-white/5">
         <div className="flex items-center gap-4 group">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/20 group-hover:rotate-12 transition-transform duration-500">
               <LifeBuoy className="w-7 h-7 text-white" />
            </div>
            <div>
               <p className="text-2xl font-black tracking-tighter leading-none mb-1 text-white">Helpdesk</p>
               <p className="text-indigo-500 text-[10px] font-black uppercase tracking-[0.4em] leading-none">Security Node</p>
            </div>
         </div>

         <div className="space-y-10 group">
            <div className="space-y-1.5 overflow-hidden">
               <div className="flex items-center gap-3 text-indigo-500/60 mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Next-Generation Support</span>
               </div>
               <h1 className="text-[120px] font-black leading-[0.8] tracking-tighter text-white opacity-90 group-hover:opacity-100 transition-all duration-700 select-none uppercase">
                  Secure <br /> <span className="text-indigo-600">Intake</span>
               </h1>
            </div>
            <p className="text-xl text-slate-400 font-medium max-w-lg leading-relaxed border-l-4 border-indigo-600 pl-8 group-hover:pl-10 transition-all">
               Access the global IT support infrastructure. Manage incidents with sub-millisecond encryption and role-based operational oversight.
            </p>
         </div>

         <div className="flex items-center gap-10 opacity-30 group-hover:opacity-60 transition-opacity">
            <div className="flex items-center gap-3">
               <ShieldCheck className="w-4 h-4 text-indigo-500" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em]">End-to-End Secure</span>
            </div>
            <div className="flex items-center gap-3">
               <Fingerprint className="w-4 h-4 text-indigo-500" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em]">Encrypted Node</span>
            </div>
         </div>
      </div>

      {/* ─── RIGHT PANEL: FORM ─── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-20 relative z-10">
         
         <div className="w-full max-w-[480px]">
            <Card className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[40px] shadow-2xl overflow-hidden">
               <CardContent className="p-10 sm:p-14">
                  
                  <div className="text-center mb-12">
                     <div className="lg:hidden flex justify-center mb-8">
                        <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl">
                           <LifeBuoy className="w-8 h-8 text-white" />
                        </div>
                     </div>
                     <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-4">Command Login</h2>
                     <p className="text-slate-500 font-medium">Verify your authorized personnel credentials.</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-8">
                     
                     <div className="space-y-4">
                        <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">AUTHORIZED EMAIL</Label>
                        <div className="relative group">
                           <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                           <Input 
                              type="email" 
                              placeholder="support_admin@enterprise.com" 
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              className="h-16 pl-16 bg-white/[0.02] border-white/5 rounded-2xl text-white font-bold text-base focus-visible:ring-indigo-500 focus-visible:bg-white/[0.04] transition-all"
                           />
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                           <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">SECURE ACCESS KEY</Label>
                           <Link href="#" className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-400 transition-colors">Emergency Reset?</Link>
                        </div>
                        <div className="relative group">
                           <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                           <Input 
                              type="password" 
                              placeholder="••••••••••••" 
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              className="h-16 pl-16 bg-white/[0.02] border-white/5 rounded-2xl text-white font-bold text-base focus-visible:ring-indigo-500 focus-visible:bg-white/[0.04] transition-all"
                           />
                        </div>
                     </div>

                     <div className="pt-6">
                        <Button 
                           type="submit" 
                           disabled={loading}
                           className="w-full h-18 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/20 text-[12px] transition-all active:scale-[0.98] group relative overflow-hidden rounded-[26px] border-none py-6"
                        >
                           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                           {loading ? (
                              <><Loader2 className="w-6 h-6 mr-4 animate-spin" /> VERIFYING IDENTITY...</>
                           ) : (
                              <><ShieldCheck className="w-6 h-6 mr-4 group-hover:scale-110 transition-transform" /> Access Command Hub</>
                           )}
                        </Button>
                     </div>
                  </form>
               </CardContent>
            </Card>

            <div className="mt-12 text-center space-y-6">
               <p className="text-slate-500 font-medium">
                  Unauthorized access is strictly monitored. 
                  <Link href="/register" className="text-indigo-500 font-black uppercase text-[10px] tracking-[0.2em] ml-4 hover:text-indigo-400 transition-all border-b-2 border-indigo-500/20 pb-0.5">
                     Request Access
                     <ArrowRight className="inline-block w-3.5 h-3.5 ml-2" />
                  </Link>
               </p>
               
               <div className="flex items-center justify-center gap-8 opacity-20">
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-100">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                     Production Stable
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-100">
                     <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                     v2.0.4-Modern
                  </div>
               </div>
            </div>
         </div>

      </div>

    </div>
  );
}
