# Third-Party Integration Specifications

## 1. Overview

This document details all third-party service integrations required for Doctrina LMS, including configuration, fallback strategies, and monitoring requirements.

## 2. Core Infrastructure Services

### 2.1 Convex (Backend Database & Real-Time Sync)

**Service Description:**

- Real-time database with automatic API generation
- File storage capabilities
- Serverless functions for backend logic
- Built-in authentication integration

**Integration Details:**

- **Deployment:** Convex Cloud (managed)
- **Pricing Tier:** Free tier for MVP → Pro ($25/month) → Scale (custom)
- **Region:** US East (primary)
- **Setup:** `npx convex dev` for local, `npx convex deploy` for production

**Configuration:**

```typescript
// convex.json
{
  "functions": "convex/",
  "node": {
    "version": "24"
  }
}
```

**Environment Variables:**

```bash
NEXT_PUBLIC_CONVEX_URL=https://[deployment].convex.cloud
CONVEX_DEPLOY_KEY=[production-key] # For CI/CD
```

**Key Features Used:**

- Real-time queries and mutations
- Scheduled functions (cron jobs)
- File storage for documents and images
- Full-text search capabilities
- Automatic schema validation

**Monitoring:**

- Dashboard: https://dashboard.convex.dev
- Metrics: Query performance, storage usage, function execution time
- Alerts: Error rate spikes, storage limits, rate limiting
- SLA: 99.95% uptime

**Fallback Strategy:**

- No real-time fallback: Convex is critical dependency
- Backup: Daily exports to S3 (future)
- Recovery: Point-in-time restore from Convex backups

**Cost Estimates:**

- Free tier: Up to 1GB storage, 1M function calls/month
- Pro tier ($25/month): 10GB storage, 10M function calls
- Scale tier: Custom pricing for >100GB or >100M calls
- MVP estimate: $0-25/month
- 1-year estimate: $100-500/month

### 2.2 Clerk (Authentication & User Management)

**Service Description:**

- Complete authentication solution
- Social OAuth (Google, LinkedIn, Apple)
- User management dashboard
- Secure session management
- Webhooks for user events

**Integration Details:**

- **Pricing Tier:** Free (10k MAU) → Pro ($25/month base + $0.02/MAU) → Enterprise (custom)
- **Setup:** `npm install @clerk/nextjs`
- **Dashboard:** https://dashboard.clerk.com

**Configuration:**

```typescript
// middleware.ts
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: ['/', '/about', '/courses'],
  ignoredRoutes: ['/api/webhooks/(.*)'],
});

// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

**Environment Variables:**

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
```

**Key Features Used:**

- Email/password authentication
- Google OAuth
- Email verification
- Password reset flows
- User metadata storage
- Session management
- Organization support (future)
- Multi-factor authentication (future)

**Webhook Events:**

```typescript
// app/api/webhooks/clerk/route.ts
// Handles: user.created, user.updated, user.deleted, session.created
```

**Monitoring:**

- Dashboard: Clerk Analytics
- Metrics: Sign-ups, sign-ins, active sessions, failed attempts
- Alerts: Unusual authentication activity, webhook failures
- SLA: 99.95% uptime

**Fallback Strategy:**

- No fallback: Clerk is critical dependency
- Degraded mode: Allow existing sessions, block new sign-ups temporarily
- Recovery: Clerk redundancy across regions (automatic)

**Cost Estimates:**

- Free tier: Up to 10,000 MAU
- Pro tier: $25/month + $0.02 per MAU above 10k
- MVP estimate: $0/month (under 10k users)
- 1-year estimate (50k users): $25 + ($0.02 × 40k) = $825/month

### 2.3 Vercel (Hosting & Edge Network)

**Service Description:**

- Next.js hosting optimized platform
- Global edge network (CDN)
- Automatic deployments from Git
- Preview deployments for PRs
- Serverless functions
- Image optimization API

