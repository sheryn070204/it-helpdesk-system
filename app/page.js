// Import the tool to move the user to a different page
import { redirect } from "next/navigation";
// Import the tool to connect to our database from the server
import { createClient } from "@/lib/supabaseServer";

/**
 * This is the first page the computer looks at when someone visits the website.
 * It decides where to send the user based on who they are.
 */
export default async function RootPage() {
  // Create a connection to our database
  const supabase = await createClient();

  // Ask the database if someone is currently logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If NO ONE is logged in, send them to the login page
  if (!user) {
    redirect("/login");
  }

  // If someone IS logged in, find out if they are an Admin, Staff, or Employee
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role") // Only look at their "role" (job title)
    .eq("id", user.id) // Find the person using their special ID
    .single(); // We only want one person's information

  // If there was a problem finding their role, log it as an error
  if (profileError) {
    console.error("Critical: Could not resolve user role.", profileError);
  }

  // Send the person to the correct "Portal" (dashboard) for their job
  if (profile?.role === "admin") {
    // Admins go to the Admin dashboard
    redirect("/admin");
  } else if (profile?.role === "it-staff") {
    // IT Staff go to the Staff dashboard
    redirect("/it-staff");
  } else if (profile?.role === "employee") {
    // Employees go to the Employee portal
    redirect("/employee");
  } else {
    // If we don't know who they are, just send them back to login
    console.warn("User has no role assigned:", user.id);
    redirect("/login");
  }
}