# IT Helpdesk Ticketing System — Operational Workflow

## 1. Authentication & Identity
- **Entry Hub:** Users enter via a premium **Command Login** (`/login`) or **Identity Request** (`/register`).
- **Visual Identity:** Sophisticated dark-themed authentication with glassmorphism and indigo accents.
- **Role-Based Routing:** System automatically detects roles (Admin, IT Staff, Employee) and routes to regional hubs.

## 2. Employee Portal (User-Centric & Light)
- **Aesthetic:** Professional "Light Indigo" theme for clarity and user-friendliness.
- **Dashboard:** At-a-glance KPI cards tracking active and resolved incidents.
- **Incident Initiation:** 
  - Automated **Priority Rules** detection based on keywords (Urgent, Emergency, Broken, Stop = Critical).
  - Live character counts and priority previews.
- **Registry:** Complete searchable log of historical support threads with engineer `UserAvatar` integration.
- **Detail Node:** Holistic view of ticket progress with an incident lifecycle timeline.

## 3. IT Staff Portal (Shadow Gray)
- **Aesthetic:** "Shadow Gray" and "Light Slate" for high-density focus and engineering ergonomics.
- **Workflow:** 
  - Engineers monitor the **Incident Registry** for new assignments.
  - **Triage Console:** Advanced controls to update status, priority, and internal notes.
  - **Transaction Timeline:** Visual record of all engineering actions and status shifts.

## 4. Administrative Portal (Dark Gray)
- **Aesthetic:** Professional "Dark Gray" for high-level oversight and command control.
- **System Stewardship:**
  - **Master Dashboard:** Real-time analytics of global support health.
  - **Ticket Logs:** Full transparency into every incident across the organization.
  - **Personnel Management:** Role adjustment and account lifecycle management in the **Admin Settings**.
  - **Global Profile:** Update administrative identity and profile imagery via the secure storage uplink.

## 5. Technical Architecture
- **Framework:** Next.js with App Router.
- **Database:** Supabase (PostgreSQL) with Real-time synchronization.
- **Auth:** Supabase SSR with Middleware-based routing for security.
- **UI Components:** Standardized `shadcn/ui` with custom premium styling.
- **Notification Engine:** Persistent `NotificationBell` with real-time state sync across all portals.

---
*Operational status: Stable — v2.0.4-Modern*
