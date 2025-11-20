# Feature Spec: Authentication Enhancement

**Status:** Example  
**Created:** 2025-11-20  
**Owner:** Droidz Framework  
**Estimated Time:** 45-60 minutes sequential | 20-25 minutes parallel (3x speedup)

---

## Overview

Enhance the existing Clerk authentication system with two-factor authentication (2FA) and session management features.

---

## Problem Statement

Current authentication system uses Clerk for basic email/password login. Users need:

- Two-factor authentication for enhanced security
- Session management to view/revoke active sessions
- Login history and audit trail

---

## Proposed Solution

Implement 2FA using TOTP (Time-based One-Time Password) with QR code enrollment, and create a session management dashboard.

---

## Technical Design

### Architecture

```
Frontend (React/Next.js)
├── /app/settings/security/page.tsx - Security settings page
├── /app/settings/sessions/page.tsx - Session management page
└── /components/auth/
    ├── TwoFactorSetup.tsx - QR code enrollment
    ├── TwoFactorVerify.tsx - OTP verification form
    └── SessionList.tsx - Active sessions display

Backend (Convex)
├── /convex/auth2fa.ts - 2FA query/mutation functions
├── /convex/sessions.ts - Session management functions
└── /convex/schema.ts - New tables: twoFactorSecrets, loginHistory

Database Schema Changes
├── twoFactorSecrets table
│   ├── userId (ref to users)
│   ├── secret (encrypted)
│   ├── enabled (boolean)
│   └── backupCodes (array)
└── loginHistory table
    ├── userId (ref to users)
    ├── timestamp
    ├── ipAddress
    ├── userAgent
    └── sessionId
```

### Data Flow

1. **2FA Enrollment:**
   - User clicks "Enable 2FA" → Frontend calls `generateSecret` mutation
   - Display QR code (generated from secret) → User scans with authenticator app
   - User enters OTP → Frontend calls `verifyAndEnable` mutation
   - Backend validates OTP, saves encrypted secret to database

2. **2FA Verification (Login):**
   - Clerk login succeeds → Check if user has 2FA enabled
   - If enabled, prompt for OTP → Call `verifyOTP` query
   - If valid, complete login → Create session record in loginHistory

3. **Session Management:**
   - User visits /settings/sessions → Frontend calls `getUserSessions` query
   - Display active sessions with metadata → User can revoke sessions
   - Revoke action → Call `revokeSession` mutation

---

## Task Breakdown

### Phase 1: Foundation (Sequential - 5 min)

- [ ] Analyze existing Clerk integration
- [ ] Review security standards in `.factory/standards/security.md`
- [ ] Install dependencies: `speakeasy` (TOTP), `qrcode` (QR generation)

### Phase 2: Parallel Implementation (3 agents - 20-25 min)

#### Stream A: Backend 2FA & Sessions (droidz-codegen)

- [ ] Create `convex/auth2fa.ts`
  - [ ] `generateSecret` mutation - Create TOTP secret
  - [ ] `verifyAndEnable` mutation - Validate OTP and enable 2FA
  - [ ] `verifyOTP` query - Validate OTP during login
  - [ ] `disableTwoFactor` mutation - Disable 2FA
- [ ] Create `convex/sessions.ts`
  - [ ] `createSession` mutation - Record login
  - [ ] `getUserSessions` query - Get user's active sessions
  - [ ] `revokeSession` mutation - Revoke specific session
- [ ] Update `convex/schema.ts`
  - [ ] Add `twoFactorSecrets` table
  - [ ] Add `loginHistory` table

#### Stream B: Frontend UI (droidz-codegen)

- [ ] Create `app/settings/security/page.tsx`
  - [ ] Server Component layout
  - [ ] Security settings section
- [ ] Create `components/auth/TwoFactorSetup.tsx`
  - [ ] QR code display (use `qrcode.react`)
  - [ ] OTP input form
  - [ ] Backup codes display
- [ ] Create `components/auth/TwoFactorVerify.tsx`
  - [ ] OTP verification form during login
  - [ ] Error handling
- [ ] Create `app/settings/sessions/page.tsx`
  - [ ] Session list display
