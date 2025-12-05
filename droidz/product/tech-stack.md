# Doctrina LMS - Tech Stack Documentation

## Overview

Doctrina LMS is built on a modern, type-safe technology stack optimized for real-time collaboration, developer experience, and scalability. This document details each technology choice, its rationale, and key usage patterns.

---

## Core Framework

### Next.js 16.0.1

**Category**: Application Framework
**Role**: Full-stack React framework with server-side rendering

**Rationale**:

- App Router provides modern file-based routing with layouts and loading states
- Server Components reduce client bundle size and improve initial load performance
- Built-in image optimization for thumbnails and media
- Turbopack for fast development builds
- Excellent TypeScript integration
- Large ecosystem and community support

**Key Patterns**:

```typescript
// Server Component (default)
export default async function CoursePage({ params }: { params: { id: string } }) {
	// Server-side data fetching
}

// Client Component (when needed)
('use client');
export function InteractiveComponent() {
	// Client-side interactivity
}
```

**Configuration Files**:

- `next.config.ts` - Framework configuration
- `app/layout.tsx` - Root layout
- `app/page.tsx` - Home page

---

## Frontend

### React 19.2.0

**Category**: UI Library
**Role**: Component-based user interface development

**Rationale**:

- Latest stable version with concurrent features
- Server Components support for improved performance
- Hooks API for state and side effects
- Strong TypeScript support
- Mature ecosystem with extensive tooling

**Key Patterns**:

```typescript
// Functional component with hooks
export function CourseCard({ course }: CourseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card onClick={() => setIsExpanded(!isExpanded)}>
      {/* ... */}
    </Card>
  );
}
```

### Tailwind CSS 4.1.17

**Category**: CSS Framework
**Role**: Utility-first styling

**Rationale**:

- Utility-first approach reduces context switching
- JIT compilation for minimal CSS bundle
- Built-in dark mode support
- Consistent design system through configuration
- Excellent developer experience with IDE integration

**Key Patterns**:

```tsx
// Utility classes for styling
<div className="flex items-center gap-4 p-6 bg-background rounded-lg shadow-md">
	<h2 className="text-xl font-semibold text-foreground">Course Title</h2>
</div>
```

**Configuration Files**:

- `tailwind.config.ts` - Theme and plugin configuration
- `app/globals.css` - Global styles and CSS variables

### Radix UI (shadcn/ui Pattern)

**Category**: Component Library
**Role**: Accessible, unstyled UI primitives

**Rationale**:

- Fully accessible (WAI-ARIA compliant)
- Unstyled primitives allow complete design customization
- Composable API for complex interactions
- shadcn/ui provides pre-styled components using Tailwind
- Copy-paste approach gives full control over components

**Components Used**:

- Accordion, Alert Dialog, Avatar, Button
- Card, Checkbox, Dialog, Dropdown Menu
- Form, Input, Label, Popover
- Progress, Select, Separator, Tabs
- Toast, Tooltip, and more

**Key Patterns**:

```typescript
// shadcn/ui component usage
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export function CourseCard() {
  return (
    <Card>
      <CardHeader>Course Title</CardHeader>
      <CardContent>
        <Button variant="default">Enroll Now</Button>
      </CardContent>
    </Card>
  );
}
```

**Location**: `components/ui/`

### Framer Motion 12.23.24

**Category**: Animation Library
**Role**: Declarative animations and gestures

**Rationale**:

- Declarative API simplifies complex animations
- Gesture support (drag, tap, hover)
- Layout animations for smooth transitions
- AnimatePresence for exit animations
- Performance optimized with hardware acceleration

**Key Patterns**:

```typescript
import { motion, AnimatePresence } from 'framer-motion';

export function AnimatedCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Content */}
    </motion.div>
  );
}
```

### Recharts 3.3.0

**Category**: Charting Library
**Role**: Data visualization for analytics

**Rationale**:

- Built on React with declarative API
- Responsive and customizable
- Good TypeScript support
- Composable chart components
- Active maintenance and community

**Key Patterns**:

```typescript
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

export function EnrollmentChart({ data }) {
  return (
    <LineChart data={data}>
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="enrollments" stroke="#8884d8" />
    </LineChart>
  );
}
```

---

## Backend and Database

### Convex 1.28.2

**Category**: Backend-as-a-Service
**Role**: Real-time database, serverless functions, file storage

**Rationale**:

- Real-time data synchronization out of the box
- Type-safe queries and mutations with TypeScript
- Automatic caching and optimistic updates
- Zero-configuration deployment
- Integrated authentication support
- Built-in file storage
- ACID transactions

**Key Patterns**:

```typescript
// convex/courses.ts - Query
export const list = query({
	handler: async ctx => {
		return await ctx.db.query('courses').collect();
	},
});

// convex/courses.ts - Mutation
export const create = mutation({
	args: {
		title: v.string(),
		description: v.string(),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error('Unauthorized');

		return await ctx.db.insert('courses', {
			...args,
			instructorId: identity.subject,
			createdAt: Date.now(),
		});
	},
});
```