**Integration Details:**

- **Pricing Tier:** Hobby (free) → Pro ($20/month) → Enterprise (custom)
- **Deployment:** Automatic via GitHub integration
- **Edge Network:** 100+ global locations

**Configuration:**

```json
// vercel.json
{
	"buildCommand": "npm run build",
	"outputDirectory": ".next",
	"framework": "nextjs",
	"regions": ["iad1"],
	"env": {
		"NEXT_PUBLIC_CONVEX_URL": "@convex-url",
		"NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY": "@clerk-publishable-key"
	}
}
```

**Environment Variables:**

- Stored in Vercel Dashboard
- Separate for Preview, Development, Production
- Encrypted at rest
- Accessible in build and runtime

**Key Features Used:**

- Automatic HTTPS with SSL certificates
- Git integration (deploy on push)
- Preview URLs for pull requests
- Environment variable management
- Analytics and monitoring
- Image optimization
- Edge functions (future)

**Monitoring:**

- Dashboard: https://vercel.com/dashboard
- Metrics: Build times, deployment status, bandwidth usage
- Analytics: Core Web Vitals, page views, errors
- Alerts: Build failures, high error rates

**Fallback Strategy:**

- Multi-region deployment (future)
- Manual deployment to backup hosting (extreme scenario)
- DNS failover to static maintenance page

**Cost Estimates:**

- Hobby tier: Free for personal projects
- Pro tier: $20/month + bandwidth overages
- Bandwidth: $0.15/GB after 1TB included
- MVP estimate: $20/month
- 1-year estimate (50TB bandwidth): $20 + ($0.15 × 49TB) = ~$750/month

## 3. Payment Processing

### 3.1 Stripe (Payments & Payouts)

**Service Description:**

- Payment processing
- Stripe Connect for marketplace payouts
- Subscription billing
- Invoice generation
- Fraud prevention
- PCI compliance

**Integration Details:**

- **Pricing:** 2.9% + $0.30 per transaction (standard)
- **Connect:** +0.5% for marketplace payments
- **Setup:** `npm install stripe @stripe/stripe-js @stripe/react-stripe-js`

**Configuration:**

```typescript
// lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: '2023-10-16',
	typescript: true,
});

// Client-side
import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
```

**Environment Variables:**

```bash
STRIPE_SECRET_KEY=sk_test_... # or sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # or pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_CLIENT_ID=ca_...
```

**Key Features Used:**

- Payment Intents API (for course purchases)
- Stripe Connect Express (for instructor payouts)
- Checkout Sessions (hosted payment page)
- Customer Portal (subscription management)
- Webhooks (payment confirmations)
- Invoicing (future - for enterprise customers)

**Stripe Connect Setup:**

```typescript
// Instructor onboarding flow
const account = await stripe.accounts.create({
	type: 'express',
	country: 'US',
	email: instructor.email,
	capabilities: {
		card_payments: { requested: true },
		transfers: { requested: true },
	},
});

const accountLink = await stripe.accountLinks.create({
	account: account.id,
	refresh_url: 'https://doctrina-lms.com/instructor/stripe/refresh',
	return_url: 'https://doctrina-lms.com/instructor/stripe/success',
	type: 'account_onboarding',
});
```

**Webhook Events:**

- `payment_intent.succeeded`
- `charge.refunded`
- `account.updated` (Connect)
- `transfer.created` (payouts)
- `invoice.payment_failed`

**Monitoring:**

- Dashboard: https://dashboard.stripe.com
- Metrics: Transaction volume, success rate, dispute rate
- Alerts: High failure rate, disputes, large transactions
- Reports: Daily reconciliation, monthly summaries

**Fallback Strategy:**

- Primary: Stripe (no immediate fallback)
- Manual processing: For disputes or edge cases
- Backup gateway: PayPal integration (future, if needed)

**Cost Estimates:**

