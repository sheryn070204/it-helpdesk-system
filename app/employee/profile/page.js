// Tell the computer this code runs in the browser
'use client'

// Import tools from React and our custom files
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase" // Connection to database
import { uploadAvatar } from "@/lib/uploadAvatar" // Tool to upload photos
import { UserAvatar } from "@/components/UserAvatar" // Profile picture component
// Import icons for the design
import { 
  Loader2, 
  Camera, 
  User, 
  ChevronLeft
} from "lucide-react"
// Import UI components
import { Card } from "@/components/ui/card"
import { toast } from "sonner" // Popup messages
import Link from "next/link"

// This is the Employee Profile page
export default function EmployeeProfilePage() {
  // These "states" remember the profile info and if we are busy
  const [profile, setProfile] = useState(null) // User profile data
  const [user, setUser] = useState(null) // Auth user data
  const [loading, setLoading] = useState(true) // Loading the whole page
  const [uploading, setUploading] = useState(false) // Loading just the photo upload

  // This part runs when the page first opens
  useEffect(() => {
    fetchProfileData()
  }, [])

  // Function to get the user's information from the database
  async function fetchProfileData() {
    setLoading(true)
    // Find out who is logged in
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Get their profile details (like name and photo) from the "profiles" table
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      
      if (!error && data) {
        setUser(user) // Save user info
        setProfile(data) // Save profile info
      }
    }
    setLoading(false)
  }

  // This function runs when the user picks a new photo
  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0] // Get the file they picked
    if (!file) return

    setUploading(true) // Show the loading spinner for upload
    try {
      // Use our helper tool to send the photo to Supabase storage
      const publicUrl = await uploadAvatar(user.id, file)
      // Update the profile picture on the screen immediately
      setProfile({ ...profile, avatar_url: publicUrl })
      toast.success("Profile picture updated!")
    } catch (err) {
      // If something goes wrong, show an error message
      toast.error(err.message || "Failed to upload. Try again.")
    } finally {
      setUploading(false) // Hide the loading spinner
    }
  }

  // If the page is still loading, show a spinner
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-600 mb-4" />
        <p className="text-slate-500 text-sm">Loading your profile...</p>
      </div>
    )
  }

  return (
    // Main container with animation
    <div className="max-w-xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      
      {/* Back button to go to the main dashboard */}
      <Link href="/employee" className="text-slate-400 hover:text-slate-900 text-sm mb-8 flex items-center gap-2 group transition-colors">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>
      
      {/* Profile Card */}
      <Card className="bg-white border-slate-200 rounded-3xl p-10 text-center flex flex-col items-center shadow-xl">
        
        {/* User Icon */}
        <div className="bg-indigo-50 p-3 rounded-full mb-6">
           <User className="w-6 h-6 text-indigo-600" />
        </div>
        
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Profile Picture</h2>
        <p className="text-slate-500 text-sm mb-10 max-w-xs mx-auto">Update your photo to make your tickets more visible to the IT staff.</p>
        
        {/* Profile Picture Area */}
        <div className="relative inline-block mb-8">
          <div className="relative">
            {/* Show the actual avatar image */}
            <UserAvatar 
              avatarUrl={profile?.avatar_url} 
              fullName={profile?.full_name} 
              size="xl"
              className="border-4 border-white shadow-2xl ring-1 ring-slate-100"
            />
            
            {/* If a photo is being uploaded, show a spinner over the image */}
            {uploading && (
              <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            )}
          </div>
          
          {/* Camera Button to change the photo */}
          <label htmlFor="avatar-upload" className="cursor-pointer">
            <div className="absolute bottom-1 right-1 w-11 h-11 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center border-4 border-white transition-all cursor-pointer shadow-xl shadow-indigo-600/20 active:scale-90">
              <Camera className="w-5 h-5 text-white" />
            </div>
            {/* Hidden file input that opens when the camera is clicked */}
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
        
        {/* User Details (Name and Email) */}
        <div className="w-full pt-8 border-t border-slate-50">
           <p className="text-lg font-bold text-slate-900">{profile?.full_name}</p>
           <p className="text-slate-400 text-sm mt-1">{user?.email}</p>
           {/* Employee tag */}
           <div className="mt-4 flex justify-center">
              <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border border-slate-200/50">Employee Account</span>
           </div>
        </div>
      </Card>
      
      {/* Footer message */}
      <p className="text-center text-slate-400 text-[10px] uppercase font-black tracking-widest mt-10 opacity-50">
        Account settings managed by System Admin
      </p>
    </div>
  )
}
