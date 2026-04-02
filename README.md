# IT Helpdesk Ticketing System
*A beginner-friendly guide to understanding this project.*

Welcome to the documentation for your **IT Helpdesk Ticketing System**! This guide is written so that anyone, even a beginner in tech, can understand exactly what this system is, how it was built, and how the code works.

---

## 1. What is this project?
This is a web application where company employees can log in and submit IT support tickets (like "My computer crashed"). An IT Administrator can then log into their own separate, professional dashboard to view all the tickets, assign them to staff, and mark them as "Resolved."

It has a **Standout Feature**: When an employee types their problem, the system scans their words in real-time and automatically detects the priority (Critical, High, Medium, Low) using keywords like "crash" or "virus", without the employee needing to select anything!

---

## 2. The Tech Stack (What we used)
We built this using modern, powerful tools:
* **Next.js (App Router)**: The framework for building the website. It handles all the pages, routing, and servers.
* **React & JavaScript**: The programming language we used to make the website interactive.
* **Tailwind CSS**: A tool that lets us style the website directly in the code (making things blue, adding shadows, making it responsive).
* **Supabase**: Our "Backend-as-a-Service". It provides the Database (where we save tickets) and Authentication (handling secure logins and passwords).

---

## 3. How We Built It (Step-by-Step)

Here is a summary of the installation and configuration we did together:

### **A. Database & Passwords**
1. We set up two tables in Supabase: `profiles` (for users) and `tickets` (for the IT requests).
2. We connected your Next.js app to Supabase by adding secret keys to an `.env.local` file. 
3. We ran **Row Level Security (RLS)** SQL in Supabase. This is a security guard that ensures employees can *only* see their own tickets, while Admins can see everything.

### **B. Fixing the "Unconfirmed Email" Bug**
By default, Supabase forces new users to verify their emails. Because we didn't fully build an email system, we went into the Supabase Dashboard -> Authentication -> Providers, and **turned off "Confirm Email"**. 

### **C. Fixing the "Server vs Browser Cookie" Bug**
Initially, when you logged in, the server kicked you back out. This happened because standard Supabase saves logins in the browser's `localStorage` (which the server can't read). We installed `@supabase/ssr` and updated `lib/supabase.js` to save your login inside a **Browser Cookie** instead. Cookies are securely sent to the server every time you load a page, fixing the login loop!

---

## 4. The File Structure (Where everything lives)

In Next.js, the folder structure determines your website's URL links. Here is how our app is organized:

```text
c:\Users\Acer\it-ticketing-system\
│
├── lib/
│   ├── supabase.js         # The Supabase connection for the BROWSER (Client).
│   └── supabaseServer.js   # The secure Supabase connection for the SERVER. Reads cookies.
│
├── app/
│   ├── layout.js           # The "Master Layout" for the entire website. Sets the font.
│   ├── page.js             # The root page (localhost:3000). It acts as a traffic cop. If you aren't logged in, it sends you to /login. If you are an Admin, it sends you to /admin.
│   │
│   ├── login/
│   │   └── page.js         # The Login Screen.
│   │
│   ├── register/
│   │   └── page.js         # The Sign Up Screen. Automatically labels everyone as an 'employee'.
│   │
│   ├── employee/           # 🔵 THE EMPLOYEE PORTAL (Friendly Blue/White Theme)
│   │   ├── layout.js       # The top navigation bar for employees. Checks if you are truly an employee.
│   │   ├── page.js         # Employee Dashboard. Shows your recent tickets.
│   │   ├── submit/page.js  # The form to submit a ticket. Contains the Live Priority Detection!
│   │   └── tickets/page.js # A table showing all tickets you personally submitted.
│   │
│   └── admin/              # ⬛ THE ADMIN PORTAL (Professional Dark/Slate Theme)
│       ├── layout.js       # The dark sidebar layout for Admins. Protects the pages from normal employees.
│       ├── page.js         # Admin Dashboard. Shows statistics and urgent tickets blinking red.
│       └── tickets/
│           ├── page.js     # The massive table of all company tickets. Has live Search and Filters.
│           └── [id]/
│               └── page.js # The Detail View for a single ticket. This is where Admins change the Status to "Resolved" and assign the ticket.
```

---

## 5. How User Roles Work

To keep things secure, we implemented strict roles:
1. **Employees**: Anyone who goes to `/register` gets added to the database with the role of `employee`.
2. **Admins**: You **cannot** register as an admin using the website. To make someone an admin, the system owner has to physically go into the Supabase database (`profiles` table) and manually change the word `employee` to `admin`.

When anyone logs in, the `app/page.js` file reads their role from the database. It then redirects them to the correct portal and totally prevents them from sneaking into the other one!

---
*Created by your AI coding assistant. Happy coding!*
