# 🧵 IT Helpdesk: The System Connections Map
**A Step-by-Step Guide to How Everything "Talks"**

This document explains the "Wiring" of your system. It shows how a single click on your screen travels through the code and into the database.

---

## 🏗️ 1. The 4-Layer Connection
Imagine your system is like a **Smart House.**

### **Layer 1: The Switches ( The Frontend )**
*   **Files:** `app/**/page.js` and `components/`
*   **What it is:** These are the buttons and screens the user touches.
*   **Connection:** When a user clicks a button, it sends a signal to Layer 2.

### **Layer 2: The Security Guard ( The Proxy )**
*   **Files:** `proxy.js`
*   **What it is:** This file sits in the middle and checks if the person clicking the button is authorized. 
*   **Connection:** If the user is "OK," the signal moves to Layer 3. If not, it sends them back to the Login page.

### **Layer 3: The API Waiter ( The Bridge )**
*   **Files:** `lib/supabase.js` (Browser) and `lib/supabaseServer.js` (Server)
*   **What it is:** This is the ONLY code that knows how to speak the language of the database.
*   **Connection:** It takes the user's request (like "Show me my tickets") and carries it across the internet to Layer 4.

### **Layer 4: The Brain ( Supabase )**
*   **Files:** (Living in the Cloud)
*   **What it is:** This is the permanent memory. It stores the tickets, the users, and the photos.
*   **Connection:** It processes the request and sends the data back through Layer 3 to the user's screen.

---

## 🔄 2. A Real-Life Example: Submitting a Ticket
Here is exactly what happens when an Employee clicks **"Submit Ticket"**:

1.  **Frontend (`app/employee/page.js`):** The employee types their issue and clicks "Submit."
2.  **API Bridge (`lib/supabase.js`):** The frontend "calls" the Supabase client. It says: *"Hey, can you please take this message to the database?"*
3.  **Proxy Guard (`proxy.js`):** The request passes through the proxy to make sure this user is still logged in and safe.
4.  **Supabase Brain:** The database receives the ticket, saves it forever, and sends back a "Success!" message.
5.  **Notifications (`lib/notifications.js`):** The system sees the new ticket and immediately sends a ping to the Admin's notification bell.
6.  **Frontend:** The employee see a green checkmark saying "Ticket Submitted!"

---

## 📁 3. Folder Connectivity Guide
How the folders "Talk" to each other:

*   **`app` talks to `components`**: To get the beautiful buttons and sidebars.
*   **`app` talks to `lib`**: To ask the database for information.
*   **`lib` talks to `Supabase`**: To save or read data.
*   **`auth` talks to `proxy.js`**: To make sure the login process is secure.

---

## 🗝️ 4. The "Golden Rule" of Connections
*   **NEVER** try to talk to Supabase directly from a `page.js` without using the **`lib/`** folder. 
*   Always use the **"Bridge"** (the API clients we built) to ensure your connections are fast, secure, and professional.

*End of Protocol — System Fully Mapped for 2026.*

---

## 📋 5. CRUD Location Guide
Where to find every **Create**, **Read**, **Update**, and **Delete** operation in the system.

> **How to read this table:**
> - **Table** = the Supabase database table being touched.
> - **Operation** = the type of action (Create / Read / Update / Delete).
> - **File** = the exact file path where the code lives.
> - **Who / When** = which role triggers it and in what situation.

---

### 🎫 Table: `tickets`

| Operation | File | Who / When |
|-----------|------|------------|
| **CREATE** | `app/employee/submit/page.js` | Employee — when they fill out and submit the "Submit a Support Request" form. Priority is auto-detected from the title and description. |
| **READ** (list) | `app/admin/page.js` | Admin — dashboard reads the 8 most recent tickets for the activity feed, plus counts for the KPI cards. |
| **READ** (list) | `app/admin/tickets/page.js` | Admin — full ticket list page with search, status, and priority filters. Can also filter by assigned staff. |
| **READ** (list) | `app/it-staff/tickets/page.js` | IT Staff — reads all tickets assigned across the system, with search and status filters. |
| **READ** (list) | `app/employee/tickets/page.js` | Employee — reads only their own tickets (filtered by `submitted_by = user.id`). |
| **READ** (single) | `app/admin/tickets/[id]/page.js` | Admin — reads a single ticket's full details including submitter and assignee profiles. |
| **READ** (single) | `app/it-staff/tickets/[id]/page.js` | IT Staff — reads a single ticket's full details to view and update the status. |
| **READ** (single) | `app/employee/tickets/[id]/page.js` | Employee — reads a single ticket's details to see its current state. |
| **UPDATE** (status + assignee) | `app/admin/tickets/[id]/page.js` | Admin — the "Save Changes" button updates the ticket's `status` and `assigned_to` fields. Also fires notifications. |
| **UPDATE** (status only) | `app/it-staff/tickets/[id]/page.js` | IT Staff — the "Save Changes" button updates only the `status` field. Also fires notifications to the submitter. |

