// Tell the computer this code runs in the browser
'use client'

// Import tools from React
import { useState, useEffect } from "react"
// Import connection to our database
import { supabase } from "@/lib/supabase"
// Import tool to upload profile pictures
import { uploadAvatar } from "@/lib/uploadAvatar"
// Import UI components and icons
import { UserAvatar } from "@/components/UserAvatar"
import { 
  Loader2, 
  Camera, 
  User, 
  Mail, 
  Lock,
  ChevronLeft,
  Settings,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner" // Small popup messages
import Link from "next/link" // For clickable links

// This is the Admin Profile page
export default function AdminProfilePage() {
  // These "states" remember the user's data and if we are loading or saving
  const [profile, setProfile] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // These remember the info typed in the forms
  const [fullName, setFullName] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  // These remember if we should show or hide the password text
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  // These remember password update status
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  // Run this when the page opens to get the admin's data
  useEffect(() => {
    fetchProfileData()
  }, [])

  // Function to get the current admin's data from the database
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

  // This function handles uploading a new profile picture
  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      // Upload the file to Supabase storage
      const publicUrl = await uploadAvatar(user.id, file)
      // Update the page so the user sees their new picture
      setProfile({ ...profile, avatar_url: publicUrl })
      toast.success("Profile picture updated!")
    } catch (err) {
      toast.error(err.message || "Failed to upload. Try again.")
    } finally {
      setUploading(false)
    }
  }

  // This function saves the new name to the database
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

  // This function handles changing the password securely
  const handleUpdatePassword = async () => {
    setPasswordError(null)
    setPasswordSuccess(false)

    // Check if the admin typed everything correctly
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
      // Step 1: Log in again with the current password to make sure it's correct
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

      // Step 2: Update to the brand new password
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

      // If everything worked, clear the form and show success
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

  // If page is loading, show a spinner
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-500 mb-4" />
        <p className="text-slate-500 text-sm">Loading profile details...</p>
      </div>
    )
  }

  return (
    // Main container with dark mode and animation
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      
      {/* Back button to go to dashboard */}
      <Link href="/admin" className="text-slate-400 hover:text-white text-sm mb-8 flex items-center gap-2 group transition-colors">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ─── LEFT COLUMN: PROFILE PICTURE CARD ─── */}
        <div className="lg:col-span-1">
          <Card className="bg-[#1E2538] border-[#2D3548] rounded-2xl p-8 text-center flex flex-col items-center shadow-2xl">
            
            <div className="relative inline-block mb-5">
              <div className="relative">
                {/* Profile Picture */}
                <UserAvatar 
                  avatarUrl={profile?.avatar_url} 
                  fullName={profile?.full_name} 
                  size="xl"
                  className="border-4 border-indigo-500/30"
                />
                
                {/* Loading spinner for upload */}
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              
              {/* Camera Icon to change picture */}
              <label htmlFor="avatar-upload" className="cursor-pointer">
                <div className="absolute bottom-1 right-1 w-9 h-9 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center border-2 border-[#1E2538] transition-colors cursor-pointer shadow-lg shadow-indigo-600/30">
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
            <p className="text-slate-400 text-sm mt-1 truncate w-full">{user?.email}</p>
            
            <div className="mt-4">
              <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-400/20 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                ADMINISTRATOR
              </span>
            </div>
            
            <p className="text-slate-500 text-[10px] uppercase tracking-tighter mt-6 font-medium">
              Member since {new Date(profile?.created_at).toLocaleDateString()}
            </p>
          </Card>
        </div>

        {/* ─── RIGHT COLUMN: SETTINGS FORMS ─── */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Edit Name Card */}
          <Card className="bg-[#1E2538] border-[#2D3548] rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-400" />
              Edit Profile
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300 ml-1">Full Name</Label>
                <Input 
                  type="text" 
                  className="w-full bg-[#252B3B] border border-[#3D4663] text-white rounded-xl px-4 py-3 h-12 focus:border-indigo-500"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleUpdateName}
                disabled={updating}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 h-12 rounded-xl transition-all active:scale-95"
              >
                {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
              </Button>
            </div>
          </Card>
          
          {/* Account Security (Password) Card */}
          <Card className="bg-[#1E2538] border border-[#2D3548] rounded-2xl shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                <Lock className="h-5 w-5 text-indigo-400"/>
                Account Security
              </CardTitle>
              <p className="text-sm text-slate-400 font-medium mt-1">
                Update your password to stay secure.
              </p>
            </CardHeader>
            <CardContent className="space-y-5 pt-2">

              {/* Current Password Input */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300 ml-1">Current Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none"/>
                  <Input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="w-full bg-[#252B3B] border border-[#3D4663] text-white rounded-xl h-12 pl-12 pr-12 focus:border-indigo-500 transition-colors"
                  />
                  {/* Eye button to show/hide text */}
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                    {showCurrent ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                  </button>
                </div>
              </div>

              {/* New Password Input */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300 ml-1">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none"/>
                  <Input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-[#252B3B] border border-[#3D4663] text-white rounded-xl h-12 pl-12 pr-12 focus:border-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                    {showNew ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                  </button>
                </div>
              </div>

              {/* Confirm New Password Input */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300 ml-1">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none"/>
                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your new password"
                    className="w-full bg-[#252B3B] border border-[#3D4663] text-white rounded-xl h-12 pl-12 pr-12 focus:border-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                    {showConfirm ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                  </button>
                </div>
                {/* Match indicator */}
                {confirmPassword && (
                  <p className={`text-sm font-medium flex items-center gap-1.5 mt-2 ml-1 ${newPassword === confirmPassword ? 'text-emerald-400' : 'text-red-400'}`}>
                    {newPassword === confirmPassword ? (
                      <><CheckCircle className="h-4 w-4"/> Passwords match</>
                    ) : (
                      <><AlertCircle className="h-4 w-4"/> Passwords do not match</>
                    )}
                  </p>
                )}
              </div>

              {/* Error messages if the admin made a mistake */}
              {passwordError && (
                <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mt-4">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5"/>
                  <p className="text-sm text-red-200 font-medium leading-relaxed">{passwordError}</p>
                </div>
              )}

              {/* Success message */}
              {passwordSuccess && (
                <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 mt-4">
                  <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0"/>
                  <p className="text-sm text-emerald-200 font-medium">Password updated successfully!</p>
                </div>
              )}

              {/* Update Button */}
              <Button
                onClick={handleUpdatePassword}
                disabled={updatingPassword}
                className="w-full h-12 mt-6 text-base font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed">
                {updatingPassword ? (
                  <span className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin"/> Updating...</span>
                ) : 'Update Password'}
              </Button>

            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
