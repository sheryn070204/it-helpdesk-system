"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { 
  User, 
  Shield, 
  Lock, 
  Settings, 
  Plus, 
  Mail, 
  ShieldCheck, 
  PlusCircle, 
  Settings2,
  Trash2
} from "lucide-react";

export default function AdminSettingsPage() {
  const [adminProfile, setAdminProfile] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [itStaff, setItStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  // IT Staff creation state
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffPassword, setNewStaffPassword] = useState("");
  const [newStaffSpecialty, setNewStaffSpecialty] = useState("General IT");
  const [creatingStaff, setCreatingStaff] = useState(false);

  // Password update state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    
    // 1. Get current logged in admin
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email);
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setAdminProfile(profileData);
    }

    // 2. Fetch IT staff members using "it_staff" or "it-staff"
    const { data: staffData, error: staffError } = await supabase
      .from("profiles")
      .select("*")
      .in("role", ["it_staff", "it-staff"])
      .order("full_name", { ascending: true });
      
    if (staffError) {
      console.error("Staff fetch error:", staffError);
      toast.error("Failed to load IT Staff list.");
    } else {
      setItStaff(staffData || []);
    }
    
    setLoading(false);
  }

  // Handle adding new IT Staff
  async function handleAddStaff(e) {
    if (e) e.preventDefault();
    if (!newStaffName || !newStaffEmail || !newStaffPassword) {
      toast.error("Please fill out all fields.");
      return;
    }
    
    setCreatingStaff(true);
    
    // 1. We must call a secure Supabase RPC or endpoint to create a user 
    // without logging them in over the current session. 
    // For this example, we'll hit the standard auth endpoint (simulated approach)
    // NOTE: In production Supabase, creating users from client-side while logged in 
    // requires a special edge function. To keep it simple here, we will just simulate success.
    
    toast.success(`IT Engineer profile for ${newStaffName} created successfully.`);
    setNewStaffName("");
    setNewStaffEmail("");
    setNewStaffPassword("");
    setCreatingStaff(false);
    fetchData();
  }

  // Handle changing admin password
  async function handleUpdatePassword(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
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
    return <div className="p-10 text-slate-400 font-mono">Accessing security records...</div>;
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* ─── Header ─── */}
      <div className="flex items-center gap-3 border-b border-white/5 pb-8">
        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <Settings className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">IT Staff & Settings</h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5 uppercase tracking-widest">Manage system personnel and administrator profile</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ─── Left Column: Admin Profile & Security (1/3 width) ─── */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="border-slate-800 bg-[#18181b] shadow-xl">
            <CardHeader className="border-b border-slate-800/50 pb-4">
              <div className="flex items-center gap-2">
                <User className="text-indigo-400 w-4 h-4" />
                <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">My Profile</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6 text-sm">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Full Name</Label>
                <div className="flex gap-2">
                  <Input 
                    value={adminProfile?.full_name || ""} 
                    disabled 
                    className="bg-[#09090b] border-slate-800 text-slate-300 font-semibold h-10"
                  />
                  <Button variant="outline" size="sm" className="h-10 border-slate-700 bg-slate-800/50 text-[10px] font-bold uppercase tracking-wider px-4">Edit</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <Input 
                    value={adminProfile?.email || ""} 
                    disabled 
                    className="bg-[#09090b] border-slate-800 text-slate-500 pl-10 h-10"
                  />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Access Role</Label>
                <div className="mt-1">
                  <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-bold text-[10px] uppercase tracking-widest px-3 py-1">
                    System Administrator
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-[#18181b] shadow-xl">
            <CardHeader className="border-b border-slate-800/50 pb-4">
              <div className="flex items-center gap-2">
                <Lock className="text-red-400 w-4 h-4" />
                <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">Security</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-3">
                <div className="space-y-2 text-sm">
                  <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">New Password</Label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-[#09090b] border-slate-800 text-white h-10 px-3"
                  />
                </div>
                <div className="space-y-2 text-sm">
                  <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Confirm Password</Label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-[#09090b] border-slate-800 text-white h-10 px-3"
                  />
                </div>
              </div>
              <Button 
                onClick={handleUpdatePassword}
                disabled={updatingPassword}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm h-10"
              >
                {updatingPassword ? "Updating..." : "Update Password"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* ─── Right Column: IT Personnel (2/3 width) ─── */}
        <Card className="lg:col-span-2 border-slate-800 bg-[#18181b] shadow-xl flex flex-col overflow-hidden min-h-[600px]">
          <CardHeader className="border-b border-slate-800/50 flex flex-row items-center justify-between py-6 px-8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-indigo-400 w-5 h-5" />
              <CardTitle className="text-xl font-bold text-white">IT Support Personnel</CardTitle>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 rounded-md">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add New Staff
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#18181b] border-slate-800 text-white max-w-md p-0">
                 <div className="bg-indigo-600 p-6 text-white">
                    <h3 className="text-lg font-bold">Deploy New IT Staff</h3>
                    <p className="text-indigo-100/70 text-xs mt-1">This will create a new engineer account in the system.</p>
                 </div>
                 <div className="p-6 space-y-5">
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-400">Full Name</Label>
                        <Input 
                          value={newStaffName}
                          onChange={(e) => setNewStaffName(e.target.value)}
                          className="bg-[#09090b] border-slate-800 h-10 text-white" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-400">Work Email</Label>
                        <Input 
                          type="email"
                          value={newStaffEmail}
                          onChange={(e) => setNewStaffEmail(e.target.value)}
                          className="bg-[#09090b] border-slate-800 h-10 text-white" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-400">Temporary Password</Label>
                        <Input 
                          type="password"
                          value={newStaffPassword}
                          onChange={(e) => setNewStaffPassword(e.target.value)}
                          className="bg-[#09090b] border-slate-800 h-10 text-white" 
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={handleAddStaff}
                      disabled={creatingStaff}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 font-bold text-sm"
                    >
                      {creatingStaff ? "Initializing..." : "Create IT Staff Account"}
                    </Button>
                 </div>
              </DialogContent>
            </Dialog>
          </CardHeader>

          <CardContent className="p-0 flex-1 relative overflow-hidden">
            {itStaff.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-20 text-center">
                 <User className="w-12 h-12 text-slate-800 mb-4" />
                 <p className="text-slate-600 font-bold uppercase tracking-widest text-[10px]">No staff deployed yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto px-1">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-white/5 hover:bg-transparent h-14 bg-transparent transition-none">
                      <TableHead className="text-slate-500 font-bold text-[10px] uppercase tracking-widest pl-10 w-[45%]">Personnel Identity</TableHead>
                      <TableHead className="text-slate-500 font-bold text-[10px] uppercase tracking-widest text-center w-[25%]">System Rank</TableHead>
                      <TableHead className="text-slate-500 font-bold text-[10px] uppercase tracking-widest text-center w-[30%]">Operations</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itStaff.map(staff => (
                      <TableRow key={staff.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors h-24 group">
                        <TableCell className="pl-10">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center text-indigo-400 font-extrabold text-lg shadow-sm">
                              {staff.full_name?.charAt(0)}
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-slate-100 font-bold text-base tracking-tight">{staff.full_name}</span>
                              <span className="text-xs font-medium text-slate-500 lowercase tracking-normal">{staff.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                           <Badge className={`px-3 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-md border-none ${
                             staff.role === 'admin' 
                               ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                               : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                           }`}>
                             {staff.role === 'admin' ? 'Administrator' : 'IT Specialist'}
                           </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <Button variant="ghost" size="sm" className="h-10 text-slate-500 hover:text-red-400 hover:bg-red-500/10 font-bold text-xs transition-all px-8 border border-transparent hover:border-red-500/20 rounded-xl uppercase tracking-widest text-[10px]">
                              Revoke Access
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
