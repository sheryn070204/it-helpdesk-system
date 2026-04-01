---
description: How to build a new end-to-end full stack feature in the it-ticketing-system
---

# Feature Implementation Workflow

This workflow ensures consistency and architectural integrity when building new features in your Next.js and Supabase application.

1.  **Define the Data Schema**
    *   Identify the tables needed in Supabase.
    *   Create a migration or SQL script to define the table, columns, and relations.
    *   Enable Row-Level Security (RLS) and define policies for each operation.

2.  **Create the Service Layer**
    *   Create a file in `/services/{feature}.js`.
    *   Use the `ServiceTemplate.js.example` from the `FullStackArchitect` skill as a base.
    *   Implement methods for each needed database operation.

// turbo
3.  **Build UI Atoms and Molecules**
    *   Identify common UI elements needed.
    *   Create components in `/components/ui/` or `/components/forms/`.
    *   Ensure they are responsive and use Tailwind CSS.

4.  **Create a Server-Side Page or Route**
    *   Define the route in `/app/{feature}/page.js`.
    *   Fetch initial data using the service layer from step 2 within a React Server Component.

// turbo
5.  **Implement Mutations with Server Actions**
    *   Create a `/services/{feature}.actions.js` if the operations are complex.
    *   Use `revalidatePath` to ensure the UI stays in sync after mutation.

6.  **Edge Case Handling and Polish**
    *   Create a `loading.js` for the route.
    *   Implement robust error handling with `error.js`.
    *   Test for various edge cases (empty data, network errors).
