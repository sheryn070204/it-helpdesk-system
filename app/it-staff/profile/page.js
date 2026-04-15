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
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
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
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

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
  const handleUpdatePassword = async () => {
    setPasswordError(null)
    setPasswordSuccess(false)

    // --- Validation ---
    if (!currentPassword.trim()) {
      setPasswordError('Please enter your current password.')
      return
    }

    if (!newPassword.trim()) {
      setPasswordError('Please enter a new password.')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match. Please check and try again.')
      return
    }

    if (newPassword === currentPassword) {
      setPasswordError('Your new password must be different from your current password.')
      return
    }

    setUpdatingPassword(true)

    try {
      // Step 1: Re-authenticate with current password
      // This verifies the user knows their current password AND refreshes the session
      const { error: reAuthError } = await supabase.auth.signInWithPassword({
        email: user?.email,
        password: currentPassword.trim(),
      })

      if (reAuthError) {
        if (reAuthError.message?.includes('Invalid login')) {
          setPasswordError('Your current password is incorrect.')
        } else {
          setPasswordError('Could not verify your current password. Please try again.')
        }
        return
      }

      // Step 2: Update to new password
      // NOTE: Supabase's "Secure Password Change" requires the current_password payload
      // parameter. Omitting this results in a 400 Bad Request if the feature is enabled.
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword.trim(),
        current_password: currentPassword.trim()
      })

      if (updateError) {
        if (updateError.message?.includes('same password') || updateError.message?.includes('different from')) {
          setPasswordError('New password must be different from your current one.')
        } else if (updateError.message?.includes('weak') || updateError.message?.includes('short')) {
          setPasswordError('Password is too weak. Please use at least 6 characters with a mix of letters and numbers.')
        } else {
          setPasswordError('Failed to update password. Please try again.')
        }
        return
      }

      // Success
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(false), 4000)

    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Password update error:', err.message)
      }
      setPasswordError('Something went wrong. Please try again.')
    } finally {
      setUpdatingPassword(false)
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
          
          <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Lock className="h-5 w-5 text-slate-600"/>
                Account Security
              </CardTitle>
              <p className="text-sm text-slate-500">
                Update your password to stay secure.
              </p>
            </CardHeader>
            <CardContent className="space-y-5 pt-2">

              {/* Current password */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Current Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none"/>
                  <Input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="h-11 pl-11 pr-11 text-base border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                    {showCurrent ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none"/>
                  <Input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="h-11 pl-11 pr-11 text-base border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                    {showNew ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                  </button>
                </div>
              </div>

              {/* Confirm new password */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none"/>
                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your new password"
                    className="h-11 pl-11 pr-11 text-base border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                    {showConfirm ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                  </button>
                </div>
                {/* Password match indicator */}
                {confirmPassword && (
                  <p className={`text-sm font-medium flex items-center gap-1.5 mt-1 ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                    {newPassword === confirmPassword ? (
                      <><CheckCircle className="h-4 w-4"/> Passwords match</>
                    ) : (
                      <><AlertCircle className="h-4 w-4"/> Passwords do not match</>
                    )}
                  </p>
                )}
              </div>

              {/* Error message */}
              {passwordError && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-4">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5"/>
                  <p className="text-sm text-red-600 font-medium leading-relaxed">{passwordError}</p>
                </div>
              )}

              {/* Success message */}
              {passwordSuccess && (
                <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mt-4">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0"/>
                  <p className="text-sm text-green-700 font-medium">Password updated successfully!</p>
                </div>
              )}

              {/* Submit button */}
              <Button
                onClick={handleUpdatePassword}
                disabled={updatingPassword}
                className="w-full h-11 mt-4 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed">
                {updatingPassword ? (
                  <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/> Updating...</span>
                ) : 'Update Password'}
              </Button>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
