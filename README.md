# Doctrina LMS

> A modern Learning Management System for medical aesthetics education, connecting expert instructors with healthcare professionals seeking to advance their careers.

## Overview

Doctrina LMS is a comprehensive educational marketplace platform designed specifically for the medical aesthetics industry. The platform enables licensed healthcare professionals to share their expertise through courses, live sessions, and resources while providing students with a structured learning path, progress tracking, and professional certificates.

### Current Status

**In Development** - The frontend application is feature-complete with a fully functional UI and mocked services. The backend infrastructure (Convex + Clerk) is scaffolded and ready for integration.

**What's Working:**

- ✅ Complete UI/UX with responsive design
- ✅ Course browsing and detail pages
- ✅ Resource library with search and filtering
- ✅ Live session scheduling interface
- ✅ Certificate generation and verification UI
- ✅ Payment checkout flows (Stripe-ready)
- ✅ Notification system
- ✅ AI-powered recommendations
- ✅ Admin dashboard and analytics

**What Needs Setup:**

- 🔧 Convex backend integration (schema ready, functions need wiring)
- 🔧 Clerk authentication setup
- 🔧 Real data persistence (currently using mocked services)
- 🔧 Payment processing (Stripe Connect integration)
- 🔧 File storage for course materials

## Key Features

### For Students

- **Course Marketplace** - Browse and enroll in courses taught by verified medical aesthetics professionals
- **Resource Library** - Access supplementary materials, templates, and reference documents
- **Live Sessions** - Join scheduled live training sessions with instructors
- **Progress Tracking** - Monitor your learning journey with detailed analytics
- **Certificates** - Earn verifiable certificates upon course completion
- **Personalized Recommendations** - AI-powered course suggestions based on your interests and progress

### For Instructors

- **Course Creation** - Build comprehensive courses with video lessons, quizzes, and resources
- **Live Session Management** - Schedule and conduct live training sessions
- **Student Analytics** - Track student engagement and performance
- **Revenue Dashboard** - Monitor earnings and course performance
- **Content Management** - Upload and organize course materials efficiently

### For Administrators

- **Platform Analytics** - Comprehensive metrics on user engagement and platform growth
- **Instructor Verification** - Manage instructor applications and credentials
- **Content Moderation** - Review and approve courses before publication
- **User Management** - Administer student and instructor accounts
- **System Configuration** - Control platform settings and policies

## Tech Stack

### Frontend

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **UI Library:** React 19
- **Styling:** Tailwind CSS + shadcn/ui components
- **State Management:** React hooks and context (lightweight)

### Backend (In Progress)

- **Database:** Convex (real-time, serverless)
- **Authentication:** Clerk (planned)
- **Payments:** Stripe Connect (scaffolded)
- **File Storage:** Convex file storage or AWS S3

### Development Tools

- **Package Manager:** Yarn 1 (managed via Volta)
- **Node Version:** 24 (managed via Volta)
- **Linting:** ESLint
- **Type Checking:** TypeScript strict mode

## Getting Started

### Prerequisites

- Node.js 24+ (recommended via Volta)
- Yarn 1.x
- A Convex account (free tier available)
- A Clerk account (free tier available)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd doctrina-lms2
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Run the development server** (with mocked services)

   ```bash
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Backend Setup (Coming Soon)

Full setup instructions for Convex and Clerk integration are documented in:

- `docs/SETUP.md` - Step-by-step backend configuration
- `docs/CONVEX.md` - Convex-specific setup and usage
- `docs/ARCHITECTURE.md` - System architecture overview

## Project Structure

```
doctrina-lms2/
├── app/                    # Next.js App Router pages and layouts
│   ├── admin/             # Admin dashboard pages
│   ├── courses/           # Course browsing and learning pages
│   ├── dashboard/         # Student/instructor dashboards
│   ├── resources/         # Resource library pages
│   ├── live/              # Live session pages
│   └── ...                # Other feature pages
├── components/            # React components
│   ├── ui/               # shadcn/ui base components
│   ├── analytics/        # Analytics and chart components
│   ├── course-wizard/    # Course creation components
│   └── ...               # Feature-specific components
├── lib/                  # Services and utilities
│   ├── *-service.ts      # Mocked domain services
│   ├── auth.tsx          # Authentication (currently mocked)
│   └── utils.ts          # Utility functions
├── convex/               # Convex backend (scaffolded)
│   ├── schema.ts         # Database schema
│   ├── users.ts          # User queries/mutations
│   ├── courses.ts        # Course queries/mutations
│   └── ...               # Other data functions
├── hooks/                # Custom React hooks
├── public/               # Static assets
└── docs/                 # Documentation
```

## Available Scripts

```bash
# Development
yarn dev          # Start Next.js dev server (mocked services)
yarn convex       # Start Convex dev server (when ready)

# Build & Deploy
yarn build        # Build for production
yarn start        # Start production server

# Code Quality
yarn lint         # Run ESLint
yarn type-check   # Run TypeScript compiler check
```

## Documentation

- **[AGENTS.md](./AGENTS.md)** - AI agent guide for understanding the codebase
- **[docs/CONVEX.md](./docs/CONVEX.md)** - Convex backend setup and usage
- **docs/SETUP.md** _(coming soon)_ - Complete setup instructions
- **docs/ARCHITECTURE.md** _(coming soon)_ - Technical architecture deep-dive
- **docs/DB-SCHEMA.md** _(coming soon)_ - Database schema documentation

## Current State: Mocked Services

The application currently uses mocked services located in `lib/*-service.ts`. These provide realistic data and delays to simulate a working backend, allowing full frontend development and testing without a live database.

**Mocked Services:**

- `lib/auth.tsx` - Authentication (localStorage-based)
- `lib/ai-service.ts` - AI features (placeholder)
- `lib/notification-service.ts` - Notifications (in-memory)
- `lib/recommendation-service.ts` - Course recommendations
- `lib/resource-library-service.ts` - Resource library data
- `lib/search-service.ts` - Search functionality
- `lib/payment-service.ts` - Payment processing
- `lib/live-session-service.ts` - Live session management

**Migration Path:** Replace mocked services with real Convex queries/mutations once backend is wired.

## Security & Privacy

- **Environment Variables:** Never commit secrets. Use `.env.local` for local development.
- **Authentication:** Clerk will provide secure, production-ready auth when integrated.
- **Data Protection:** All user data will be encrypted at rest and in transit.
- **HIPAA Consideration:** Professional license information requires extra security measures.

## Contributing

This is currently a private project. Contribution guidelines will be added when the project is ready for external contributors.

## License

Proprietary - All rights reserved.

## Support

For questions or issues, please contact the development team.

---

**Note:** This platform is under active development. Features and documentation are subject to change.
