"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Mail, 
  Lock, 
  User, 
  Loader2, 
  LifeBuoy, 
  ShieldCheck, 
  ArrowLeft,
  Sparkles,
  Zap,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success("Identity profile created. Synchronizing node...");
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen flex bg-[#09090b] text-slate-100 selection:bg-indigo-500/30 overflow-hidden relative">
      
      {/* ─── BACKGROUND ACCENTS ─── */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[100px] translate-y-1/3 translate-x-1/4 pointer-events-none" />

      {/* ─── LEFT PANEL: FORM ─── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-20 relative z-10 border-r border-white/5">
         
         <div className="w-full max-w-[520px]">
            <div className="mb-10">
               <Link href="/login">
                  <Button variant="ghost" className="text-slate-500 hover:text-white hover:bg-white/5 font-black text-[10px] uppercase tracking-widest px-4 h-10 rounded-xl group transition-all">
                     <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                     Return to Hub
                  </Button>
               </Link>
            </div>

            <Card className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[40px] shadow-2xl overflow-hidden">
               <CardContent className="p-10 sm:p-14">
                  
                  <div className="text-center mb-12">
                     <div className="lg:hidden flex justify-center mb-8">
                        <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl">
                           <LifeBuoy className="w-8 h-8 text-white" />
                        </div>
                     </div>
                     <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-4 uppercase">Identity Request</h2>
                     <p className="text-slate-500 font-medium">Initialize your authorized personnel profile.</p>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-8">
                     
                     <div className="space-y-4">
                        <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">FULL LEGAL NAME</Label>
                        <div className="relative group">
                           <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                           <Input 
                              placeholder="Johnathan Doe" 
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              required
                              className="h-16 pl-16 bg-white/[0.02] border-white/5 rounded-2xl text-white font-bold text-base focus-visible:ring-indigo-500 focus-visible:bg-white/[0.04] transition-all placeholder:text-slate-700"
                           />
                        </div>
                     </div>

                     <div className="space-y-4">
                        <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">AUTHORIZED EMAIL</Label>
                        <div className="relative group">
                           <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                           <Input 
                              type="email" 
                              placeholder="j.doe@enterprise.com" 
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              className="h-16 pl-16 bg-white/[0.02] border-white/5 rounded-2xl text-white font-bold text-base focus-visible:ring-indigo-500 focus-visible:bg-white/[0.04] transition-all placeholder:text-slate-700"
                           />
                        </div>
                     </div>

                     <div className="space-y-4">
                        <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">SECURE ACCESS KEY</Label>
                        <div className="relative group">
                           <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                           <Input 
                              type="password" 
                              placeholder="Minimum 8 characters" 
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              minLength={8}
                              className="h-16 pl-16 bg-white/[0.02] border-white/5 rounded-2xl text-white font-bold text-base focus-visible:ring-indigo-500 focus-visible:bg-white/[0.04] transition-all placeholder:text-slate-700"
                           />
                        </div>
                     </div>

                     <div className="pt-6">
                        <Button 
                           type="submit" 
                           disabled={loading}
                           className="w-full h-18 bg-white hover:bg-slate-100 text-slate-900 font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/10 text-[12px] transition-all active:scale-[0.98] group relative overflow-hidden rounded-[26px] border-none py-6"
                        >
                           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-600/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                           {loading ? (
                              <><Loader2 className="w-6 h-6 mr-4 animate-spin" /> SYNCHRONIZING NODE...</>
                           ) : (
                              <><ShieldCheck className="w-6 h-6 mr-4 group-hover:scale-110 transition-transform" /> Initialize Identity</>
                           )}
                        </Button>
                     </div>
                  </form>
               </CardContent>
            </Card>

            <div className="mt-10 text-center">
               <p className="text-slate-500 font-medium text-sm">
                  Already have an authorized profile? 
                  <Link href="/login" className="text-indigo-500 font-black uppercase text-[10px] tracking-[0.2em] ml-4 hover:text-indigo-400 transition-all border-b-2 border-indigo-500/20 pb-0.5">
                     Initiate Handshake
                  </Link>
               </p>
            </div>
         </div>
      </div>

      {/* ─── RIGHT PANEL: VISUAL ─── */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-20 relative z-10">
         <div className="flex items-center gap-4 group cursor-default">
            <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:rotate-12 transition-all duration-500">
               <LifeBuoy className="w-7 h-7 text-white" />
            </div>
            <div>
               <p className="text-2xl font-black tracking-tighter leading-none mb-1 text-white">Helpdesk</p>
               <p className="text-indigo-500 text-[10px] font-black uppercase tracking-[0.4em] leading-none">Identity Portal</p>
            </div>
         </div>

         <div className="space-y-12">
            <div className="space-y-4">
               <div className="flex items-center gap-3 text-indigo-500/60">
                  <Sparkles className="w-5 h-5 font-black" />
                  <span className="text-[11px] font-black uppercase tracking-[0.4em]">Enterprise Security Protocols</span>
               </div>
               <h2 className="text-7xl font-black leading-[0.9] tracking-tighter text-white uppercase select-none">
                  JOIN THE <br /> <span className="text-indigo-600">NETWORK</span>
               </h2>
            </div>
            
            <div className="grid grid-cols-1 gap-6 max-w-md">
               <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[32px] hover:border-indigo-600/30 transition-colors">
                  <Zap className="w-6 h-6 text-indigo-500 mb-4" />
                  <h4 className="text-lg font-black text-white mb-2 tracking-tight uppercase">High Priority Triage</h4>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">Our AI-driven engine routes your incidents to the appropriate regional engineers instantly.</p>
               </div>
               <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[32px] hover:border-indigo-600/30 transition-colors">
                  <ShieldAlert className="w-6 h-6 text-indigo-500 mb-4" />
                  <h4 className="text-lg font-black text-white mb-2 tracking-tight uppercase">Secure Operations</h4>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">Identity verification ensures all support data remains within the corporate encrypted network.</p>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-4 opacity-30 text-[9px] font-black uppercase tracking-[0.3em]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Operational Capacity: 100%
         </div>
      </div>

    </div>
  );
}