- Per transaction: 2.9% + $0.30
- Connect fee: +0.5% per marketplace transaction
- MVP estimate (100 transactions @ $200 avg): $680/month in fees
- 1-year estimate (5k transactions @ $250 avg): $42,500/month in fees
  - Revenue: $1.25M
  - Fees: $42.5k (3.4%)
  - Net: $1.2M

## 4. Media & Content Delivery

### 4.1 Video Hosting & Streaming

#### **Primary Recommendation: Cloudflare Stream or Vimeo Business**

**Option A: Cloudflare Stream (Recommended for Scale)**

**Service Description:**

- Dedicated video streaming platform
- Built-in adaptive bitrate (HLS)
- Global CDN with 310+ locations
- Built-in video player
- DRM protection
- Video analytics
- Simple pricing model

**Why Cloudflare Stream:**

- **Cost:** Predictable per-minute pricing
- **Performance:** Cloudflare's global network
- **Simplicity:** Fully managed, no infrastructure
- **Features:** Everything needed for course videos
- **Reliability:** Cloudflare's 99.99% uptime SLA

**Integration Details:**

- **Pricing:** $1/1000 minutes stored + $1/1000 minutes delivered
- **Setup:** Cloudflare API integration
- **Dashboard:** https://dash.cloudflare.com

**Configuration:**

```typescript
// lib/cloudflare-stream.ts
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

// Upload video via Direct Creator Upload
const createUploadUrl = async () => {
	const response = await fetch(
		`https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/direct_upload`,
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				maxDurationSeconds: 21600, // 6 hours max
				requireSignedURLs: true,
				watermark: {
					uid: 'watermark-profile-id',
				},
			}),
		},
	);

	const data = await response.json();
	return data.result.uploadURL;
};

// Get video details
const getVideo = async (videoId: string) => {
	const response = await fetch(
		`https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/${videoId}`,
		{
			headers: {
				Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
			},
		},
	);
	return response.json();
};
```

**Environment Variables:**

```bash
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...
CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN=... # Optional custom domain
```

**Player Embed:**

