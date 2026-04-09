'use client'

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { uploadAvatar } from "@/lib/uploadAvatar"
import { UserAvatar } from "@/components/UserAvatar"
import { 
  Loader2, 
  Camera, 
  User, 
  ChevronLeft
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"

export default function EmployeeProfilePage() {
  const [profile, setProfile] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-600 mb-4" />
        <p className="text-slate-500 text-sm">Loading your profile...</p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      
      <Link href="/employee" className="text-slate-400 hover:text-slate-900 text-sm mb-8 flex items-center gap-2 group transition-colors">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>
      
      <Card className="bg-white border-slate-200 rounded-3xl p-10 text-center flex flex-col items-center shadow-xl">
        
        <div className="bg-indigo-50 p-3 rounded-full mb-6">
           <User className="w-6 h-6 text-indigo-600" />
        </div>
        
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Profile Picture</h2>
        <p className="text-slate-500 text-sm mb-10 max-w-xs mx-auto">Update your photo to make your tickets more visible to the IT staff.</p>
        
        <div className="relative inline-block mb-8">
          <div className="relative">
            <UserAvatar 
              avatarUrl={profile?.avatar_url} 
              fullName={profile?.full_name} 
              size="xl"
              className="border-4 border-white shadow-2xl ring-1 ring-slate-100"
            />
            
            {uploading && (
              <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            )}
          </div>
          
          <label htmlFor="avatar-upload" className="cursor-pointer">
            <div className="absolute bottom-1 right-1 w-11 h-11 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center border-4 border-white transition-all cursor-pointer shadow-xl shadow-indigo-600/20 active:scale-90">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <input 
              type="file" 
              id="avatar-upload" 
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={uploading}
            />
          </label>
        </div>
        
        <div className="w-full pt-8 border-t border-slate-50">
           <p className="text-lg font-bold text-slate-900">{profile?.full_name}</p>
           <p className="text-slate-400 text-sm mt-1">{user?.email}</p>
           <div className="mt-4 flex justify-center">
              <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border border-slate-200/50">Employee Account</span>
           </div>
        </div>
      </Card>
      
      <p className="text-center text-slate-400 text-[10px] uppercase font-black tracking-widest mt-10 opacity-50">
        Account settings managed by System Admin
      </p>
    </div>
  )
}
