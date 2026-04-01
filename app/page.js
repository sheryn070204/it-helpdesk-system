import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";

/**
 * Root page — Smart redirect based on auth state and role.
 * If logged in as admin → go to /admin
 * If logged in as employee → go to /employee
 * If not logged in → go to /login
 */
export default async function RootPage() {
  const supabase = await createClient();

  // Check if there is a logged-in user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // No session — send to login
    redirect("/login");
  }

  // Fetch the user's profile to determine their role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Send to the correct portal based on role
  if (profile?.role === "admin") {
    redirect("/admin");
  } else {
    redirect("/employee");
  }
}