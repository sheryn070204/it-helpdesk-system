// Tell the computer this code runs in the browser
'use client'

// Import all the tools we need from React and Next.js
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation" // For changing pages
import { supabase } from "@/lib/supabase" // Connection to our database
import { uploadAvatar } from "@/lib/uploadAvatar" // Helper to upload profile pictures
// Import icons for a better looking UI
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
// Import UI components (boxes, buttons, inputs, etc.)
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner" // For small popup messages
import Link from "next/link"

// Main function for the IT Staff Profile page
export default function ITStaffProfilePage() {
  const router = useRouter() // Tool to change pages
  
  // These "states" remember the profile info and if we are busy
  const [profile, setProfile] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // Is the page still loading?
  const [updating, setUpdating] = useState(false) // Is the name being updated?
  const [uploading, setUploading] = useState(false) // Is a picture being uploaded?
  const [error, setError] = useState(null) // Stores any error messages
  
  // Form fields for editing profile info
  const [fullName, setFullName] = useState("") // Remembers the name typed in
  const [currentPassword, setCurrentPassword] = useState("") // Remembers current password
  const [newPassword, setNewPassword] = useState("") // Remembers new password
  const [confirmPassword, setConfirmPassword] = useState("") // Remembers confirmed password
  
  // Toggles to show/hide the password text
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  
  // States for password update status
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  // This prevents the page from loading data twice
  const hasFetched = useRef(false)

  // Run this when the page first opens
  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    fetchProfileData()
  }, [])

  // Function to get the IT Staff's profile data from the database
  async function fetchProfileData() {
    setLoading(true)
    setError(null)
    
    try {
      // Find out who is currently logged in
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) throw sessionError
      
      if (!session?.user) {
        router.push("/login"); // If not logged in, go back to login
        return
      }

      const currentUser = session.user
      setUser(currentUser)

      // Fetch the detailed profile (like full name and avatar)
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

  // Helper to get initials if there is no profile picture
  const getInitials = (name) => {
    if (!name) return "?"
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // This function runs when the user selects a NEW profile picture
  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploading(true)
    try {
      // Upload the picture to our storage folder
      const publicUrl = await uploadAvatar(user.id, file)
      // Update the local state so the picture changes immediately on screen
      setProfile({ ...profile, avatar_url: publicUrl })
      toast.success("Profile picture updated!")
    } catch (err) {
      toast.error(err.message || "Failed to upload. Try again.")
    } finally {
      setUploading(false)
    }
  }

  // This function runs when the "Save Changes" button is clicked for the name
  async function handleUpdateName() {
    if (!fullName.trim()) return toast.error("Name cannot be empty.")
    
    setUpdating(true)
    try {
      // Update the name in our profiles table
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

  // This function handles changing the password safely
  const handleUpdatePassword = async () => {
    setPasswordError(null)
    setPasswordSuccess(false)

    // --- Check if all fields are filled correctly ---
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
      // Step 1: Re-sign in with current password to make sure it is really the user
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

      // Step 2: Update to the NEW password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword.trim(),
        current_password: currentPassword.trim()
      })

      if (updateError) {
        setPasswordError('Failed to update password. Please try again.')
        return
      }

      // If everything worked, show success and clear the fields
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(false), 4000)

    } catch (err) {
      setPasswordError('Something went wrong. Please try again.')
    } finally {
      setUpdatingPassword(false)
    }
  }

  // Show a loading screen while fetching data
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600 mb-4" />
        <p className="text-slate-500 font-medium">Loading profile...</p>
      </div>
    )
  }

  // Show an error message if loading failed
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
    // Main container for the profile page
    <div className="p-6 space-y-6 min-h-screen bg-slate-100 max-w-5xl mx-auto animate-in fade-in duration-500 pb-20">
      
      {/* Back button to go to dashboard */}
      <div className="flex items-center gap-4">
        <Link href="/it-staff">
          <Button variant="ghost" className="text-slate-500 hover:text-slate-900 font-semibold px-0">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ─── LEFT COLUMN: PROFILE CARD ─── */}
        <div className="lg:col-span-4">
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col items-center text-center space-y-4">
            {/* Avatar section with upload button */}
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

        {/* ─── RIGHT COLUMN: FORMS ─── */}
        <div className="lg:col-span-8 space-y-6">
          {/* Edit Name Section */}
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
          
          {/* Change Password Section */}
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

              {/* Input for Current Password */}
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

              {/* Input for New Password */}
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

              {/* Input for Confirming New Password */}
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
                {/* Match indicator text */}
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

              {/* Show error if update failed */}
              {passwordError && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-4">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5"/>
                  <p className="text-sm text-red-600 font-medium leading-relaxed">{passwordError}</p>
                </div>
              )}

              {/* Show success if password changed */}
              {passwordSuccess && (
                <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mt-4">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0"/>
                  <p className="text-sm text-green-700 font-medium">Password updated successfully!</p>
                </div>
              )}

              {/* Button to save the new password */}
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
