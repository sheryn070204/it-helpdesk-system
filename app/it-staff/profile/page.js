'use client'

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { uploadAvatar } from "@/lib/uploadAvatar"
import { UserAvatar } from "@/components/UserAvatar"
import { 
  Loader2, 
  Camera, 
  User, 
  Mail, 
  Lock,
  ChevronLeft,
  Wrench
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import Link from "next/link"

export default function ITStaffProfilePage() {
  const [profile, setProfile] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // Form fields
  const [fullName, setFullName] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    fetchProfileData()
  }, [])

  async function fetchProfileData() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      
      if (!error && data) {
        setUser(user)
        setProfile(data)
        setFullName(data.full_name || "")
      }
    }
    setLoading(false)
  }

  // UPLOAD AVATAR
  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const publicUrl = await uploadAvatar(user.id, file)
      setProfile({ ...profile, avatar_url: publicUrl })
      toast.success("Profile picture updated!")
    } catch (err) {
      toast.error(err.message || "Failed to upload. Try again.")
    } finally {
      setUploading(false)
    }
  }

  // UPDATE NAME
  async function handleUpdateName() {
    if (!fullName.trim()) return toast.error("Name cannot be empty.")
    
    setUpdating(true)
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id)

    if (error) {
      toast.error("Failed to update name.")
    } else {
      toast.success("Name updated!")
      setProfile({ ...profile, full_name: fullName })
    }
    setUpdating(false)
  }

  // UPDATE PASSWORD
  async function handleUpdatePassword() {
    if (!newPassword) return toast.error("Please enter a new password.")
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match.")
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters.")

    setUpdating(true)
    const { error } = await supabase.auth.updateUser({ 
      password: newPassword 
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Password updated!")
      setNewPassword("")
      setConfirmPassword("")
    }
    setUpdating(false)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-500 mb-4" />
        <p className="text-slate-500 text-sm">Loading engineer profile...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      
      <Link href="/it-staff" className="text-slate-400 hover:text-white text-sm mb-8 flex items-center gap-2 group transition-colors">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ─── LEFT COLUMN: PROFILE CARD ─── */}
        <div className="lg:col-span-1">
          <Card className="bg-[#222836] border-[#2E3545] rounded-2xl p-8 text-center flex flex-col items-center shadow-2xl">
            
            <div className="relative inline-block mb-5">
              <div className="relative">
                <UserAvatar 
                  avatarUrl={profile?.avatar_url} 
                  fullName={profile?.full_name} 
                  size="xl"
                  className="border-4 border-indigo-500/30"
                />
                
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              
              <label htmlFor="avatar-upload" className="cursor-pointer">
                <div className="absolute bottom-1 right-1 w-9 h-9 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center border-2 border-[#222836] transition-colors cursor-pointer shadow-lg shadow-indigo-600/30">
                  <Camera className="w-4 h-4 text-white" />
                </div>
                <input 
                  type="file" 
                  id="avatar-upload" 
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
              </label>
            </div>
            
            <h2 className="text-2xl font-bold text-white mt-4 truncate w-full">{profile?.full_name}</h2>
            <p className="text-[#8FA3BF] text-sm mt-1 truncate w-full">{user?.email}</p>
            
            <div className="mt-4">
              <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-400/20 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                IT SUPPORT ENGINEER
              </span>
            </div>
            
            <p className="text-slate-500 text-[10px] uppercase tracking-tighter mt-6 font-medium">
              Registered Engineer since {new Date(profile?.created_at).toLocaleDateString()}
            </p>
          </Card>
        </div>

        {/* ─── RIGHT COLUMN: DETAILS ─── */}
        <div className="lg:col-span-2 space-y-6">
          
          <Card className="bg-[#222836] border-[#2E3545] rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-400" />
              Edit Profile
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#8FA3BF] ml-1">Full Name</Label>
                <Input 
                  type="text" 
                  className="w-full bg-[#1A2030] border border-[#374151] text-[#E2E8F0] rounded-xl px-4 py-3 h-12 focus:border-indigo-500"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleUpdateName}
                disabled={updating}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 h-12 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
              >
                {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
              </Button>
            </div>
          </Card>
          
          <Card className="bg-[#222836] border-[#2E3545] rounded-2xl p-6 shadow-xl">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-400" />
                Account Security
              </h3>
              <p className="text-[#8FA3BF] text-sm mt-1 font-medium">Update your password to stay secure.</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#8FA3BF] ml-1">New Password</Label>
                <Input 
                  type="password" 
                  className="w-full bg-[#1A2030] border border-[#374151] text-[#E2E8F0] rounded-xl px-4 py-3 h-12 focus:border-indigo-500"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#8FA3BF] ml-1">Confirm Password</Label>
                <Input 
                  type="password" 
                  className="w-full bg-[#1A2030] border border-[#374151] text-[#E2E8F0] rounded-xl px-4 py-3 h-12 focus:border-indigo-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                />
              </div>
              
              <Button 
                onClick={handleUpdatePassword}
                disabled={updating}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 h-12 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
              >
                {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
              </Button>
            </div>
          </Card>

        </div>
      </div>
    </div>
  )
}
