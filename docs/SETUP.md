# Doctrina LMS - Setup Guide

This guide walks you through setting up the complete Doctrina LMS stack, from development environment to production deployment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Convex Backend Setup](#convex-backend-setup)
4. [Clerk Authentication Setup](#clerk-authentication-setup)
5. [Environment Configuration](#environment-configuration)
6. [Service Layer Migration](#service-layer-migration)
7. [Stripe Payment Setup](#stripe-payment-setup)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- **Node.js 24+** (managed via [Volta](https://volta.sh/) recommended)
- **Yarn 1.x** package manager
- **Git** for version control
- A **Convex account** ([convex.dev](https://convex.dev))
- A **Clerk account** ([clerk.com](https://clerk.com))
- A **Stripe account** ([stripe.com](https://stripe.com)) for payment processing

### Installing Volta (Recommended)

```bash
# macOS/Linux
curl https://get.volta.sh | bash

# Windows
# Download installer from https://volta.sh
```

### Verify Installation

```bash
node --version  # Should show v24.x.x
yarn --version  # Should show 1.x.x
```

---

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd doctrina-lms2

# Install dependencies
yarn install
```

### 2. Run with Mocked Services (Quick Start)

To explore the UI without setting up the backend:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Note:** This runs with mocked services. All data is temporary and stored in memory/localStorage.

---

## Convex Backend Setup

### 1. Install Convex CLI

```bash
yarn add convex
```

### 2. Initialize Convex Project

```bash
npx convex dev
```

This command will:

1. Prompt you to log in to Convex (creates account if needed)
2. Create or link a Convex project
3. Generate TypeScript types in `convex/_generated/`
4. Start the Convex development server

**Keep this terminal running** - it watches for schema changes and regenerates types automatically.

### 3. Verify Convex Setup

After initialization, you should see:

- `convex/_generated/` directory with TypeScript types
- A `.env.local` file (if not present, create it)
- Console output showing Convex deployment URL

### 4. Add Convex Environment Variable

Copy the deployment URL from the console output and add to `.env.local`:

```bash
# .env.local
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

### 5. Test Convex Connection

In a new terminal (keep `npx convex dev` running):

```bash
# Run Next.js dev server
yarn dev
```

Open the browser console at [http://localhost:3000](http://localhost:3000) and check for Convex connection logs.

---

## Clerk Authentication Setup

### 1. Create Clerk Application

1. Go to [clerk.com](https://clerk.com) and sign up/log in
2. Create a new application
3. Choose authentication methods (Email, Google, LinkedIn recommended)
4. Note your **Publishable Key** and **Secret Key**

### 2. Create Convex JWT Template

Clerk must issue tokens that Convex can verify:

1. In Clerk Dashboard → **JWT Templates**
2. Click **New template** → Select **Convex**
3. Name it `convex` (exact name required)
4. The template should include:
   - Subject: `{{user.id}}`
   - Claims: `{{user.email}}`, `{{user.first_name}}`, `{{user.last_name}}`
5. Save the template

### 3. Install Clerk SDK

```bash
yarn add @clerk/nextjs
```

### 4. Add Clerk Environment Variables

Add to `.env.local`:

```bash
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Convex (already added earlier)
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

### 5. Configure Convex Auth

Update `convex/auth.config.ts`:

```typescript
export default {
	providers: [
		{
			domain: process.env.CLERK_DOMAIN || 'clerk.your-domain.com',
			applicationID: 'convex', // Must match JWT template name
		},
	],
};
```

### 6. Wrap App with Providers

Update `app/layout.tsx`:

```typescript
import { ClerkProvider } from '@clerk/nextjs';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexReactClient } from 'convex/react';

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL as string
);

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            {children}
          </ConvexProviderWithClerk>
        </ClerkProvider>
      </body>
    </html>
  );
}
```

### 7. Replace Mock Auth Service

Update components using `lib/auth.tsx` to use Clerk hooks:

```typescript
// Before (mocked)
import { useAuth } from '@/lib/auth';

// After (real Clerk auth)
import { useUser } from '@clerk/nextjs';

const { user, isLoaded } = useUser();
```

---

## Environment Configuration

### Complete `.env.local` Template

```bash
# Convex Backend
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Stripe Payments (optional, for later)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags (optional)
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_PAYMENTS=false
```

### `.env.example` for Version Control

Create `.env.example` with sanitized values:

```bash
# Copy .env.local to .env.example and replace real values with placeholders
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_KEY_HERE
```

**IMPORTANT:** Never commit `.env.local` to version control. Add it to `.gitignore`.

---

## Service Layer Migration

### Overview

The application currently uses mocked services in `lib/*-service.ts`. These need to be replaced with real Convex queries/mutations.

### Migration Strategy

**Phase 1: Read-Only Data** (Start Here)

1. Courses listing → `convex/courses.ts` queries
2. Resource library → `convex/resources.ts` queries
3. User profiles → `convex/users.ts` queries

**Phase 2: User Actions**

1. Course enrollment → `convex/purchases.ts` mutations
2. Favorites → `convex/favorites.ts` mutations
3. Notifications → `convex/notifications.ts` queries/mutations

**Phase 3: Advanced Features**

1. Live sessions → `convex/liveSessions.ts`
2. Certificates → `convex/certificates.ts`
3. Payment processing → Stripe + Convex integration

### Example: Migrating Course Service

**Before (Mocked):**

```typescript
// lib/course-service.ts
export async function getCourses() {
	await delay(500);
	return mockCourses;
}
```

**After (Real Convex):**

```typescript
// lib/course-service.ts
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';

export function useCourses() {
	return useQuery(api.courses.list);
}
```

**Usage in Component:**

```typescript
// components/course-list.tsx
import { useCourses } from '@/lib/course-service';

export function CourseList() {
  const courses = useCourses();

  if (courses === undefined) return <Loading />;

  return (
    <div>
      {courses.map(course => (
        <CourseCard key={course._id} course={course} />
      ))}
    </div>
  );
}
```

### Migration Checklist

- [ ] Update `lib/auth.tsx` to use Clerk
- [ ] Replace `lib/course-service.ts` with Convex queries
- [ ] Replace `lib/resource-library-service.ts` with Convex queries
- [ ] Replace `lib/notification-service.ts` with Convex queries/mutations
- [ ] Replace `lib/search-service.ts` with Convex search functions
- [ ] Update `lib/payment-service.ts` for Stripe + Convex
- [ ] Update `lib/live-session-service.ts` with Convex

---

## Stripe Payment Setup

### 1. Create Stripe Account

1. Sign up at [stripe.com](https://stripe.com)
2. Complete account verification
3. Enable test mode for development

### 2. Get API Keys

From Stripe Dashboard → Developers → API Keys:

- Copy **Publishable key** (starts with `pk_test_`)
- Copy **Secret key** (starts with `sk_test_`)

### 3. Set Up Stripe Connect (for Instructor Payments)

1. Go to Stripe Dashboard → **Connect** → **Get Started**
2. Choose **Standard** or **Express** accounts
3. Configure platform settings
4. Note your **Connect** credentials

### 4. Add Stripe Environment Variables

Update `.env.local`:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### 5. Install Stripe SDK

```bash
yarn add stripe @stripe/stripe-js
```

### 6. Configure Webhooks

1. In Stripe Dashboard → **Webhooks** → **Add endpoint**
2. URL: `https://your-domain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy webhook signing secret
5. Add to `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_...`

---

## Deployment

### Deploy Convex (Production)

```bash
# Deploy Convex backend to production
npx convex deploy --prod

# Note the production deployment URL
# Update your production environment variables
```

### Deploy Next.js (Vercel Recommended)

#### Option 1: Vercel (Easiest)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel Dashboard
# Project Settings → Environment Variables
```

#### Option 2: Docker/Self-Hosted

```bash
# Build production bundle
yarn build

# Start production server
yarn start
```

### Production Environment Variables

Ensure these are set in your production environment:

```bash
NEXT_PUBLIC_CONVEX_URL=https://your-prod-deployment.convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## Troubleshooting

### Convex Connection Issues

**Problem:** "Cannot connect to Convex"

**Solutions:**

1. Verify `NEXT_PUBLIC_CONVEX_URL` is set correctly
2. Ensure `npx convex dev` is running
3. Check network/firewall settings
4. Clear browser cache and reload

### Clerk Authentication Not Working

**Problem:** Users can't sign in

**Solutions:**

1. Verify JWT template is named exactly `convex`
2. Check Clerk environment variables are correct
3. Ensure ClerkProvider wraps ConvexProviderWithClerk
4. Check browser console for specific error messages

### Type Generation Issues

**Problem:** TypeScript errors in `convex/_generated`

**Solutions:**

1. Stop `npx convex dev`
2. Delete `convex/_generated` directory
3. Run `npx convex dev` again
4. Restart your IDE/editor

### Mocked Services Still Active

**Problem:** Changes to Convex don't reflect in UI

**Solutions:**

1. Ensure you've replaced mock service with real Convex calls
2. Check if feature flag is disabling real backend
3. Verify component is using the updated service
4. Clear localStorage and refresh browser

### Build Failures

**Problem:** Production build fails

**Solutions:**

1. Run `yarn type-check` locally first
2. Fix all TypeScript errors
3. Ensure all environment variables are set
4. Check `next.config.mjs` for build config issues

---

## Next Steps

After completing setup:

1. ✅ **Test Authentication** - Sign up/log in with Clerk
2. ✅ **Verify Database** - Check Convex dashboard for user records
3. ✅ **Test Course Enrollment** - Enroll in a course, verify purchase record
4. ✅ **Test Payments** - Complete checkout flow with Stripe test cards
5. ✅ **Deploy to Staging** - Test full stack in production-like environment

## Additional Resources

- [Convex Documentation](https://docs.convex.dev)
- [Clerk Documentation](https://clerk.com/docs)
- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Stripe Integration Guide](https://stripe.com/docs)

## Getting Help

- **Convex Issues:** [Convex Discord](https://convex.dev/community)
- **Clerk Issues:** [Clerk Support](https://clerk.com/support)
- **Project Issues:** Contact the development team

---

**Last Updated:** 2025-01-XX
**Version:** 1.0