**Schema Location**: `convex/schema.ts`
**Functions Location**: `convex/*.ts`

**Tables**:

- `users` - User profiles and roles
- `courses` - Course metadata
- `courseModules` - Course structure
- `lessons` - Lesson content
- `enrollments` - User-course relationships
- `lessonProgress` - Completion tracking
- `quizzes`, `quizQuestions`, `quizAttempts` - Assessment system
- `certificates` - Completion certificates
- `purchases` - Payment records
- `notifications` - User notifications
- `liveSessions`, `sessionParticipants` - Live events
- `resources`, `favorites` - Learning resources
- `courseReviews` - Ratings and feedback

---

## Authentication

### Clerk 6.34.5

**Category**: Authentication Service
**Role**: User authentication, session management, user metadata

**Rationale**:

- Pre-built UI components (sign-in, sign-up, user profile)
- Multiple authentication strategies (email, social, SSO)
- Webhook support for user sync
- React hooks for auth state
- Built-in session management
- Organization support for future B2B features

**Key Patterns**:

```typescript
// Server-side auth check
import { auth } from '@clerk/nextjs/server';

export default async function ProtectedPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  // ...
}

// Client-side auth hook
import { useUser } from '@clerk/nextjs';

export function UserProfile() {
  const { user, isLoaded } = useUser();
  if (!isLoaded) return <Loading />;
  return <div>{user?.firstName}</div>;
}
```

**Packages**:

- `@clerk/nextjs` - Next.js integration
- `@clerk/backend` - Server utilities
- `@clerk/themes` - UI theming

---

## Forms and Validation

### React Hook Form 7.66.0

**Category**: Form Library
**Role**: Form state management and validation

**Rationale**:

- Minimal re-renders with uncontrolled components
- Built-in validation with resolver support
- TypeScript-first design
- Small bundle size
- Easy integration with UI libraries

**Key Patterns**:

```typescript
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  title: z.string().min(1, 'Required'),
});

export function CourseForm() {
  const methods = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <Controller
          name="title"
          control={methods.control}
          render={({ field }) => <Input {...field} />}
        />
      </form>
    </FormProvider>
  );
}
```

### Zod 4.1.12

**Category**: Schema Validation
**Role**: Runtime type validation and TypeScript inference

**Rationale**:

- TypeScript-first with automatic type inference
- Composable schema definitions
- Rich validation primitives
- Integration with React Hook Form
- Used for both client and server validation

**Key Patterns**:

```typescript
import { z } from 'zod';

// Schema definition
export const courseSchema = z.object({
	title: z.string().min(1).max(200),
	description: z.string().min(10),
	price: z.number().positive().optional(),
	level: z.enum(['beginner', 'intermediate', 'advanced']),
});

// Type inference
type CourseInput = z.infer<typeof courseSchema>;

// Validation
const result = courseSchema.safeParse(data);
if (!result.success) {
	console.error(result.error.issues);
}
```

---

## Payments

### Stripe 19.3.0

**Category**: Payment Processing
**Role**: Course purchases and subscription management

**Rationale**:

- Industry-standard payment processing
- Excellent developer experience
- Comprehensive webhook system
- Built-in fraud protection
- Support for subscriptions (future)
- Global payment method support

**Key Patterns**:

```typescript
// Server-side checkout session creation
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createCheckoutSession(courseId: string, userId: string) {
	return await stripe.checkout.sessions.create({
		mode: 'payment',
		line_items: [{ price: priceId, quantity: 1 }],
		success_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}?success=true`,
		cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}`,
		metadata: { courseId, userId },
	});
}
```

**Webhook Location**: `app/api/webhooks/stripe/`

---

## Development Tools

### TypeScript 5.9.3

**Category**: Programming Language
**Role**: Type-safe JavaScript development

**Rationale**:

- Compile-time error detection
- Enhanced IDE support (autocomplete, refactoring)
- Better code documentation through types
- Required for Convex type generation
- Industry standard for large applications

**Configuration**: `tsconfig.json`

**Strict Mode Settings**:

- `strict: true`
- `noUncheckedIndexedAccess: true`
- `noImplicitAny: true`

### ESLint 9.39.1

**Category**: Linter
**Role**: Code quality and consistency

**Rationale**:

- Catches common errors and anti-patterns
- Enforces consistent code style
- Plugin ecosystem for framework-specific rules
- Zero warnings policy for quality enforcement

**Configuration**: `eslint.config.mjs`

**Key Plugins**:

- `eslint-config-next` - Next.js specific rules
- `eslint-config-prettier` - Prettier compatibility
- `eslint-plugin-simple-import-sort` - Import organization
- `@convex-dev/eslint-plugin` - Convex best practices

### Prettier 3.6.2

**Category**: Code Formatter
**Role**: Automatic code formatting

**Rationale**:

- Consistent code style without debates
- Integrates with ESLint
- IDE integration for format-on-save
- Reduces PR noise from formatting changes

**Configuration**: `.prettierrc`

### Vitest 4.0.8

**Category**: Test Framework
**Role**: Unit and integration testing

**Rationale**:

- Vite-native for fast execution
- Jest-compatible API
- Built-in TypeScript support
- UI mode for debugging
- Coverage reporting with v8

**Key Patterns**:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('CourseCard', () => {
  it('renders course title', () => {
    render(<CourseCard title="Test Course" />);
    expect(screen.getByText('Test Course')).toBeInTheDocument();
  });
});
```

**Configuration**: `vitest.config.ts`

**Testing Libraries**:

- `@testing-library/react` - React component testing
- `@testing-library/user-event` - User interaction simulation
- `@testing-library/jest-dom` - DOM assertions
- `convex-test` - Convex function testing
- `happy-dom` - DOM environment

---

## Package Management

### Bun 1.2.0 (Primary)

**Category**: Package Manager / Runtime
**Role**: Dependency management and script execution

**Rationale**:

- Significantly faster than npm/yarn
- Built-in TypeScript support
- Drop-in npm replacement
- Fast test execution
- Efficient dependency resolution

### Volta (Node Version Manager)

**Category**: Version Manager
**Role**: Consistent Node.js versions across team

**Configuration** (in `package.json`):

```json
{
	"volta": {
		"node": "24.10.0",
		"yarn": "4.10.3"
	}
}
```

---

## Additional Dependencies

### Utility Libraries

| Package                    | Version | Purpose                  |
| -------------------------- | ------- | ------------------------ |
| `date-fns`                 | 4.1.0   | Date manipulation        |
| `dayjs`                    | 1.11.19 | Lightweight date library |
| `clsx`                     | 2.1.1   | Conditional class names  |
| `tailwind-merge`           | 3.3.1   | Tailwind class merging   |
| `class-variance-authority` | 0.7.1   | Variant-based styling    |
| `lucide-react`             | 0.553.0 | Icon library             |
| `uuid`                     | latest  | Unique ID generation     |

### UI Enhancement

| Package                  | Version | Purpose            |
| ------------------------ | ------- | ------------------ |
| `@hello-pangea/dnd`      | 18.0.1  | Drag and drop      |
| `embla-carousel-react`   | 8.6.0   | Carousel component |
| `cmdk`                   | 1.1.1   | Command palette    |
| `react-resizable-panels` | 3.0.6   | Resizable layouts  |
| `vaul`                   | 1.1.2   | Drawer component   |
| `next-themes`            | 0.4.6   | Dark mode support  |
| `react-day-picker`       | 9.11.1  | Date picker        |
| `input-otp`              | 1.4.2   | OTP input          |

### Document Generation

| Package        | Version | Purpose            |
| -------------- | ------- | ------------------ |
| `jspdf`        | latest  | PDF generation     |
| `html2canvas`  | latest  | HTML to canvas     |
| `qrcode.react` | latest  | QR code generation |

### Integration

| Package          | Version | Purpose              |
| ---------------- | ------- | -------------------- |
| `svix`           | 1.81.0  | Webhook verification |
| `convex-helpers` | 0.1.104 | Convex utilities     |

---

## Environment Variables

### Required Variables

```env
# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...

# Database (Convex)
NEXT_PUBLIC_CONVEX_URL=https://...
CONVEX_DEPLOYMENT=...

# Payments (Stripe)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

---

## Architecture Decisions

### Why Convex over Traditional REST API

1. **Real-time by default**: No need to implement WebSockets or polling
2. **Type safety**: End-to-end TypeScript from database to frontend
3. **Optimistic updates**: Automatic UI updates before server confirmation
4. **Zero configuration**: No infrastructure management
5. **Integrated auth**: Seamless Clerk integration

### Why Clerk over NextAuth

1. **Pre-built UI**: Production-ready sign-in/up components
2. **User management**: Built-in profile and organization management
3. **Webhook system**: Easy user sync with database
4. **Enterprise ready**: SSO support for future B2B features

### Why shadcn/ui over Material UI

1. **No runtime**: Components are copied, not imported
2. **Full control**: Complete ownership of component code
3. **Accessibility**: Built on Radix UI primitives
4. **Tailwind native**: Consistent styling approach
5. **Customizable**: Easy theme and variant modifications

---

## Development Commands Reference

```bash
# Development
bun run dev              # Start frontend + backend
bun run dev:frontend     # Start Next.js only
bun run dev:backend      # Start Convex only

# Quality
bun run lint             # Run ESLint
bun run formatting       # Check Prettier
bun run typescript       # Type check
bun run verify           # All checks + tests

# Testing
bun run test             # Run tests
bun run test:watch       # Watch mode
bun run test:coverage    # With coverage

# Deployment
bun run build            # Production build
bun run convex:deploy    # Deploy Convex
```