```typescript
// components/VideoPlayer.tsx
export function CloudflareVideoPlayer({ videoId }: { videoId: string }) {
  return (
    <div style={{ position: 'relative', paddingTop: '56.25%' }}>
      <iframe
        src={`https://customer-subdomain.cloudflarestream.com/${videoId}/iframe`}
        loading="lazy"
        style={{
          border: 0,
          position: 'absolute',
          top: 0,
          height: '100%',
          width: '100%',
        }}
        allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
        allowFullScreen
      />
    </div>
  );
}
```

**Key Features:**

- Automatic transcoding to multiple resolutions (360p-1080p)
- HLS adaptive bitrate streaming
- Thumbnail generation (automatic)
- Direct upload from browser
- Video analytics (views, engagement)
- DRM protection (signed URLs)
- Watermarking support
- Live streaming support (future)

**Cost Estimates (100 courses, 10 hours each, 1000 minutes total):**

- Storage: 1000 minutes × $0.001 = $1/month
- Delivery (10,000 views, 100,000 minutes): 100,000 × $0.001 = $100/month
- **Total: $101/month**
- At scale (10,000 minutes storage, 1M minutes delivery): $10 + $1,000 = $1,010/month

**Option B: Vimeo Business (Recommended for MVP)**

**Service Description:**

- Professional video hosting platform
- Privacy controls and security
- Customizable player
- Video analytics
- Marketing tools integration

**Why Vimeo:**

- **Simplicity:** Easy setup, no infrastructure
- **Brand:** Professional, trusted platform
- **Features:** Player customization, privacy controls
- **Support:** Excellent customer support

**Integration Details:**

- **Pricing:** $75/month (up to 5TB storage/year)
- **Dashboard:** https://vimeo.com

**Cost Estimates:**

- Business Plan: $75/month (5TB/year)
- Premium Plan: $85/month (20TB/year)
- MVP estimate: $75-85/month

#### **Alternative Options:**

**Alternative A: AWS S3 + CloudFront (Maximum Control)**

**When to use:**

- Need complete infrastructure control
- Video storage > 10TB
- Custom video processing workflows
- Want lowest cost at massive scale

**Pros:**

- Extremely scalable
- Lowest cost per GB at scale
- Full AWS ecosystem integration
- Complete customization

**Cons:**

- Requires custom video player (Video.js)
- Need AWS MediaConvert for transcoding ($0.015/min)
- Complex setup and maintenance
- More moving parts to manage

**Cost Estimate (1TB storage, 10TB bandwidth):**

- S3 Storage: $23/month
- CloudFront: $850/month
- MediaConvert: ~$150 for 100 courses (one-time)
- **Total: $873/month** (cheaper than Cloudflare at very high scale)

**Alternative B: Mux (Developer-First)**

**When to use:**

- Premium developer experience valued
- Need advanced analytics
- Want modern API-first approach

**Pros:**

- Excellent API and documentation
- Great analytics dashboard
- Thumbnail generation
- Built for developers

**Cons:**

- More expensive than Cloudflare/Vimeo
- Newer platform

**Cost Estimate (1TB storage, 10TB transfer):**

- Storage: $15/month
- Encoding: $150 (one-time for 100 courses)
- Delivery: $1,500/month
- **Total: $1,515/month**

#### **Recommendation Summary:**

| Solution                 | Setup Complexity | Monthly Cost (MVP) | Monthly Cost (Scale) | Best For              |
| ------------------------ | ---------------- | ------------------ | -------------------- | --------------------- |
| **Vimeo Business** ⭐    | Low              | $75-85             | $85-150              | MVP, simple setup     |
| **Cloudflare Stream** ⭐ | Medium           | $100-200           | $500-1500            | Growth & scale        |
| AWS S3+CloudFront        | High             | $100-200           | $500-1000            | Maximum scale (>50TB) |
| Mux                      | Medium           | $150-300           | $1500+               | Premium analytics     |

**Decision: Start with Vimeo Business for MVP, migrate to Cloudflare Stream for scale**

### 4.2 Image Storage & Optimization

**Primary: Convex File Storage**

- User-uploaded images (profile photos, course thumbnails)
- Document files (certificates, business documents)
- Storage: Included in Convex pricing
- CDN: Automatic via Convex

**Secondary: Vercel Image Optimization**

- Optimizes images on-the-fly
- Converts to WebP automatically
- Responsive image sizing
- Caching at edge locations
- Cost: Included in Vercel Pro plan

**Configuration:**

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['[deployment].convex.cloud', 'doctrina-lms.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

// Usage in components
import Image from 'next/image';

<Image
  src={fileUrl}
  alt="Course thumbnail"
  width={400}
  height={300}
  loading="lazy"
/>
```

## 5. Communication Services

### 5.1 Email Service (Resend)

**Service Description:**

- Modern email API built for developers
- React Email templates
- High deliverability
- Simple, transparent pricing
- Built by Vercel team alumni

**Why Resend:**

- **Developer Experience:** Best-in-class API and docs
- **React Email:** Write templates in React/TypeScript
- **Cost:** Very competitive pricing
- **Deliverability:** Built on AWS SES with optimizations
- **Integration:** Perfect fit for Next.js apps

**Integration Details:**

- **Pricing:** Free (100 emails/day) → $20/month (50k emails)
- **Setup:** `npm install resend react-email`
- **Dashboard:** https://resend.com/emails

**Configuration:**

