# 💻 IT Helpdesk: JavaScript & React Guide
**A Simple Guide to Functions, Parameters, and Core Concepts**

This document explains the technical "Building Blocks" of your code. Whether you're looking at a function's inputs or trying to understand what `async` means, it's all here.

---

## 🧱 1. The Building Blocks (Keywords)
These are the special words you see at the top or beginning of almost every file.

### **JavaScript Fundamentals**
*   **`export`**: Think of this as a **"Public"** sign. It tells the computer that this function can be used by other files in the project.
*   **`import`**: This is the opposite of export. It **"borrows"** a tool from another file so you can use it here.
*   **`async`**: Short for "Asynchronous." It tells the computer: *"This task might take a few seconds (like fetching data from the internet), so don't freeze the screen while waiting."*
*   **`await`**: This word always goes with `async`. It tells the code: *"Wait right here until this specific task is finished before moving to the next line."*

### **React Hooks & Logic**
*   **`useState`**: Think of this as a **"Digital Sticky Note."** It allows a page to remember information (like if a menu is open, or what text you typed into a box).
*   **`useEffect`**: This is an **"Automatic Trigger."** It tells the computer to run a specific piece of code automatically when the page first opens or when something changes.
*   **`Props`**: Short for "Properties." These are the **inputs** given to a visual component (like the color of a button).
*   **`children`**: A special prop that represents **everything inside** a component's tags. For example, if you have a `Box`, the `children` is whatever you put inside that box.
*   **`redirect`**: A command that tells the browser to **go to a different page** immediately.
*   **`"use client"`**: You'll see this at the very top of files. It tells the system: *"This code needs to run inside the user's Browser (like Chrome) so they can click buttons and see animations."*

---

## 🛠️ 2. Database & Action Functions
These functions handle the "Logic" of the system, like logging in or saving data.

### 🔑 **loginAction(formData)**
*   **What it does:** Authenticates a user and sends them to the right dashboard.
*   **Parameter:** `formData` (Object)
    *   `email`: The user's email address.
    *   `password`: The user's secret password.

### 📝 **registerAction(formData)**
*   **What it does:** Creates a new Employee account.
*   **Parameter:** `formData` (Object)
    *   `email`: The email for the new account.
    *   `password`: The password for the new account.
    *   `fullName`: The real name of the user.

### 🔔 **createNotification(userId, ticketId, type, message)**
*   **What it does:** Sends an alert to a specific user.
*   **Parameters:**
    *   `userId`: The unique ID of the person receiving the alert.
    *   `ticketId`: The ID of the ticket this alert is about.
    *   `type`: The category of alert (e.g., `"new_ticket"`, `"ticket_resolved"`).
    *   `message`: The actual text shown in the notification bell.

### 🖼️ **uploadAvatar(userId, file)**
*   **What it does:** Saves a profile picture for a user.
*   **Parameters:**
    *   `userId`: The ID of the user whose photo is being updated.
    *   `file`: The actual image file from the user's computer.

### 🧾 **uploadProof(ticketId, file)**
*   **What it does:** Saves a "Proof of Work" photo for a ticket.
*   **Parameters:**
    *   `ticketId`: The ID of the ticket the photo belongs to.
    *   `file`: The actual image file showing the fix.

---

## 🎨 3. Visual Components (React Props)
These are the building blocks of your website's design. In React, we call parameters "Props."

### 👤 **UserAvatar({ avatarUrl, fullName, size, className })**
*   **What it does:** Shows a user's face or their name initials in a circle.
*   **Parameters (Props):**
    *   `avatarUrl`: The internet link to the user's picture.
    *   `fullName`: The name used to create initials if no picture exists.
    *   `size`: (Optional) How big the circle is. Choices are: `xs`, `sm`, `md`, `lg`, or `xl`.
    *   `className`: (Optional) Extra CSS styling for the circle.

### 🔔 **NotificationBell({ role, theme })**
*   **What it does:** Shows the alert bell with a red badge for new messages.
*   **Parameters (Props):**
    *   `role`: The job of the user (e.g., `"admin"`, `"it-staff"`, or `"employee"`). This helps the bell know which page to go to when clicked.
    *   `theme`: (Optional) The look of the bell. Choices are: `"light"` (default) or `"dark"`.

### 🏷️ **getPriorityBadge(priority)**
*   **What it does:** Returns a colored label based on urgency.
*   **Parameter:**
    *   `priority`: A word like `"critical"`, `"high"`, `"medium"`, or `"low"`.

### 🚥 **getStatusBadge(status)**
*   **What it does:** Returns a colored label based on progress.
*   **Parameter:**
    *   `status`: A word like `"open"`, `"in_progress"`, or `"resolved"`.

---

## 💡 4. Summary: What is a "Parameter"?
In simple words: A **Parameter** is just a "piece of information" that you give to a function so it can do its job. 
*   *Example:* If a function is a "Toaster," the parameter is the "Bread." Without the bread, the toaster has nothing to do!

---

*This guide helps you understand exactly what information each part of your code needs to work correctly.*
