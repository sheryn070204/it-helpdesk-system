# System Maintenance & Fixes Log - April 2026

This document summarizes the critical architectural fixes and feature enhancements implemented to stabilize the IT Ticket Management System.

## 1. Authentication & Middleware Stabilization
**Issue:** Admin users experienced a "white screen" and were intermittently redirected back to the login page after a successful login.
**Root Cause:**
- The Supabase Auth Middleware was misnamed as `proxy.js` instead of `middleware.js`.
- Next.js was not executing the session refresh logic, causing `supabase.auth.getUser()` to return `null` in Server Components.
**Resolution:**
- Renamed `proxy.js` to `middleware.js`.
- Updated the exported function to `middleware` to comply with Next.js standards.
- Removed the dead `proxy.js` file.

## 2. Supabase 500 Error & RLS Recursion Fix
**Issue:** Querying the `profiles` table resulted in a `500 Internal Server Error`.
**Root Cause:** 
- The RLS policy for admins was recursive: it queried the `profiles` table to check if the user was an admin, which triggered the same policy infinitely.
**Resolution:**
- Created a `SECURITY DEFINER` function `public.is_admin()` to check roles while bypassing RLS.
- Updated `profiles` policies to use `is_admin()`, breaking the recursion.
- Added a `handle_new_user()` trigger to ensure every new Auth user gets a corresponding row in the `profiles` table automatically.
- Updated `app/page.js` and `app/admin/layout.js` with robust error handling for profile queries.

## 3. Real-time IT Staff Management
**Goal:** Automatically update the IT Staff list in the Admin Panel when new staff are registered.
**Implementation:**
- Enabled the `profiles` table in the `supabase_realtime` publication.
- Integrated a `supabase.channel()` subscription in `/app/admin/settings/page.js`.
- The list now auto-refreshes via `fetchUsers()` whenever a new `it_staff` role entry is detected.

## 4. Enhanced Profile Picture System
**Goal:** Fix the broken avatar upload and ensure it works for all roles (Admin, IT Staff, Employee).
**Implementation:**
- **Storage:** Created the `avatars` storage bucket in Supabase.
- **Validation:** Updated `lib/uploadAvatar.js` to include:
    - 5MB file size limit.
    - JPG, PNG, and WebP format restrictions.
    - Cache-busting URLs (`?t=timestamp`) to ensure the UI updates immediately after upload.
- **UI:** Updated all profile pages to display specific validation error messages (e.g., "Image too large") instead of generic failures.
- **Permissions:** Fixed RLS to allow users to upload to their own folder (`avatars/{user_id}/`) and allowed admins to read all avatars.

## 5. Security & Stability Summary
- **Database:** RLS is fully enabled and optimized for all tables.
- **Auth:** Session persistence is now rock-solid across both Server and Client components.
- **UX:** Loading states and error handling have been improved to prevent "silent" failures and redirect loops.
