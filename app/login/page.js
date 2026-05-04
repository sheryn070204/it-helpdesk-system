// Tell the computer this code runs in the browser
'use client'

// Import tools from React and Next.js
import { useState } from 'react'
import { useRouter } from 'next/navigation' // Tool to move between pages
import { supabase } from '@/lib/supabase' // Connection to our database
// Import UI components (buttons, inputs, etc.)
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
// Import icons for the login screen
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  MonitorCheck,
  Headphones,
  Bell,
  CheckCircle,
} from 'lucide-react'
import { toast } from "sonner" // For popup messages

// This is the Login Page function
export default function LoginPage() {
  const router = useRouter() // Tool to change the page

  // These "states" remember what the user types and what is happening
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null) // Remembers if something went wrong

  // This function runs when the "Sign In" button is clicked
  const handleLogin = async (e) => {
    e.preventDefault() // Stop loading
    setError(null)
    setLoading(true)

    try {
      // 1. Ask Supabase to log the user in with email and password
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(), // Clean up the email text
        password: password.trim(), // Clean up the password text
      })

      // If the database says NO, stop here and show the error
      if (authError) throw authError

      // 2. If login worked, find out what job (role) this user has
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id) // Find the person using their special ID
        .single()

      // If we can't find their role, show an error
      if (profileError) throw profileError

      // 3. Move the user to the correct dashboard based on their role
      if (profile?.role === 'admin') {
        router.push('/admin')
      } else if (profile?.role === 'it-staff') {
        router.push('/it-staff')
      } else if (profile?.role === 'employee') {
        router.push('/employee')
      } else {
        setError('Your account role is not set up. Please contact your IT administrator.')
      }

    } catch (err) {
      // If something went wrong, show a simple message the user can understand
      if (
        err.message?.includes('Invalid login') ||
        err.message?.includes('invalid_grant') ||
        err.message?.includes('Invalid credentials')
      ) {
        setError('Wrong email or password. Please check and try again.')
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Your account needs to be confirmed. Please contact your IT administrator.')
      } else if (err.message?.includes('User not found')) {
        setError('No account found with that email. Please check your email address.')
      } else if (err.message?.includes('Too many requests') || err.status === 429) {
        setError('Too many attempts. Please wait a few minutes and try again.')
      } else {
        setError('Could not sign in. Please try again or contact IT support.')
      }
    } finally {
      setLoading(false) // Stop the loading spinner
    }
  }

  // A list of cool things the app can do, shown on the left side
  const features = [
    {
      icon: MonitorCheck,
      title: 'Submit IT Requests',
      desc: 'Report any computer or software issue easily',
    },
    {
      icon: Bell,
      title: 'Get Notified',
      desc: 'Know when your request is being worked on',
    },
    {
      icon: Headphones,
      title: 'Fast IT Support',
      desc: 'Our IT team will get back to you quickly',
    },
    {
      icon: CheckCircle,
      title: 'Track Progress',
      desc: 'See the status of all your requests',
    },
  ]

  return (
    // The main container that splits the screen into left and right
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-white selection:bg-blue-100">

      {/* LEFT SIDE — Dark panel with branding and features */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-16 relative overflow-hidden">

        {/* Decorative glowing circles in the background */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none -translate-x-1/4 translate-y-1/4" />

        {/* The Logo at the top */}
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <MonitorCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                IT Helpdesk
              </h1>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                Support System
              </p>
            </div>
          </div>
        </div>

        {/* The main headline and explanation */}
        <div className="relative z-10 space-y-12">
          <div className="space-y-6">

            {/* Small pill that says support is online */}
            <div className="inline-flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-full px-4 py-2">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
              <span className="text-sm text-slate-300 font-semibold tracking-wide">
                Support is available
              </span>
            </div>

            {/* Big title text */}
            <h2 className="text-5xl font-bold text-white leading-[1.1] tracking-tight">
              We're here to<br />
              <span className="text-blue-400">help you.</span>
            </h2>

            {/* Friendly explanation */}
            <p className="text-slate-400 text-xl leading-relaxed max-w-md">
              Having a problem with your computer or software? Sign in and let us know. We'll take care of it.
            </p>
          </div>

          {/* Grid showing the features of the app */}
          <div className="grid grid-cols-2 gap-4 max-w-lg">
            {features.map((f, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 backdrop-blur-md hover:bg-white/10 transition-colors group">
                {/* The icon for each feature */}
                <div className="h-10 w-10 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <f.icon className="h-5 w-5 text-blue-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">
                    {f.title}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Copyright text at the bottom */}
        <div className="relative z-10 pt-8 border-t border-white/5">
          <p className="text-slate-500 text-sm font-medium">
            © {new Date().getFullYear()} IT Helpdesk System
          </p>
        </div>
      </div>

      {/* RIGHT SIDE — The actual login form */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-12 lg:px-20 relative">

        {/* Subtle dots pattern in the background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        {/* Small logo shown only on mobile phones */}
        <div className="flex lg:hidden items-center gap-3 mb-12">
          <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <MonitorCheck className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900 tracking-tight">
            IT Helpdesk
          </span>
        </div>

        {/* The Login Box */}
        <div className="w-full max-w-md space-y-10 relative z-10">

          {/* Welcoming text */}
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
              Welcome back
            </h2>
            <p className="text-lg text-slate-500">
              Sign in to your account
            </p>
          </div>

          {/* The main white card containing the form */}
          <Card className="border-slate-200 shadow-xl shadow-slate-200/50 rounded-[2rem] bg-white overflow-hidden border">
            <CardContent className="p-10">
              <form onSubmit={handleLogin} className="space-y-6">

                {/* Email Address Input */}
                <div className="space-y-2.5">
                  <Label htmlFor="email" className="text-sm font-bold text-slate-700 ml-1">
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="h-14 pl-12 text-base border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 rounded-2xl transition-all font-medium placeholder:text-slate-400"
                      disabled={loading}
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <Label htmlFor="password" className="text-sm font-bold text-slate-700">
                      Password
                    </Label>
                    <button
                      type="button"
                      onClick={() => router.push('/forgot-password')}
                      className="text-sm text-blue-600 hover:text-blue-700 transition font-bold"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="h-14 pl-12 pr-12 text-base border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 rounded-2xl transition-all font-medium placeholder:text-slate-400"
                      disabled={loading}
                      autoComplete="current-password"
                    />
                    {/* Button to show or hide the password dots */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Show a red error box if something went wrong */}
                {error && (
                  <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 font-bold leading-relaxed">
                      {error}
                    </p>
                  </div>
                )}

                {/* The Login Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-600/10 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-4"
                >
                  {loading ? (
                    // Show a spinner and "Signing in..." while we wait
                    <span className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </Button>

              </form>
            </CardContent>
          </Card>

          {/* Helpful text at the bottom */}
          <div className="text-center space-y-4">
            <p className="text-slate-500 font-medium">
              Having trouble signing in?{' '}
              <button className="text-blue-600 font-bold hover:underline">
                Contact your IT administrator
              </button>
            </p>
          </div>

        </div>
      </div>
    </main>
  )
}
