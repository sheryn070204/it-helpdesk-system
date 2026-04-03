"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User, Lock, Wrench, Mail } from "lucide-react";

export default function ITStaffProfilePage() {
  const [profile, setProfile] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);

  // Password update state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(profileData);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Handle changing user password
  async function handleUpdatePassword(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    setUpdatingPassword(true);
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Security password updated successfully.");
      setNewPassword("");
      setConfirmPassword("");
    }
    setUpdatingPassword(false);
  }

  if (loading) {
    return <div className="p-10 text-slate-400 font-mono">Loading engineer profile...</div>;
  }

  return (
    <div className="max-w-[700px] mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-3 mb-8">
        <Wrench className="w-8 h-8 text-indigo-500" />
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Engineer Profile</h1>
          <p className="text-sm text-slate-400 font-medium mt-1">Manage your IT support account settings.</p>
        </div>
      </div>

      <div className="space-y-8">
        
        {/* SECTION 1: MY PROFILE */}
        <Card className="bg-[#1E293B] border-slate-700">
          <CardHeader className="pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              <CardTitle className="text-white text-lg font-semibold">Personal Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div>
              <Label className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-2 block">Full Name</Label>
              <Input readOnly value={profile?.full_name || ""} className="bg-slate-800 border-slate-700 text-white font-semibold cursor-not-allowed" />
            </div>
            <div>
              <Label className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-2 block">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input readOnly value={userEmail} className="pl-9 bg-slate-800/50 border-slate-700/50 text-slate-300 cursor-not-allowed" />
              </div>
            </div>
            <div>
              <Label className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-2 block">Clearance Level</Label>
              <Badge className="bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/20 font-bold tracking-widest uppercase border border-indigo-500/30">IT Support Engineer</Badge>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 2: ACCOUNT SECURITY */}
        <Card className="bg-[#1E293B] border-slate-700">
          <CardHeader className="pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" />
              <CardTitle className="text-white text-lg font-semibold">Update Password</CardTitle>
            </div>
            <CardDescription className="text-slate-400">Ensure your account remains highly secure.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">New Password</Label>
                <Input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white focus-visible:ring-indigo-500" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Confirm Password</Label>
                <Input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white focus-visible:ring-indigo-500" 
                />
              </div>
              <Button type="submit" disabled={updatingPassword} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold mt-2">
                {updatingPassword ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
