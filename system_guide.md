# 📘 IT Helpdesk System: The Ultimate Simple Guide
**Standardized Version: May 2026**

This guide is your map for the entire system. It explains what it is made of, where the files are, and how each part "talks" to the others.

---

## 🖼️ 1. The "Picture Frame" vs. "The Picture"
You’ll notice that every folder has a **`layout.js`** AND a **`page.js`**. Here is how to understand the difference:

### **`layout.js` ( The Picture Frame )**
*   **What it does:** This is the part of the website that **NEVER** changes when you click around. 
*   **What’s in it?** Usually the **Sidebar** and the **Top Header**.
*   **Why?** So you don't have to reload the sidebar every time you click a link. It stays "locked" in place.

### **`page.js` ( The Picture inside the frame )**
*   **What it does:** This is the actual **Content** you are looking at right now. 
*   **What happens?** When you click "Settings" or "Tickets", the **Layout** (sidebar) stays the same, but the **Page** (the content) swaps out for a new one.

---

## 🏗️ 2. The GPS Map: Where is its "Brain"? 📍

You asked where to find the Frontend, Backend, and API. Here is exactly where they live in your project:

### **🍽️ 1. The Frontend ( What you see )**
*   **Where is it?** Check any **`page.js`** file that has `"use client"` at the very top.
*   **Example location:** `app/login/page.js` or `app/admin/page.js`.
*   **What it does:** This code runs in the user's web browser. It draws the buttons and handles mouse clicks.

### **🍳 2. The Backend ( Security & The Brain )**
*   **Where is it?** 
    1.  **`auth/actions.js`**: This file has `"use server"` at the top. This is pure backend code.
    2.  **`layout.js` files**: (Like `app/admin/layout.js`). These run on the server *before* the page loads.
*   **What it does:** This code is private. It handles passwords and checks if a user is "allowed" to see a page.

### **🛎️ 3. The API ( The Doors )**
In a modern system like Next.js, we don't have a messy `api/` folder. Instead, we have **"The Two Doors"** to our restaurant:

*   **🚪 The Front Door (`lib/supabase.js`):** 
    *   **What it is:** This is the "Order Tablet" that your website uses to place those orders. 
    *   **Where it lives:** It runs in the user's web browser. It handles everyday tasks like fetching a list of tickets.
*   **🚪 The Back Door (`lib/supabaseServer.js`):** 
    *   **What it is:** This is the **"Secret Staff Only"** key. 
    *   **Where it lives:** This code **never** reaches the user's computer. It only runs on your private server. It handles the "Deep Settings"—like creating new user accounts or deleting dangerous files.

---

## 🚦 3. The "Traffic Controller" (`proxy.js`)
This is perhaps the most "mysterious" but **CRITICAL** file in your entire project. If you delete it, the website will break in 5 minutes. Here is the deep explanation of why:

### **What is it really?**
Imagine your website is a **Secure Bank.** Every time a customer (user) tries to walk from the Lobby (Login) to the Vault (Admin Dashboard), they have to pass through a **Security Turnstile.** That is the `proxy.js` file.

### **Why does it exist? (The "Infinite Loop" Problem)**
In modern web apps, the "Server" (the brains) and the "Browser" (your screen) sometimes stop talking to each other. 
1.  The **Browser** thinks you are logged in.
2.  The **Server** forgets who you are.
3.  The **Server** sends you back to the Login page.
4.  The **Login page** sees your browser cookie and sends you back to the Admin page.
5.  **Infinite Loop!** The screen flashes white and never stops loading.

**The Solution:** The `proxy.js` file sits in the middle. Every single time a user clicks anything, `proxy.js` grabs their "Secret Token" (their session), refreshes it so it's brand new, and hands it to the Server. It makes sure the Server and Browser are always "Best Friends" and never forget each other.

### **What happens if it's missing?**
-   Users will be randomly logged out while they are typing a ticket.
-   The "Infinite Redirect Loop" will come back and crash the site.
-   Your "Server Components" (the private layouts) won't be able to see who is logged in.

---

## 🚪🗝️ 4. The Two Doors of the API (Browser vs. Server)
In a professional system, you have **two ways** to talk to your database. One way is for the "Public" part of the site, and the other is for the "Private" part.

### **🚪 Door #1: Browser-Side (`lib/supabase.js`)**
*   **Simple term:** "The User's Client."
*   **Where it runs:** Inside the **Google Chrome / Safari / Edge browser** of the person using your site.
*   **What it does:** This handles anything a user clicks. If a user clicks "View my Tickets," this file is the one that actually sends that request!
*   **Why use it?** It’s very fast and can immediately show updates on the screen.

### **🚪 Door #2: Server-Side (`lib/supabaseServer.js`)**
*   **Simple term:** "The Website's Brain."
*   **Where it runs:** **ONLY on your private server.** It never travels to the user's computer.
*   **What it does:** This handles the **Secret Logic.** It is used for things the user shouldn't be able to "touch," like checking if a user is an Admin before letting them into the Admin Dashboard.
*   **Why use it?** **Security!** Because it stays on your private server, it is much harder for hackers to mess with it. 

### **Summary: Which one should I use?**
-   If you are writing code with **`"use client"`** at the top: Use the **Browser-Side** door.
-   If you are writing code that runs in **`layout.js`** or on the server: Use the **Server-Side** door.

---


## 🎨 5. What is Shadcn/UI?
Shadcn is our **"Visual Lego Set."** 
Think of Shadcn as a box of raw bricks. We use pieces like `Button`, `Badge`, and `Card` from the **`components/ui`** folder to build your site.

---

## 🗡️ 6. The "Spelling Guard" Rule
To prevent errors, I added a permanent **Gatekeeper** rule to your database. 
*   **The Rule:** You can *only* use these three words for roles: `admin`, `it-staff`, or `employee`.
*   **No more typos!** If anyone tries to use `it-staff` (hyphen), the database will block it. This is why our code is so fast and reliable now.

---

## 🚀 7. How to Add a New Feature
If you want to add a brand new page (like "Help Center"):

1.  Create a folder in `app/` named `help-center`.
2.  Create a `page.js` file inside it.
3.  Add `"use client"` at the top if you want interaction.
4.  Import **Lego Bricks** from `@/components/ui/` to make it look pretty.
5.  Save it, and you're done!

---

### 🗝️ Key Files Summary
1.  **`app/page.js`**: The Entrance. It looks at your role and decides where to send you.
2.  **`lib/supabase.js`**: The bridge that lets our code talk to Supabase.
3.  **`proxy.js`**: The traffic controller that keeps everyone logged in safely.

*End of Manual — Standardized for Professional Excellence in 2026.*

