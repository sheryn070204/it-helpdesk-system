# 📘 IT Helpdesk System: Project Guide

Welcome to your system! This guide explains how everything is built, where the files are, and the magic behind the "Shadcn" components we use for the design.

---

## 🏗️ 1. The Big Picture (Architecture)
Our system is like a multi-floor office building:

1.  **Employee Floor (`/employee`):** For regular users to report problems (Submit Tickets).
2.  **IT Staff Floor (`/it-staff`):** For technicians to manage their assigned fixes.
3.  **Admin Floor (`/admin`):** For the "Managing Director" to oversee everything (Personnel, Settings, All Tickets).

### The "Brain" (Supabase)
The database (Supabase) acts as the central memory. 
- When an employee sends a ticket, it is stored in Supabase.
- When you update a profile, Supabase remembers it.
- It also handles real-time alerts (like the red notification dot).

---

## 🎨 2. What is Shadcn/UI?
You see us importing things like `Button`, `Badge`, and `Card` from `@/components/ui`. This is **Shadcn**.

**In simple words:**
Think of Shadcn as a **Lego Set** for code. 
- Most design libraries are like a pre-built toy you can't take apart.
- **Shadcn** is different: It gives you the "pieces" (the raw code) and lets you change the color, shape, or behavior of every button and card.

**Where is it?**
Look in the `components/ui` folder. Files like `button.jsx` and `table.jsx` are the design "rules" for your site.

---

## 📁 3. Folder & File Roadmap
Here is where everything lives:

### `app/` (The Routing)
This is the most important folder. Each folder inside `app` is a page on your website.
-   `app/login/`: The Entry point.
-   `app/admin/`: All administrative tools.
    -   `admin/settings/`: Where we manage staff accounts.
    -   `admin/tickets/`: The master list of every request.
-   `app/it-staff/`: The technician's portal.
-   `app/employee/`: Where users send their requests.

### `components/` (The Reusable Parts)
Instead of writing the same code 100 times, we make "Components."
-   `components/AdminNav.js`: The sidebar you see in the admin suite.
-   `components/NotificationBell.js`: The bell icon that pings on new updates.
-   `components/ui/`: The Shadcn "Legos" (Buttons, Inputs, etc.).

### `lib/` (The "Logic" Helpers)
This folder contains the background work that connects everything.
-   `lib/supabase.js`: The "Bridge" connecting our site to the database.
-   `lib/notifications.js`: The engine that triggers alerts.
-   `lib/badgeHelpers.js`: The "Stylist" that decides what color a "Priority" badge should be.

---

## 🗝️ 4. Key Things to Remember
1.  **Access Roles:** We use roles (Admin, Staff, Employee) to ensure security. Only Admins can see the Settings.
2.  **Dark Aesthetic:** We use a professional dark theme (mainly `#18181b` for cards and `#09090b` for backgrounds).
3.  **Icons:** We use **Lucide-React**. If you want a "Gear" icon, we import `Settings` from there.

---

### 🚀 Moving Forward
- To change **Features**, look in the `page.js` files inside the `app/` folder.
- To change **Designs**, look in `globals.css` or the specific `ui` component in `components/ui/`.
