// Import the tool to connect to Supabase from the server side
import { createServerClient } from "@supabase/ssr";
// Import the tool to read "cookies" (small files that remember you are logged in)
import { cookies } from "next/headers";

/**
 * This function creates a connection to Supabase that runs on the server.
 * It is used for parts of the website that stay private or hidden from the user.
 */
export async function createClient() {
  // Get the current list of cookies from the browser
  const cookieStore = await cookies();

  // Create and return the server-side connection
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL, // The database address
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, // The database secret key
    {
      cookies: {
        // This part tells Supabase how to read all the cookies
        getAll() {
          return cookieStore.getAll();
        },
        // This part tells Supabase how to update or save new cookies
        setAll(cookiesToSet) {
          try {
            // Go through each new cookie and save it
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // If we can't save cookies right now, just ignore it.
            // This happens sometimes in certain parts of Next.js.
          }
        },
      },
    }
  );
}
