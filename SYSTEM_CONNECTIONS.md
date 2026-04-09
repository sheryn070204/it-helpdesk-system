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
