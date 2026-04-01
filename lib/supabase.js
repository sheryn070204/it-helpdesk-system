import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Using createBrowserClient automatically syncs the Supabase session with
// browser cookies instead of localStorage. This allows Next.js Server 
// Components (like your employee/admin layouts) to read the session correctly!
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)