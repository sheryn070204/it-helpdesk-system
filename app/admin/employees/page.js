// Tell the computer this code runs in the browser
"use client";

// Import tools from React
import { useState, useEffect } from "react";
// Import connection to our database
import { supabase } from "@/lib/supabase";
// Import icons for the design
import { 
  Users, 
  Search, 
  Loader2, 
  Plus,
  User
} from "lucide-react";
// Import clickable links and UI components
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Import tools to show a "pop-up" window for adding new people
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"; // Small popup messages
import { UserAvatar } from "@/components/UserAvatar";

// This is the Admin Employees Management page
export default function AdminEmployees() {
  // These "states" remember the list of users and if we are loading
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(""); // Remember what the admin is searching for
  
  // These remember the info for the "Add New Employee" form
  const [isOpening, setIsOpening] = useState(false); // If the popup is open
  const [newName, setNewName] = useState(""); // Name for the new person
  const [newEmail, setNewEmail] = useState(""); // Email for the new person
  const [newPass, setNewPass] = useState(""); // Password for the new person
  const [creating, setCreating] = useState(false); // If we are busy creating the account

  // Run this when the page opens to get the list of employees
  useEffect(() => {
    fetchUsers();
  }, []);

  // Function to get ALL employees from the database
  async function fetchUsers() {
    setLoading(true);
    // FETCH ONLY users whose role is "employee"
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "employee")
      .order("full_name", { ascending: true });

    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  }

  // This function creates a brand new employee account
  async function handleAddEmployee(e) {
    e.preventDefault(); // Stop the page from refreshing
    setCreating(true);

    try {
      // Create the account in Supabase Authentication
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: newEmail,
        password: newPass,
        options: {
          data: {
            full_name: newName,
            role: 'employee' // Make sure they are an employee
          }
        }
      });

      if (signUpError) throw signUpError;

      // Show success message and clear the form
      toast.success("Employee account created!");
      setIsOpening(false);
      setNewName("");
      setNewEmail("");
      setNewPass("");
      fetchUsers(); // Refresh the list
    } catch (err) {
      // Show error if something went wrong
      toast.error(err.message || "Failed to create account.");
    } finally {
      setCreating(false);
    }
  }

  // Filter the list based on the search box
  const filteredUsers = users.filter((u) => {
    return u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
           u.email?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    // Main container with spacing
    <div className="space-y-8 pb-20">
      
      {/* ─── HEADER (Title and Add Button) ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Employees</h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">Manage your regular staff members.</p>
        </div>
        
        {/* "Add Employee" Pop-up Window */}
        <Dialog open={isOpening} onOpenChange={setIsOpening}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center gap-2 px-6 h-12 shadow-lg transition-transform active:scale-95">
              <Plus className="w-5 h-5" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#111113] border-white/5 text-white rounded-[32px] p-8 max-w-[420px] shadow-2xl">
            <DialogHeader className="mb-2">
              <DialogTitle className="text-2xl font-black tracking-tight">Add Employee</DialogTitle>
              <DialogDescription className="text-slate-500 font-medium tracking-tight">
                Create a new regular employee account.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddEmployee} className="space-y-5" autoComplete="off">
              {/* Name Input */}
              <div className="space-y-2">
                <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</Label>
                <Input 
                  placeholder="e.g. John Doe"
                  className="bg-[#09090b] border-white/5 h-14 rounded-2xl text-white font-medium focus-visible:ring-emerald-500 shadow-inner px-4" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoComplete="off"
                  data-lpignore="true"
                  required
                />
              </div>
              {/* Email Input */}
              <div className="space-y-2">
                <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</Label>
                <Input 
                  type="email"
                  placeholder="john@example.com"
                  className="bg-[#09090b] border-white/5 h-14 rounded-2xl text-white font-medium focus-visible:ring-emerald-500 shadow-inner px-4"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  autoComplete="new-email"
                  data-lpignore="true"
                  required
                />
              </div>
              {/* Password Input */}
              <div className="space-y-2">
                <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Temporary Password</Label>
                <Input 
                  type="password"
                  placeholder="••••••••"
                  className="bg-[#09090b] border-white/5 h-14 rounded-2xl text-white font-medium focus-visible:ring-emerald-500 shadow-inner px-4"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  autoComplete="new-password"
                  data-lpignore="true"
                  required
                />
              </div>
              <p className="text-slate-500 text-xs italic ml-1">
                * They can log in right away at the login page.
              </p>
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                   type="button" 
                   variant="ghost" 
                   className="flex-1 h-14 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px]"
                   onClick={() => setIsOpening(false)}
                >
                  Cancel
                </Button>
                <Button 
                   type="submit" 
                   className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-95"
                   disabled={creating}
                >
                  {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ─── SEARCH BOX ─── */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input 
            placeholder="Search employees..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-12 bg-[#111827] border-white/10 rounded-xl text-white placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* ─── EMPLOYEE GRID ─── */}
      {loading ? (
        // Loading spinner
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
          <p className="text-slate-500 text-sm">Loading employees...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        // Empty message
        <div className="py-20 text-center bg-[#111113] rounded-2xl border border-white/5">
           <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" />
           <h3 className="text-lg font-bold text-white">No employees found.</h3>
           <p className="text-slate-500 text-sm">Add your first employee to start managing their tickets.</p>
        </div>
      ) : (
        // Grid of employee cards
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="bg-[#1E2538] border-[#2D3548] rounded-2xl p-6 hover:shadow-xl transition-all h-full">
              <div className="flex items-center gap-4 mb-8">
                {/* Profile picture */}
                <UserAvatar 
                  avatarUrl={user.avatar_url} 
                  fullName={user.full_name} 
                  size="md"
                  className="ring-2 ring-emerald-500/20"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-white truncate leading-tight mb-1.5 uppercase tracking-tight">{user.full_name}</h3>
                  <div className="flex">
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-lg shadow-emerald-500/5 flex items-center gap-1.5">
                      <User className="w-3 h-3" /> Employee
                    </span>
                  </div>
                </div>
              </div>

              {/* Link to see only this person's tickets */}
              <div className="flex gap-2 mt-auto">
                <Button 
                  asChild
                  className="w-full h-11 bg-[#111827] hover:bg-[#161d2e] text-emerald-400 hover:text-emerald-300 border border-[#2D3548] hover:border-emerald-500/50 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-none"
                >
                  <Link href={`/admin/tickets?submitted_by=${user.id}`}>View Tickets</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
