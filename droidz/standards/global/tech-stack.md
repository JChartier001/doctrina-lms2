# Tech Stack - Doctrina LMS

Last Updated: 2025-11-25

## Framework & Runtime

- **Application Framework:** Next.js 16.0.1 (App Router with Turbopack)
- **Language/Runtime:** TypeScript 5.9.3 (strict mode), Node.js 24.10.0
- **Package Manager:** Bun 1.2.0 (primary), Yarn 4.10.3 (via Volta)

## Frontend

- **UI Framework:** React 19.2.0 (latest)
- **CSS Framework:** Tailwind CSS 4.1.17 + PostCSS
- **UI Components:** shadcn/ui (Radix UI primitives)
  - @radix-ui/* components (v1.x)
  - class-variance-authority for variants
  - tailwind-merge for class merging
- **Forms:** React Hook Form 7.66.0 + @hookform/resolvers
- **Validation:** Zod 4.1.12
- **Animation:** Framer Motion 12.23.24
- **Charts:** Recharts 3.3.0
- **Icons:** Lucide React 0.553.0
- **Date Handling:** date-fns 4.1.0, dayjs 1.11.19

## Backend & Database

- **Backend:** Convex 1.28.2 (serverless, real-time)
- **Helpers:** convex-helpers 0.1.104
- **Database:** Convex (serverless, reactive)
- **Real-time:** Built into Convex (WebSocket-based)

## Authentication & Payments

- **Authentication:** Clerk 6.34.5
  - @clerk/nextjs (client-side)
  - @clerk/backend (server-side)
  - @clerk/themes (UI theming)
- **Payments:** Stripe 19.3.0
- **Webhooks:** Svix 1.81.0

## Testing & Quality

- **Test Framework:** Vitest 4.0.8
- **Testing Library:** 
  - @testing-library/react 16.3.0
  - @testing-library/jest-dom 6.9.1
  - @testing-library/user-event 14.6.1
- **Convex Testing:** convex-test 0.0.38
- **Test Environment:** happy-dom 20.0.10
- **Coverage:** @vitest/coverage-v8 4.0.8
- **Test UI:** @vitest/ui 4.0.8
- **Linting:** ESLint 9.39.1
  - eslint-config-next 16.0.1
  - eslint-config-prettier 10.1.8
  - @convex-dev/eslint-plugin 1.0.0
  - eslint-plugin-simple-import-sort 12.1.1
  - eslint-plugin-no-only-tests 3.3.0
- **Formatting:** Prettier 3.6.2

## Development Tools

- **Dev Commands:** npm-run-all 4.1.5
- **Theme:** next-themes 0.4.6
- **Drag & Drop:** @hello-pangea/dnd 18.0.1
- **Command Menu:** cmdk 1.1.1
- **Utilities:** 
  - clsx 2.1.1
  - uuid (latest)
  - chalk 5.6.2 (CLI)
  - ora 9.0.0 (CLI spinners)

## Quality Standards

- **Zero Warnings Policy:** `yarn lint --max-warnings 0`
- **Type Safety:** TypeScript strict mode enabled
- **Test Coverage:** 100% coverage target
- **Format Check:** Prettier enforced on all commits
