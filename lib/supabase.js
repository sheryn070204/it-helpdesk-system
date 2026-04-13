import { createBrowserClient } from '@supabase/ssr'

let supabaseInstance = null

/**
 * Singleton pattern for the Supabase Browser Client.
 * This prevents the NavigatorLockAcquireTimeoutError by ensuring only one
 * client instance is ever fighting for the auth token lock.
 */
export const createClient = () => {
  if (supabaseInstance) return supabaseInstance

  supabaseInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  return supabaseInstance
}

// Export a direct instance for convenience across the app
export const supabase = createClient()