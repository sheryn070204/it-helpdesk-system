# ⚙️ How the System Works: Operational Guide

This guide explains the "Journey of a Ticket" and how different users interact with the system.

---

## 🚀 1. The Ticket Lifecycle
Every problem reported follows this standard path:

### Step A: Submission (The Employee)
1.  An **Employee** logs in and goes to the "Submit Ticket" page.
2.  They fill in the **Title**, **Description**, and **Priority** (Critical, High, Medium, Low).
3.  Once they hit "Submit," the ticket is created in the database and is marked as `open`.

### Step B: Triage & Assignment (The Admin)
1.  The **Admin** sees the new ticket in their **Recent Activity** or **All Tickets** list.
2.  The Admin reviews the problem and chooses an **IT Staff member** to handle it.
3.  When the Admin hits "Save," two things happen:
    -   The ticket is "Assigned" to that person.
    -   A **Ping (Notification)** is sent to the IT Staff member's bell icon.

### Step C: Resolution (The IT Staff)
1.  The **IT Staff** logs in and sees the ticket in their assigned list.
2.  They start working on the fix and update the status to **"In Progress"**.
3.  Once fixed, they set the status to **"Resolved"**.
4.  **Automatic Ping:** The system sends a notification back to the original **Employee** to let them know their problem is solved!

---

## 🔔 2. The Notification Engine
Our system uses a "Real-time" listener.
-   **No Refreshing Needed:** If you are on the dashboard and someone assigns you a ticket, the red dot on the bell will appear instantly.
-   **Audit Trail:** Every major change (assignment or status update) is recorded so the Admin can see the history of the ticket.

---

## 🔐 3. Access Control (Who sees what?)
The system checks your "Identity" (Role) every time you log in:

-   **Admins:** Have "God Mode." They can see all tickets, delete/add staff, and change any setting.
-   **IT Staff:** Can only see tickets assigned to them. They cannot change system settings.
-   **Employees:** Can only see their own tickets. They cannot see IT Staff names or other users' problems.

---

## 🛠️ 4. Common Troubleshooting
-   **If a button doesn't work:** Check if you are correctly logged in. The system might have logged you out for security.
-   **If you don't see a ticket:** Ensure you are in the correct "Floor" (e.g., if you are an Admin, check "All Tickets" instead of just your dashboard).