```typescript
// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Send email with React template
await resend.emails.send({
  from: 'Doctrina LMS <noreply@doctrina-lms.com>',
  to: user.email,
  subject: 'Welcome to Doctrina LMS',
  react: <WelcomeEmail name={user.firstName} />,
});

// Send with HTML fallback
await resend.emails.send({
  from: 'notifications@doctrina-lms.com',
  to: instructor.email,
  subject: 'New Student Enrolled',
  react: <InstructorNotificationEmail />,
  headers: {
    'X-Entity-Ref-ID': `enrollment-${enrollmentId}`,
  },
});
```

**Environment Variables:**

```bash
RESEND_API_KEY=re_...
RESEND_AUDIENCE_ID=... # For email lists (future)
```

**React Email Templates:**

```typescript
// emails/WelcomeEmail.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface WelcomeEmailProps {
  name: string;
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Doctrina LMS</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome, {name}!</Heading>
          <Text style={text}>
            We're excited to help you advance your career in medical aesthetics.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href="https://doctrina-lms.com/dashboard">
              Get Started
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};
// ... styles
```

**Email Templates to Create:**

**Student Emails:**

- Welcome email (registration)
- Email verification
- Password reset
- Course enrollment confirmation
- Course completion certificate
- Payment receipt
- Refund confirmation
- New course recommendations

**Instructor Emails:**

- Welcome email (instructor signup)
- Instructor application received
- Instructor application approved/rejected
- New student enrolled in your course
- Course published successfully
- Course review received
- Payout processed
- Monthly earnings report
- Student completed your course

**Admin Emails:**

- New instructor application
- Course pending review
- Refund request submitted
- Platform performance digest (weekly)

**Testing Emails:**

```bash
# Development preview server
npm run email:dev

# Opens http://localhost:3000
# Preview all email templates
```

**Monitoring:**

- Dashboard: https://resend.com/emails
- Metrics: Delivery rate, open rate, click rate, bounces, complaints
- Alerts: High bounce rate, delivery failures
- Logs: All emails sent with full metadata

**Deliverability Features:**

- SPF/DKIM/DMARC configuration guides
- Domain verification required
- Bounce and complaint handling
- Unsubscribe management
- Email list management (Audiences)

**Cost Estimates:**

- Free tier: 100 emails/day (3,000/month)
- Pro: $20/month (50,000 emails)
- Scale: $80/month (200,000 emails)
- MVP estimate: $0/month (under daily limit)
- 1-year estimate (100k emails/month): $40/month

## 6. Analytics & Monitoring

### 6.1 Google Analytics 4

**Service Description:**

- Web analytics
- User behavior tracking
- Conversion funnels
- Audience insights

**Integration Details:**

- **Pricing:** Free
- **Setup:** `npm install @next/third-parties`

**Configuration:**

```typescript
// app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
      </body>
    </html>
  );
}
```

**Environment Variables:**

```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

**Key Events Tracked:**

- Page views
- Course enrollments
- Quiz completions
- Course completions
- Certificate generations
- Payment transactions
- User registrations
- Video play events
- Search queries
- Course reviews submitted
- Instructor application submissions

### 6.2 Sentry (Error Tracking)

**Service Description:**

- Error and exception tracking
- Performance monitoring
- Release health tracking
- Source map support

**Integration Details:**

- **Pricing:** Free (5k events/month) → $26/month (50k events)
- **Setup:** `npm install @sentry/nextjs`

**Configuration:**

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
	dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
	tracesSampleRate: 0.1,
	replaysSessionSampleRate: 0.1,
	replaysOnErrorSampleRate: 1.0,
	environment: process.env.NODE_ENV,
});
```

**Environment Variables:**

```bash
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=... # For source maps upload
SENTRY_ORG=...
SENTRY_PROJECT=...
```

**Cost Estimates:**

- Free tier: 5k events/month
- MVP estimate: $0-26/month
- 1-year estimate (50k-100k events): $26-80/month

### 6.3 Vercel Analytics

**Service Description:**

- Real user monitoring
- Core Web Vitals tracking
- Built into Vercel platform

**Integration Details:**

