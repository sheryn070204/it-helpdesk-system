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
  User,
  AlertCircle,
  Loader2,
  MonitorCheck,
  Zap,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react'
import { toast } from "sonner"
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleRegister = async (e) => {
    e.preventDefault()
    setError(null)

    if (!fullName.trim()) return setError('Please enter your full name.')
    if (!email.trim()) return setError('Please enter your email address.')
    if (!password.trim()) return setError('Please enter a password.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')

    setLoading(true)

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password.trim(),
        options: {
          data: {
            full_name: fullName.trim(),
            role: 'employee', // Default role
          },
        },
      })

      if (authError) throw authError

      toast.success("Account created! Please check your email to confirm.")
      router.push('/login')

    } catch (err) {
      console.error('Registration error:', err)
      setError(err.message || 'Failed to create account. Please try again or contact IT.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-white selection:bg-blue-100">

      {/* ================================ */}
      {/* LEFT — Branding Panel            */}
      {/* ================================ */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-16 relative overflow-hidden">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
        
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
            <div className="inline-flex items-center gap-2.5 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2">
              <span className="text-sm text-blue-400 font-bold uppercase tracking-wider">
                Support made simple
              </span>
            </div>
            <h2 className="text-5xl font-bold text-white leading-[1.1] tracking-tight">
              Get back to work<br />
              <span className="text-blue-400">faster.</span>
            </h2>
            <p className="text-slate-400 text-xl leading-relaxed max-w-sm">
              Join your team's IT support portal to report issues and track resolutions in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 max-w-md">
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm group hover:bg-white/10 transition-colors">
              <div className="h-10 w-10 bg-blue-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="h-5 w-5 text-blue-400" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Fast Response</h4>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">Your requests are automatically routed to the right technicians for immediate help.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm group hover:bg-white/10 transition-colors">
              <div className="h-10 w-10 bg-blue-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-5 w-5 text-blue-400" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Secure & Private</h4>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">All support data is encrypted and managed according to corporate security policies.</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-8 border-t border-white/5">
          <p className="text-slate-500 text-sm font-medium">
            © {new Date().getFullYear()} IT Helpdesk System
          </p>
        </div>
      </div>

      {/* ================================ */}
      {/* RIGHT — Registration Form        */}
      {/* ================================ */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-12 lg:px-20 relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="w-full max-w-md space-y-10 relative z-10">
          
          <div>
            <Link href="/login" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-8 group">
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Back to Sign In
            </Link>
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
              Create your account
            </h2>
            <p className="text-lg text-slate-500 mt-2">
              Join the team to get quick IT support.
            </p>
          </div>

          <Card className="border-slate-200 shadow-xl shadow-slate-200/50 rounded-[2rem] bg-white overflow-hidden border">
            <CardContent className="p-8">
              <form onSubmit={handleRegister} className="space-y-6">
                
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700 ml-1">Full Name</Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input 
                      placeholder="Jane Doe" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-14 pl-12 text-base border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 rounded-2xl transition-all font-medium placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700 ml-1">Email Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input 
                      type="email" 
                      placeholder="jane@company.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-14 pl-12 text-base border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 rounded-2xl transition-all font-medium placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700 ml-1">Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input 
                      type="password" 
                      placeholder="Min. 6 characters" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-14 pl-12 text-base border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 rounded-2xl transition-all font-medium placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-4">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 font-bold leading-relaxed">{error}</p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-600/10 transition-all active:scale-[0.98] mt-4"
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-slate-500 font-medium pb-8">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 font-bold hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
