'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
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
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      })

      if (authError) throw authError

      // Get role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profileError) throw profileError

      // Redirect by role
      if (profile?.role === 'admin') {
        router.push('/admin')
      } else if (profile?.role === 'it_staff') {
        router.push('/it-staff')
      } else if (profile?.role === 'employee') {
        router.push('/employee')
      } else {
        setError('Your account role is not set up. Please contact your IT administrator.')
      }

    } catch (err) {
      // Show plain language to user
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
      setLoading(false)
    }
  }

  // Features shown on left panel
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
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-white selection:bg-blue-100">

      {/* ================================ */}
      {/* LEFT — Branding Panel            */}
      {/* ================================ */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-16 relative overflow-hidden">

        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none -translate-x-1/4 translate-y-1/4" />

        {/* Logo */}
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

        {/* Main headline */}
        <div className="relative z-10 space-y-12">
          <div className="space-y-6">

            {/* Online status pill */}
            <div className="inline-flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-full px-4 py-2">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
              <span className="text-sm text-slate-300 font-semibold tracking-wide">
                Support is available
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-5xl font-bold text-white leading-[1.1] tracking-tight">
              We're here to<br />
              <span className="text-blue-400">help you.</span>
            </h2>

            {/* Subtext — simple language */}
            <p className="text-slate-400 text-xl leading-relaxed max-w-md">
              Having a problem with your computer or software? Sign in and let us know. We'll take care of it.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-4 max-w-lg">
            {features.map((f, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 backdrop-blur-md hover:bg-white/10 transition-colors group">
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

        {/* Bottom */}
        <div className="relative z-10 pt-8 border-t border-white/5">
          <p className="text-slate-500 text-sm font-medium">
            © {new Date().getFullYear()} IT Helpdesk System
          </p>
        </div>
      </div>

      {/* ================================ */}
      {/* RIGHT — Login Form               */}
      {/* ================================ */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-12 lg:px-20 relative">
        
        {/* Subtle pattern background for the right side */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-3 mb-12">
          <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <MonitorCheck className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900 tracking-tight">
            IT Helpdesk
          </span>
        </div>

        <div className="w-full max-w-md space-y-10 relative z-10">

          {/* Heading — simple and warm */}
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
              Welcome back
            </h2>
            <p className="text-lg text-slate-500">
              Sign in to your account
            </p>
          </div>

          {/* Form card */}
          <Card className="border-slate-200 shadow-xl shadow-slate-200/50 rounded-[2rem] bg-white overflow-hidden border">
            <CardContent className="p-10">
              <form onSubmit={handleLogin} className="space-y-6">

                {/* Email field */}
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

                {/* Password field */}
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
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                    </button>
                  </div>
                </div>

                {/* Error message — plain language */}
                {error && (
                  <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 font-bold leading-relaxed">
                      {error}
                    </p>
                  </div>
                )}

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-600/10 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-4"
                >
                  {loading ? (
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

          {/* Footer — helpful not scary */}
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