---

### 👤 Table: `profiles`

| Operation | File | Who / When |
|-----------|------|------------|
| **CREATE** | `app/auth/actions.js` → `registerAction()` | System — when a new Employee registers, a profile row is inserted with `role: "employee"`. |
| **CREATE** | `app/admin/settings/page.js` → `handleAddStaff()` | Admin — when the "Add IT Staff" dialog form is submitted, Supabase Auth creates the user and a profile is created with `role: "it_staff"`. |
| **READ** (current user) | `app/auth/actions.js` → `loginAction()` | System — on every login, the user's profile is read to determine their role and redirect them to the right portal. |
| **READ** (current user) | `app/admin/profile/page.js` | Admin — reads own profile to display and edit name, avatar, and password. |
| **READ** (current user) | `app/it-staff/profile/page.js` | IT Staff — reads own profile to display and edit name, avatar, and password. |
| **READ** (current user) | `app/employee/profile/page.js` | Employee — reads own profile to display and edit name, avatar, and password. |
| **READ** (staff list) | `app/admin/settings/page.js` | Admin — reads all profiles where `role = "it_staff"` to display the IT Staff management page. |
| **READ** (staff list for dropdown) | `app/admin/tickets/[id]/page.js` | Admin — reads all IT Staff profiles to populate the "Assign To" dropdown on a ticket detail page. |
| **READ** (stats count) | `app/admin/page.js` | Admin — reads an exact count of all profiles for the "Total Users" KPI card. |
| **UPDATE** (full name) | `app/admin/profile/page.js` → `handleUpdateName()` | Admin — the "Save Changes" button updates `full_name` in the profiles table. |
| **UPDATE** (full name) | `app/it-staff/profile/page.js` → `handleUpdateName()` | IT Staff — the "Save Changes" button updates `full_name` in the profiles table. |
| **UPDATE** (full name) | `app/employee/profile/page.js` → `handleUpdateName()` | Employee — the "Save Changes" button updates `full_name` in the profiles table. |
| **UPDATE** (avatar) | `lib/uploadAvatar.js` | All roles — called from each portal's profile page when a user uploads a new profile picture. Saves to Supabase Storage and updates `avatar_url`. |

---

### 🔐 Authentication (Supabase Auth — not a regular table)

| Operation | File | Who / When |
|-----------|------|------------|
| **CREATE** (new user) | `app/auth/actions.js` → `registerAction()` | Employee self-registration via the Register page. |
| **CREATE** (new user) | `app/admin/settings/page.js` → `handleAddStaff()` | Admin creates a new IT Staff account via the dialog. |
| **READ** (session/login) | `app/auth/actions.js` → `loginAction()` | All roles — every login attempt on the Login page. |
| **READ** (session check) | `proxy.js` | System — every page request is checked by the middleware to protect routes. |
| **UPDATE** (password) | `app/admin/profile/page.js` → `handleUpdatePassword()` | Admin — uses `supabase.auth.signInWithPassword()` to re-authenticate first, then `supabase.auth.updateUser()` to change the password. |
| **UPDATE** (password) | `app/it-staff/profile/page.js` → `handleUpdatePassword()` | IT Staff — same re-authentication flow as Admin. |
| **UPDATE** (password) | `app/employee/profile/page.js` → `handleUpdatePassword()` | Employee — same re-authentication flow as Admin. |
| **DELETE** (sign out) | Each portal's layout/nav | All roles — clicking the logout button calls `supabase.auth.signOut()`. |

---

### 🔔 Table: `notifications`

| Operation | File | Who / When |
|-----------|------|------------|
| **CREATE** | `lib/notifications.js` → `createNotification()` | System — called automatically from `app/admin/tickets/[id]/page.js` and `app/it-staff/tickets/[id]/page.js` whenever a ticket is assigned or its status changes. |
| **READ** | `components/NotificationBell.js` | All roles — the notification bell in the navigation bar reads unread notifications for the current user in real time. |
| **UPDATE** (mark as read) | `components/NotificationBell.js` | All roles — clicking a notification marks it as `read = true` in the database. |

---

*End of Protocol — System Fully Mapped for 2026.*