- **Pricing:** Included in Pro plan ($20/month)
- **Setup:** Automatic (enable in Vercel dashboard)

## 7. Integration Testing Strategy

### Pre-Launch Integration Checklist

**Convex:**

- [ ] Database connection successful
- [ ] Real-time sync working
- [ ] File uploads/downloads working
- [ ] Scheduled functions running
- [ ] Backup configured

**Clerk:**

- [ ] Sign-up flow working (email & OAuth)
- [ ] Email verification sending
- [ ] Password reset working
- [ ] Webhook receiving events
- [ ] User sync to Convex working

**Stripe:**

- [ ] Test payments successful
- [ ] Connect account creation working (instructors)
- [ ] Payouts to instructors working
- [ ] Webhook events received
- [ ] Refund flow tested

**Video Platform (Vimeo/Cloudflare):**

- [ ] Video uploads successful
- [ ] Player embeds working
- [ ] Adaptive bitrate streaming
- [ ] Analytics tracking
- [ ] Privacy/security settings enforced

**Resend:**

- [ ] All email templates rendering
- [ ] Emails delivering successfully
- [ ] Unsubscribe links working
- [ ] SPF/DKIM configured

**Analytics:**

- [ ] GA4 events firing
- [ ] Sentry errors captured
- [ ] Vercel Analytics active

## 8. Vendor Contact Information

**Critical Support Contacts:**

**Convex:**

- Support: support@convex.dev
- Discord: https://convex.dev/community
- Docs: https://docs.convex.dev
- Status: https://status.convex.dev

**Clerk:**

- Support: support@clerk.com
- Discord: https://clerk.com/discord
- Docs: https://clerk.com/docs
- Status: https://status.clerk.com

**Stripe:**

- Support: https://support.stripe.com
- Phone: 1-888-926-2289
- Docs: https://stripe.com/docs
- Status: https://status.stripe.com

**Vimeo:**

- Support: https://vimeo.com/help
- Phone: 1-212-314-7300
- Docs: https://developer.vimeo.com
- Status: https://vimeostatus.com

**Cloudflare:**

- Support: https://support.cloudflare.com
- Community: https://community.cloudflare.com
- Docs: https://developers.cloudflare.com/stream
- Status: https://www.cloudflarestatus.com

**Resend:**

- Support: support@resend.com
- Discord: https://resend.com/discord
- Docs: https://resend.com/docs
- Status: https://status.resend.com

## 9. Total Cost Summary

### MVP Costs (First 3 Months, <500 users)

| Service               | Monthly Cost      |
| --------------------- | ----------------- |
| Convex                | $0-25             |
| Clerk                 | $0                |
| Vercel                | $20               |
| Stripe                | 3.4% of revenue   |
| Vimeo Business        | $75-85            |
| Resend                | $0                |
| Google Analytics      | $0                |
| Sentry                | $0-26             |
| **Total Fixed Costs** | **$95-156/month** |

### 1-Year Costs (10k students, 200 instructors)

| Service               | Monthly Cost           |
| --------------------- | ---------------------- |
| Convex                | $100-500               |
| Clerk                 | $225 (10k MAU)         |
| Vercel                | $500-750               |
| Stripe                | 3.4% of revenue        |
| Cloudflare Stream     | $500-1000              |
| Resend                | $40-80                 |
| Sentry                | $80                    |
| **Total Fixed Costs** | **$1,445-2,635/month** |

**Note:** Stripe fees are percentage-based and scale with revenue, not included in fixed costs above.

**Revenue Context:**

- 1,000 course enrollments/month @ $200 avg = $200,000 monthly revenue
- Stripe fees (3.4%): $6,800/month
- Platform costs: ~$2,000/month
- **Net operational margin:** 96% (before instructor payouts)

---

**Document Version:** 1.0
**Last Updated:** January 2025
**Next Review:** Quarterly
**Owner:** Engineering Team
