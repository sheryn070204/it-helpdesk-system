"use server";

import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

// Server action for logging in
export async function loginAction(formData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Fetch the role to decide where to send them
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (!profile) {
    return { error: "Profile not found. Please contact support." };
  }

  if (profile.role === "admin") {
    redirect("/admin");
  } else if (profile.role === "it_staff" || profile.role === "it-staff") {
    redirect("/it-staff");
  } else {
    redirect("/employee");
  }
}

// Server action for registration (Employee Only)
export async function registerAction(formData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const fullName = formData.get("fullName");
  const supabase = await createClient();

  // 1. Sign up the user
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    return { error: signUpError.message };
  }

  if (!data.user) {
    return { error: "Signup succeeded but no user was returned." };
  }

  // 2. Create the profile record
  const { error: profileError } = await supabase.from("profiles").insert([
    {
      id: data.user.id,
      full_name: fullName,
      role: "employee",
    },
  ]);

  if (profileError) {
    return { error: "Account created but profile setup failed. Error: " + profileError.message };
  }

  // 3. Explicitly redirect to the employee portal
  redirect("/employee");
}