- [ ] Create `components/auth/SessionList.tsx`
  - [ ] Table of active sessions
  - [ ] Revoke session button

#### Stream C: Tests (droidz-test)

- [ ] Create `convex/__test__/auth2fa.test.ts`
  - [ ] Test secret generation
  - [ ] Test OTP verification (valid/invalid)
  - [ ] Test enable/disable 2FA
- [ ] Create `convex/__test__/sessions.test.ts`
  - [ ] Test session creation
  - [ ] Test session retrieval
  - [ ] Test session revocation
- [ ] Create `components/auth/__test__/TwoFactorSetup.test.tsx`
  - [ ] Test QR code rendering
  - [ ] Test OTP submission
- [ ] Create `components/auth/__test__/SessionList.test.tsx`
  - [ ] Test session display
  - [ ] Test revoke action

### Phase 3: Integration (Sequential - 5 min)

- [ ] Integrate 2FA check into Clerk auth flow
- [ ] Test end-to-end: enrollment → login with OTP → session management
- [ ] Update documentation
- [ ] Create pull request

---

## Acceptance Criteria

- [ ] Users can enable 2FA via QR code enrollment
- [ ] Users can verify OTP during login
- [ ] Users can view active sessions (IP, device, timestamp)
- [ ] Users can revoke individual sessions
- [ ] All tests passing (100% coverage)
- [ ] TypeScript strict mode (no errors)
- [ ] Zero ESLint warnings
- [ ] Security standards followed (encrypted secrets, rate limiting)

---

## Dependencies

**NPM Packages:**

- `speakeasy` - TOTP generation/verification
- `qrcode.react` - QR code generation
- (Already installed: Clerk, Convex)

**Standards:**

- `.factory/standards/security.md` - Security best practices
- `.factory/standards/react-convex.md` - Convex patterns
- `.factory/standards/testing.md` - Test requirements

---

## Orchestration Notes

This spec demonstrates the **parallel execution pattern** for Droidz:

**Sequential Approach:** 45-60 minutes

1. Backend (20-25 min) → Frontend (20-25 min) → Tests (15-20 min)

**Parallel Approach:** 20-25 minutes (3x speedup)

1. Foundation (5 min) →
2. **3 Agents in Parallel:**
   - Backend: 20-25 min
   - Frontend: 20-25 min
   - Tests: 15-20 min (finishes first, waits)
3. → Integration (5 min)

**Why Parallel Works Here:**

- ✅ Backend and Frontend are independent (Frontend mocks backend during dev)
- ✅ Tests can be written based on spec (don't need implemented code)
- ✅ Clear interfaces defined (API contracts)
- ✅ No blocking dependencies between streams

**When to Use Orchestrator:**

- 3+ independent work streams
- 5+ files to create/modify
- Multi-domain feature (frontend + backend + tests)
- 30+ minutes of sequential work
- Explicit user request for parallel execution

**When NOT to Use:**

- Single file modifications
- Simple bug fixes
- Documentation-only changes
- Linear dependency chains (A must finish before B can start)

---

## Example Usage

To implement this spec with Droidz orchestration:

```bash
# Option 1: Let Claude Code auto-detect complexity
"Implement the 2FA authentication enhancement from the spec"

# Option 2: Explicitly request orchestration
"Use orchestrator to implement 2FA feature in parallel"

# Option 3: Manual orchestration
"Orchestrate: Stream A = backend 2FA, Stream B = frontend UI, Stream C = tests"
```

The orchestrator will:

1. Read this spec
2. Spawn 3 agents (codegen, codegen, test)
3. Provide progress updates (file creation observable via git status)
4. Synthesize results when complete
5. Create integration PR

---

## Notes

- Encrypt TOTP secrets at rest (use Convex encrypted fields or environment variables)
- Implement rate limiting on OTP verification (max 5 attempts)
- Generate backup codes during enrollment (store hashed)
- Use Clerk webhooks to sync session state
- Consider FIDO2/WebAuthn for future enhancement

---

**This is an example spec showing proper format, task breakdown, and orchestration potential.**
