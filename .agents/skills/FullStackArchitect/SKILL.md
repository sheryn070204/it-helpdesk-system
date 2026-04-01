---
name: FullStackArchitect
description: Full-stack development with a focus on scalable architecture, clean code, and modern Next.js/Supabase patterns.
---

# FullStackArchitect Skill

This skill provides a comprehensive architectural framework for building robust, scalable, and maintainable full-stack web applications. It emphasizes modern practices like the Next.js App Router, Supabase integration, and Tailwind CSS.

## 1. Core Architectural Principles

- **Separation of Concerns**: Keep business logic out of components. Use services and hooks.
- **Server-First Approach**: Leverage Next.js Server Components and Server Actions to minimize client-side JavaScript.
- **Data Integrity**: Use proper database schemas, triggers, and row-level security (RLS) in Supabase.
- **Type Safety**: Prefer TypeScript (if available) or strict PropType/DocBlock documentation in JavaScript.
- **Atomic Design**: Structure UI components into Atoms, Molecules, and Organisms for maximum reusability.

## 2. Directory Structure Recommendation

```text
/
├── app/                  # Next.js App Router (Routes, Layouts, Pages)
│   ├── (auth)/           # Route Groups for Auth
│   ├── (dashboard)/      # Route Groups for Main Content
│   └── api/              # API Route Handlers
├── components/           # UI Components
│   ├── ui/               # Base Atomic UI (Buttons, Inputs, etc.) - based on shadcn/ui
│   ├── forms/            # Complex Form Components
│   └── layout/           # Shared Layout Elements (Header, Footer)
├── lib/                  # Shared Utilities
│   ├── supabase/         # Supabase Client & Config
│   ├── utils/            # Helper functions (formatting, validation)
│   └── constants/        # Shared constants & config
├── services/             # Business Logic & Data Fetching
│   ├── auth.js           # Authentication services
│   ├── tickets.js        # Ticket-related logic
│   └── user.js           # User profile logic
├── hooks/                # Custom React Hooks
└── assets/               # Static assets (images, icons)
```

## 3. Data Flow & State Management

- **Server State**: Fetch data in Server Components or use React Server Actions for mutations. Avoid `useEffect` for data fetching where possible.
- **Client State**: Use React `useState` or `useReducer` for local UI state. Use Context API for minimal global state (e.g., Theme, User Context).
- **Mutations**: Use **Server Actions** for all data-changing operations (POST, PUT, DELETE). Ensure they handle revalidation (`revalidatePath` or `revalidateTag`).

## 4. Component Implementation Pattern

For every new functional component:

1. **Define the Props**: What data does this component need?
2. **Logic Isolation**: If the component has more than 5 lines of logic, move it to a custom hook or service.
3. **Styling**: Use utility-first Tailwind CSS. Keep responsiveness in mind.
4. **Error Handling**: Use Error Boundaries and proper loading states (Suspense/Loading skeletons).

## 5. Feature Implementation Workflow

Use the following checklist to build a new feature:

1.  **Schema Design**: Define/Update Supabase tables and RLS policies.
2.  **Service Layer**: Create a service function in `services/` to interact with Supabase.
3.  **UI Component**: Build the necessary UI components in `components/`.
4.  **Integration**:
    - Build the Page in `app/`.
    - Use Server Actions for forms/mutations.
    - Use `Suspense` for data fetching segments.
5.  **Refinement**:
    - Add loading skeletons (`loading.js`).
    - Add error handling (`error.js`).
    - Audit for accessibility and performance.

## 6. Best Practices & Gotchas

- **Supabase**: Always fetch what you need. Avoid `select("*")` if you only need 3 columns.
- **Next.js**: Remember that `client` components cannot import `server` components directly, but can take them as `children`.
- **Performance**: Use dynamic imports (`next/dynamic`) for large client-side libraries.
- **Security**: Never expose Supabase Service Role keys to the client. Use Client-Side RLS.
