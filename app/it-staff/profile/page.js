'use client'

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { uploadAvatar } from "@/lib/uploadAvatar"
import { 
  Loader2, 
  Camera, 
  User, 
  Mail, 
  Lock,
  ChevronLeft,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import Link from "next/link"

export default function ITStaffProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  
  // Form fields
  const [fullName, setFullName] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // useRef to prevent double fetch in React Strict Mode
  const hasFetched = useRef(false)

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true

    fetchProfileData()
  }, [])

  async function fetchProfileData() {
    setLoading(true)
    setError(null)
    
    try {
      // Use getSession() instead of getUser() to avoid lock conflicts
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) throw sessionError
      
      if (!session?.user) {
        router.push("/login")
        return
      }

      const currentUser = session.user
      setUser(currentUser)

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single()
      
      if (profileError) throw profileError
      
      if (data) {
        setProfile(data)
        setFullName(data.full_name || "")
      }
    } catch (err) {
      console.error("Profile load error:", err.message)
      setError("Could not load profile. Please refresh.")
      toast.error("Session error. Please try logging in again.")
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return "?"
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // UPLOAD AVATAR
  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0]
    if (!file || !user) return

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
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName.trim() })
        .eq("id", user.id)

      if (error) throw error
      
      toast.success("Name updated!")
      setProfile({ ...profile, full_name: fullName.trim() })
    } catch (err) {
      toast.error("Failed to update name.")
    } finally {
      setUpdating(false)
    }
  }

  // UPDATE PASSWORD
  async function handleUpdatePassword() {
    if (!newPassword) return toast.error("Please enter a new password.")
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match.")
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters.")

    setUpdating(true)
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      })

      if (error) throw error

      toast.success("Password updated!")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      toast.error(err.message || "Failed to update password.")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600 mb-4" />
        <p className="text-slate-500 font-medium">Loading profile...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <p className="text-red-500 font-semibold mb-4">{error}</p>
        <Button onClick={() => {
          hasFetched.current = false;
          fetchProfileData();
        }} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 min-h-screen bg-slate-100 max-w-5xl mx-auto animate-in fade-in duration-500 pb-20">
      
      <div className="flex items-center gap-4">
        <Link href="/it-staff">
          <Button variant="ghost" className="text-slate-500 hover:text-slate-900 font-semibold px-0">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Profile Card */}
        <div className="lg:col-span-4">
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col items-center text-center space-y-4">
            <div className="relative inline-block">
              <Avatar className="h-24 w-24 ring-4 ring-slate-100">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-blue-600 text-white text-2xl font-bold">
                  {getInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>

              <label htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 h-8 w-8 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-50 transition shadow-sm">
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                ) : (
                  <Camera className="h-4 w-4 text-slate-600" />
                )}
              </label>
              <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploading} />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 truncate w-full px-2">{profile?.full_name}</h2>
              <p className="text-base text-slate-500 truncate w-full px-2">{user?.email}</p>
            </div>
            
            <div className="pt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                IT Staff
              </span>
            </div>
          </Card>
        </div>

        {/* Forms */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              Edit Profile
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Full Name</Label>
                <Input 
                  type="text" 
                  className="h-11 text-base border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-500 rounded-xl transition"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <Button onClick={handleUpdateName} disabled={updating} className="w-full h-11 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition">
                {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
              </Button>
            </div>
          </Card>
          
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-500" />
              Account Security
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">New Password</Label>
                  <Input type="password" placeholder="Min. 6 characters" className="h-11 text-base border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-500 rounded-xl transition" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Confirm Password</Label>
                  <Input type="password" placeholder="Repeat password" className="h-11 text-base border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-500 rounded-xl transition" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
              </div>
              <Button onClick={handleUpdatePassword} disabled={updating} className="w-full h-11 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition">
                {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
