Doctrina LMS — AI Agent Guide

Purpose

- Goal: Medical aesthetics LMS prototype showcasing courses, resources, recommendations, live sessions, certificates, and payments.
- Status: Frontend-first Next.js app with mocked services. Safe to iterate without a backend.

Tech Stack

- Framework: Next.js App Router (Next 15) with React 19 and TypeScript.
- Styling: Tailwind CSS + shadcn/ui (Radix primitives).
- State: Local React state and lightweight contexts (auth).
- Build: Volta pins Node 24 and Yarn 1; Next build disabled type/ESLint blocking for iteration.

Architecture

- App Shell: Global layout, theme, auth provider, and nav live in `app/` and `components/`.
- Routes: Pages are in `app/<route>/page.tsx`. Many pages are demos wired to mock services.
- Services: Domain logic in `lib/*-service.ts`. All services are in-memory mocks with artificial delays and can be swapped for real APIs.
- Server Actions: Minimal actions in `app/actions/*` to simulate server-side behaviors.

Directory Map

- `app/`: App Router pages and global layout.
- `components/`: UI building blocks; shadcn-derived components are under `components/ui/`.
- `lib/`: Mock services (AI, auth, notifications, payments, recommendations, resources, search, utils).
- `hooks/`: Client hooks (toasts, media query, etc.).
- `public/`: Static assets.
- `.next/`: Build output (present in repo; ignore for source diffs).

Key Entry Points

- Root layout and providers: `app/layout.tsx:1`
- Landing/home redirect logic: `app/page.tsx:1`
- Dashboard example page: `app/dashboard/page.tsx:1`
- UI theme provider: `components/theme-provider.tsx:1`
- Utility helpers: `lib/utils.ts:1`

Core Services (Mocked)

- AI: `lib/ai-service.ts:1`
  - Placeholder with `AIService` class and stubs for quiz questions, summaries, keywords. Replace with a real LLM call.
- Auth: `lib/auth.tsx:1`
  - Client-only context using localStorage and mock users. Switch to real auth by replacing provider and effects.
- Notifications: `lib/notification-service.ts:1`
  - In-memory list with CRUD and relative time formatter; used by server actions.
- Recommendations: `lib/recommendation-service.ts:1`
  - Generates course/pathway suggestions from static data + simple heuristics.
- Resource Library: `lib/resource-library-service.ts:1`
  - Rich mock dataset, search/filter helpers, favorites, categories/types, and related content.
- Search: `lib/search-service.ts:1`
  - Cross-entity search and suggestions over a mock index; includes debounced helper.
- Payments: `lib/payment-service.ts:1`
  - Simulated checkout and payment intents; stores sessions in localStorage.
- Live Sessions: `lib/live-session-service.ts:1`
  - Mock CRUD and lifecycle for scheduled/live/completed sessions.

Server Actions

- Quiz generation (mock): `app/actions/generate-quiz.ts:1`
- Notifications actions: `app/actions/notifications.ts:1`

Notable UI Flows

- Course wizard with AI quiz generator UI: `components/course-wizard/ai-quiz-generator.tsx:1` (calls the server action above).
- Recommendations widgets: `components/recommendation/*`.
- Resource library views: `components/resource-library/*` and `app/resources/*`.

Routing Overview (selected)

- `/` → Home (redirects to `/dashboard` when “logged in”). `app/page.tsx:1`
- `/dashboard` → Metrics and recommendations. `app/dashboard/page.tsx:1`
- `/login`, `/signup` → Mock auth flows. `app/login/page.tsx:1`, `app/signup/page.tsx:1`
- `/resources` → Library and detail. `app/resources/page.tsx:1`
- `/recommendations` → Suggested content. `app/recommendations/page.tsx:1`
- `/notifications` → Inbox. `app/notifications/page.tsx:1`
- `/live` → Live sessions. `app/live/page.tsx:1`
- `/community`, `/programs`, `/profile`, `/settings`, `/search` similarly map to pages in `app/`.

Environment & Config

- Next config: `next.config.mjs:1` (ignores type/ESLint errors during builds; images unoptimized).
- TypeScript: `tsconfig.json:1` (React/Next defaults).
- Styling: `tailwind.config.ts:1`, global CSS in `app/globals.css:1`.
- Dependencies and scripts: `package.json:1`.
- Secrets: `.env:1` currently contains a production-like MongoDB URI; treat as sensitive and prefer `.env.local` with a sanitized `/.env.example` for commits.

Dev Workflow

- Dev server: `yarn dev`
- Type check: `tsc --noEmit`
- Lint: `yarn lint` (builds do not fail on lint/type due to `next.config.mjs`).
- Build/start: `yarn build && yarn start`

What’s Real vs Mock

- Real: Pure UI components and page composition, client state, navigation, layout/theme.
- Mock: All domain services under `lib/*-service.ts` and server actions (artificial delays, static data, localStorage). No API/database is wired despite the `.env` entry.

Extension Points for Agents

- Replace mocks with real APIs:
  - Add fetch/SDK calls inside `lib/*-service.ts` and remove artificial delays.
  - Introduce data fetching in server components or Route Handlers under `app/api/*` if needed.
- Implement AI features:
  - Wire `lib/ai-service.ts` to your LLM provider and update `app/actions/generate-quiz.ts` to call it.
- Harden auth:
  - Replace `lib/auth.tsx` with a real auth provider (NextAuth/Auth.js, custom JWT, or BFF), remove auto-login and localStorage bootstrap.
- Persist data:
  - Back services with a database and move side effects from client to server actions/route handlers.
- Telemetry and errors:
  - Add basic logging and error boundaries; remove `ignoreDuringBuilds` and `ignoreBuildErrors` once types stabilize.

Conventions

- File naming: kebab-case for files, PascalCase for React components, TypeScript throughout.
- UI: Prefer components from `components/ui/*` and helpers in `lib/utils.ts:1` (`cn`, `debounce`).
- Patterns: Keep services stateless; return plain objects/arrays; keep artificial delays minimal and isolated.

Known Gaps

- `.next/` is checked in here; ignore for code review and do not edit.
- `lib/ai-service.ts` and several services are placeholders only.
- Build ignores types/ESLint; tighten before production.
- Mock auth auto-logs admin and persists to localStorage.

Security & Privacy

- Do not commit secrets. Move the MongoDB URI from `.env:1` to `.env.local` and add a redacted `/.env.example`.
- Avoid logging PII. The mock data uses fictional names; replace when integrating real data.

Quick Start (for Agents)

- Run locally: `yarn dev` and open `/dashboard`.
- Trace a feature: Find its page under `app/`, then its UI under `components/`, and its data under `lib/*-service.ts`.
- Swap a mock: Edit the corresponding `lib/*-service.ts` to call a real API and adjust `app/actions/*` if server involvement is needed.

Backend (Convex)

- See `docs/CONVEX.md:1` for setup, schema, and example calls.
