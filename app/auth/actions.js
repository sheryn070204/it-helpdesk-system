// This tells the computer to run this code only on the server
"use server";

// Import our server-side database tool and redirection tool
import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

// This is a "Server Action" for logging in
export async function loginAction(formData) {
  // Get the email and password from the form the user filled out
  const email = formData.get("email");
  const password = formData.get("password");
  
  // Create a connection to our database
  const supabase = await createClient();

  // 1. Try to log in with the email and password
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // If there was a mistake (like wrong password), send back the error message
  if (error) {
    return { error: error.message };
  }

  // 2. If login worked, find out if the user is an Admin, Staff, or Employee
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  // If we can't find their role, tell them something is wrong
  if (!profile) {
    return { error: "Profile not found. Please contact support." };
  }

  // 3. Send the user to the right dashboard based on their role
  if (profile.role === "admin") {
    redirect("/admin"); // Admins go to /admin
  } else if (profile.role === "it-staff") {
    redirect("/it-staff"); // IT Staff go to /it-staff
  } else {
    redirect("/employee"); // Everyone else goes to /employee
  }
}

// This is a "Server Action" for creating a new Employee account
export async function registerAction(formData) {
  // Get the info from the registration form
  const email = formData.get("email");
  const password = formData.get("password");
  const fullName = formData.get("fullName");
  
  // Create a connection to our database
  const supabase = await createClient();

  // 1. Ask the database to create the new account
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  // If signup failed, send back the error
  if (signUpError) {
    return { error: signUpError.message };
  }

  if (!data.user) {
    return { error: "Signup succeeded but no user was returned." };
  }

  // 2. Create the "Profile" record for the new user
  const { error: profileError } = await supabase.from("profiles").insert([
    {
      id: data.user.id,
      full_name: fullName,
      role: "employee", // New accounts are always employees by default
    },
  ]);

  // If the profile couldn't be made, tell them
  if (profileError) {
    return { error: "Account created but profile setup failed. Error: " + profileError.message };
  }

  // 3. Send them to their new dashboard
  redirect("/employee");
}
