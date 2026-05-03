// This line imports the tool needed to connect to Supabase from the browser
import { createBrowserClient } from '@supabase/ssr'

// This variable will hold our connection so we don't make too many of them
let supabaseInstance = null

/**
 * This function makes sure we only have ONE connection to Supabase at a time.
 * This keeps the app fast and prevents errors with logging in.
 */
export const createClient = () => {
  // If we already have a connection, just give it back
  if (supabaseInstance) return supabaseInstance

  // If we don't have a connection yet, create a new one using our secret keys
  supabaseInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL, // This is the address of our database
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // This is the public key to access it
  )

  // Give back the new connection
  return supabaseInstance
}

// This line creates the connection and shares it with the rest of the app
export const supabase = createClient()