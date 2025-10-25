Convex Backend Setup

Overview

- This project now includes a Convex scaffold: schema + a few starter functions for users, courses, and notifications.
- Everything remains mock-driven in the UI until you enable Convex and start calling these functions.

Auth with Clerk

- Preferred integration per Convex docs uses `ConvexProviderWithClerk`.
- Requirements:
  - Install: `yarn add @clerk/nextjs`
  - Create a Clerk JWT template named `convex` with subject/user claims (Convex docs provide defaults).
  - Set env vars in `.env.local`:
    - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...`
    - `CLERK_SECRET_KEY=...`
    - `NEXT_PUBLIC_CONVEX_URL=...` (from `npx convex dev`)

Wiring Providers (Next.js App Router)

- In `app/layout.tsx`, wrap your tree like:
  `import { ClerkProvider } from "@clerk/nextjs"`
  and inside `<body>`:
  `<ClerkProvider> <ConvexClientProvider> ... </ConvexClientProvider> </ClerkProvider>`

Convex Provider

- `components/convex-provider.tsx:1` uses `ConvexProviderWithClerk` and ensures a user record via `api.users.ensureCurrentUser` when signed in.

Ensuring Users in Convex

- `convex/users.ts:1` exposes `ensureCurrentUser` which reads `ctx.auth.getUserIdentity()` (populated from Clerk token) and upserts a user row with `externalId`.

Files

- Schema: `convex/schema.ts:1`
- Functions:
  - Users: `convex/users.ts:1`
  - Courses: `convex/courses.ts:1`
  - Notifications: `convex/notifications.ts:1`

Install & Init

1. Add dependency and initialize Convex
   - Install: `yarn add convex`
   - Init project types: `npx convex dev`
     - This opens a Convex dev deployment and generates `convex/_generated/*`.

2. Log in / link (first time)
   - `npx convex dev` will prompt to log in and create/link a project.

3. Run local dev
   - Keep `npx convex dev` running in one terminal.
   - In another: `yarn dev` to run Next.js.

Using From the App

- Preferred: Use Convex React client in client components.
  - Create a client: `import { ConvexReactClient } from "convex/react"`
  - Provider at app root and use generated hooks to call queries/mutations.

Example (after types are generated)

```tsx
// lib/convexClient.ts
import { ConvexReactClient } from 'convex/react';
export const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
```

```tsx
// app/providers.tsx (wrap at a high level)
'use client';
import { ConvexProvider } from 'convex/react';
import { convex } from '@/lib/convexClient';
export function Providers({ children }: { children: React.ReactNode }) {
	return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
```

```tsx
// example usage in a component
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

const items = useQuery(api.courses.list, {});
const createCourse = useMutation(api.courses.create);
```

Next Steps

- Expand schema: resources, certificates, live sessions, purchases already modeled. Add functions for them as needed.
- Replace mocks gradually: update `lib/*-service.ts` to call Convex queries/mutations behind a feature flag.
- Auth: Map `lib/auth.tsx` users to Convex `users` and replace localStorage with a real auth provider + server-side session.

Deploy

- Create a production deployment with `npx convex deploy` once ready.
- Point `NEXT_PUBLIC_CONVEX_URL` at the desired deployment.

Notes

- The repo currently ignores TS build failures; after generating Convex types, you can tighten type checks.
- Do not commit secrets. Convex stores its own secrets; keep app env in `.env.local`.
