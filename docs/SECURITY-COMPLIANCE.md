# Security & Compliance Documentation

## 1. Overview

Doctrina LMS handles sensitive personal information (PII), professional licensing data for instructors, financial transactions, and proprietary educational content. This document outlines security measures, compliance requirements, and incident response procedures for the marketplace platform.

## 2. Data Classification

### 2.1 Data Categories

**Tier 1: Highly Sensitive (PII/Financial)**

- Instructor professional license numbers and expiration dates
- State licensing board information
- Payment information (handled by Stripe, not stored directly)
- Tax documentation (1099 forms, EIN/SSN for instructors)
- Stripe Connect account credentials
- Student payment methods (tokenized by Stripe)
- Refund and chargeback data

**Tier 2: Sensitive Personal Data**

- Email addresses and names
- Profile photos and biographical information
- Instructor application materials (resume, references, credentials)
- Course progress and completion records
- Quiz responses and assessment results
- Course reviews and ratings
- Community forum posts and messages
- Certificate records

**Tier 3: Platform Operational Data**

- Analytics and aggregated metrics
- System logs and error reports
- Course catalog and public content
- Anonymized usage statistics
- Public instructor profiles (with consent)

### 2.2 Data Storage Strategy

**Convex Database:**

- All Tier 1 and Tier 2 data stored in Convex
- Encrypted at rest using AES-256
- Encrypted in transit using TLS 1.3
- Geographic data residency: US-based servers only
- Row-level security enforced via Convex authorization

**File Storage:**

- Course videos: Vimeo Business or Cloudflare Stream (encrypted, DRM-protected)
- Course documents: Convex file storage (encrypted at rest)
- Profile photos: Convex file storage with access controls
- Certificates: Generated PDFs stored encrypted
- Instructor verification documents: Encrypted storage with restricted access

### 2.3 Marketplace-Specific Data Protection

**Course Content Intellectual Property:**

- Video watermarking with student email/ID
- DRM protection for video streaming
- PDF watermarking for downloadable materials
- Access token expiration for content URLs
- Download limits and forensic tracking

**Student Learning Data:**

- Quiz answers stored separately from question bank
- Progress tracking isolated per student
- Certificate verification via cryptographic signatures
- Anonymized data for course analytics

**Instructor Payout Data:**

- Earnings calculations auditable and logged
- Payout history retained for 7 years (IRS requirement)
- Bank account information tokenized by Stripe
- Tax form storage encrypted with additional layer

## 3. Compliance Requirements

### 3.1 Payment Card Industry (PCI DSS)

**PCI Compliance Strategy:**

- Use Stripe for all payment processing (PCI Level 1 compliant)
- No credit card data stored on platform servers
- Stripe hosted payment forms for card collection
- Tokenization for subscription payments
- Annual PCI DSS self-assessment questionnaire (SAQ A)

**Student Payment Security:**

- Checkout sessions expire after 24 hours
- Payment intent confirmation required
- Failed payment retry logic (max 3 attempts)
- Chargeback monitoring and fraud detection

**Instructor Payout Security:**

- Stripe Connect Express accounts for instructors
- Identity verification required before first payout
- Minimum payout threshold ($50) to reduce transaction costs
- Automatic hold period for new instructors (30 days)
- Payout fraud detection (unusual patterns flagged)

### 3.2 Instructor Licensing Compliance

**License Verification:**

- Primary source verification during application
- Cross-reference with state licensing board databases (Nursys, state portals)
- Annual re-verification for active instructors
- Immediate course suspension upon license expiration or revocation

**Credential Retention:**

- Verification records retained for 7 years
- Audit trail of all verification checks
- Secure storage of license copies and verification confirmations

### 3.3 Privacy Regulations

**GDPR Compliance (EU users if applicable):**

- Right to access: User data export feature
- Right to erasure: Account deletion with data removal
- Right to rectification: Profile editing capabilities
- Data portability: JSON export of user data
- Consent management: Clear opt-ins for marketing communications
- Cookie consent banner for EU visitors

**CCPA Compliance (California):**

- Privacy policy disclosure of data collection
- Opt-out mechanism for data sales (we don't sell data)
- Right to deletion within 45 days
- Non-discrimination for privacy rights exercise
- Annual privacy disclosures

**DMCA Compliance:**

- Copyright infringement reporting mechanism
- DMCA agent designated and registered
- Takedown procedure within 24 hours
- Counter-notification process
- Repeat infringer policy (3 strikes)

### 3.4 Educational Platform Compliance

**Accessibility (WCAG 2.1 AA):**

- Course content accessibility requirements for instructors
- Video captions mandatory for all courses
- Screen reader compatibility
- Keyboard navigation support
- Color contrast standards

**Consumer Protection:**

- Clear refund policy (30-day money-back guarantee)
- Course preview/free trial requirements
- Accurate course descriptions enforced
- Instructor credentials verified and displayed
- Student review authenticity verification

## 4. Encryption Standards

### 4.1 Data at Rest

**Database Encryption:**

- Convex provides AES-256 encryption at rest
- Encryption keys managed by Convex (AWS KMS)
- Database backups also encrypted
- Future: Customer-managed encryption keys (CMK) for enterprise

**File Storage Encryption:**

- Convex file storage: AES-256 encryption
- Video platform encryption: Provider-managed
- Document files: Encrypted before upload
- Certificates: Encrypted PDFs with digital signatures

**Application-Level Encryption (Future Enhancement):**

- Instructor tax ID numbers: Additional encryption layer
- Student payment tokens: Encrypted references to Stripe tokens
- Sensitive instructor verification documents: Field-level encryption

### 4.2 Data in Transit

**Transport Layer Security:**

- TLS 1.3 for all HTTPS connections
- HSTS headers to enforce HTTPS
- Certificate pinning for mobile apps (future)
- No support for TLS 1.0 or 1.1 (deprecated)

**API Communication:**

- All Convex API calls over HTTPS
- Stripe API calls using latest TLS
- Clerk authentication over secure channels
- Video streaming via encrypted HLS/DASH

### 4.3 Content Protection

**Video DRM:**

- Encrypted video streams (HLS-AES or MPEG-DASH)
- License server for key distribution
- Per-user playback tokens (expires after 24 hours)
- Screen capture prevention (mobile apps)

**Document Watermarking:**

- Dynamic watermarks with student email + timestamp
- PDF encryption with user-specific passwords
- Download tracking and forensic identifiers
- Copy protection metadata

## 5. Access Controls

### 5.1 Authentication

**User Authentication (Clerk):**

- Email/password with minimum requirements:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 number
  - At least 1 special character
- Social OAuth (Google, LinkedIn recommended for professionals)
- Email verification required before platform access
- Password reset via email with time-limited tokens (1 hour)
- Magic link authentication option

**Admin Authentication:**

- Admin users identified via `isAdmin: true` boolean field
- Invitation-only admin access
- Multi-factor authentication required for all admin accounts
- Session timeout: 30 minutes inactive, 4 hours maximum
- IP whitelist for admin panel access (optional)

**Instructor Authentication:**

- Standard user authentication
- Additional verification required for instructor role (`isInstructor: true`)
- Stripe Connect account linked before course creation
- Instructor-specific permissions assigned after approval

### 5.2 Authorization

**Role-Based Access Control (RBAC):**

**Student Role (Default):**

- Browse and preview courses
- Enroll in courses (free or paid)
- Access purchased course content
- Submit course reviews
- View own certificates and progress
- Participate in community forums

**Instructor Role (`isInstructor: true`):**

- All student permissions
- Create and manage courses
- View enrolled student progress (aggregate only)
- Access instructor earnings dashboard
- Withdraw earnings via Stripe Connect
- View course analytics and reviews

**Admin Role (`isAdmin: true`):**

- All platform access and user management
- Review and approve instructor applications
- Moderate course content and reviews
- Handle refund requests and disputes
- Access platform-wide analytics
- Configure system settings

**Row-Level Security:**

- Students can only access courses they've purchased
- Instructors can only view their own course data
- Students can only see their own progress and certificates
- Admins access logged for audit purposes
- Convex `ctx.auth.getUserIdentity()` enforces all queries

**Content Access Control:**

```typescript
// Example: Lesson access control
export const getLesson = query({
	args: { lessonId: v.id('lessons') },
	handler: async (ctx, { lessonId }) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error('Unauthorized');

		const lesson = await ctx.db.get(lessonId);
		if (!lesson) throw new Error('Lesson not found');

		const course = await ctx.db.get(lesson.courseId);

		// Check if user purchased the course
		const purchase = await ctx.db
			.query('purchases')
			.withIndex('by_user', q => q.eq('userId', identity.subject))
			.filter(q => q.eq(q.field('courseId'), course._id))
			.filter(q => q.eq(q.field('status'), 'complete'))
			.first();

		if (!purchase && course.price > 0) {
			throw new Error('Access denied: Course not purchased');
		}

		return lesson;
	},
});
```

### 5.3 Session Management

**Session Configuration:**

- Clerk-managed sessions with JWT tokens
- Token refresh on activity (extends session)
- Automatic logout after 30 minutes inactivity
- Maximum session duration: 8 hours (force re-authentication)
- Concurrent session limit: 5 devices per user

**Session Security:**

- HttpOnly cookies prevent XSS attacks
- Secure flag ensures HTTPS-only transmission
- SameSite=Strict prevents CSRF attacks
- Session IDs rotated on privilege escalation
- Device fingerprinting for suspicious login detection

**Course Access Tokens:**

- Video playback tokens expire after 24 hours
- Download tokens single-use or time-limited
- API tokens for mobile apps (refresh tokens rotate)

## 6. Backup & Disaster Recovery

### 6.1 Backup Strategy

**Database Backups (Convex):**

- Continuous backups (point-in-time recovery)
- Backup retention: 30 days
- Geographic redundancy: Multi-region replication
- Automated daily backups at 2 AM UTC
- Weekly full backups retained for 90 days

**File Storage Backups:**

- Convex file storage includes automatic versioning
- Course videos backed up by video platform provider
- Instructor verification documents: 30-day retention after deletion
- Certificate archives: Permanent retention

**Critical Data Prioritization:**

- Purchase records: Daily backups, 7-year retention
- Course content: Weekly backups, permanent retention
- Student progress: Daily backups, 3-year retention
- Certificates: Immutable storage, permanent retention

### 6.2 Recovery Objectives

**Recovery Point Objective (RPO):**

- Maximum data loss: 1 hour
- Continuous Convex backups enable point-in-time recovery

**Recovery Time Objective (RTO):**

- Platform restoration: 4 hours maximum
- Critical services (authentication, course access): 1 hour
- Payment processing: 30 minutes
- Full functionality including analytics: 8 hours

### 6.3 Disaster Recovery Plan

**Scenario 1: Database Failure**

1. Convex automatically fails over to replica
2. Verify data integrity after failover
3. Notify users if service degradation occurs (status page)
4. Post-incident review within 48 hours

**Scenario 2: Application Infrastructure Failure**

1. Vercel automatically routes to healthy regions
2. Monitor error rates and latency
3. Manual intervention if automatic recovery fails within 15 minutes
4. Incident communication to users within 1 hour

**Scenario 3: Payment System Compromise**

1. Immediately disable payment processing
2. Notify Stripe of suspected compromise
3. Forensic analysis of transaction logs
4. User notification within 24 hours
5. Payment processing restoration after security validation

**Scenario 4: Data Breach**

1. Immediate isolation of affected systems
2. Forensic analysis to determine breach scope
3. User notification within 72 hours (GDPR requirement)
4. Credential reset for affected users
5. Post-breach security audit and improvements
6. Regulatory reporting as required

**Scenario 5: Content Piracy**

1. Identify leaked content via watermark forensics
2. Issue DMCA takedown to hosting platforms
3. Suspend offending user account
4. Notify affected instructor
5. Review and strengthen content protection

## 7. Security Incident Response

### 7.1 Incident Classification

**Severity Levels:**

**P0 - Critical:**

- Data breach exposing PII or financial data
- Complete platform outage (>90% users affected)
- Payment system compromise or fraud
- Active ongoing attack with data exfiltration
- Instructor payout system breach

**P1 - High:**

- Partial data exposure (limited user set)
- Authentication system failure
- Payment processing disruption (>10% failures)
- Denial of service attack (platform degraded)
- Unauthorized admin access
- Mass course content piracy

**P2 - Medium:**

- Individual account compromise
- Minor data leak (non-sensitive, <100 users)
- Service degradation (>20% error rate)
- Suspicious activity patterns (credential stuffing)
- Fake review detection
- Single course content leak

**P3 - Low:**

- Failed login attempts (brute force, not successful)
- Minor vulnerabilities (non-exploitable)
- Performance issues without data impact
- Spam or low-quality content reports

### 7.2 Incident Response Workflow

**Detection:**

- Automated monitoring alerts (error rates, anomalies)
- User reports via security@doctrina-lms.com
- Regular security audits
- Penetration testing findings
- Stripe fraud alerts
- Video platform abuse reports

**Response Steps:**

1. **Acknowledge (within 15 minutes for P0/P1)**
   - Security team notified via PagerDuty
   - Incident response lead assigned
   - Incident ticket created in tracking system

2. **Assess (within 30 minutes)**
   - Determine severity level
   - Identify affected systems and data
   - Estimate user impact (number of users, data types)
   - Check for ongoing attack activity

3. **Contain (within 1 hour for P0/P1)**
   - Isolate affected systems
   - Revoke compromised credentials
   - Block malicious IP addresses
   - Rate limit affected endpoints
   - Implement temporary fixes (feature flags)

4. **Eradicate (timeline varies)**
   - Remove malware or unauthorized access
   - Patch vulnerabilities
   - Restore from clean backups if needed
   - Verify no persistence mechanisms remain

5. **Recover (RTO-based)**
   - Restore normal operations
   - Verify system integrity
   - Monitor for recurrence (24-48 hours heightened monitoring)
   - Gradual rollout if major changes

6. **Communicate**
   - Internal stakeholders: Immediately
   - Affected users: Within 72 hours (GDPR)
   - Stripe/Clerk/Convex: If vendor-related
   - Regulatory bodies: As required by law
   - Public disclosure: If legally required or >10% users affected

7. **Post-Incident Review (within 1 week)**
   - Root cause analysis
   - Document lessons learned
   - Implement preventive measures
   - Update incident response plan
   - Security training if human error involved

### 7.3 Communication Templates

**User Notification Template:**

```
Subject: Security Notification - Action Required

Dear [User Name],

We are writing to inform you of a security incident that may have affected your Doctrina LMS account.

What Happened:
[Brief description of incident - e.g., "Unauthorized access to a subset of user accounts"]

What Information Was Involved:
[Specific data types affected - e.g., "Email addresses, usernames, and encrypted passwords"]

What We're Doing:
[Steps taken - e.g., "We've immediately secured the affected systems, reset all passwords, and engaged third-party security experts"]

What You Should Do:
1. Reset your password immediately using the link below
2. Review your account activity for unauthorized course enrollments
3. Enable two-factor authentication in your account settings
4. Monitor your payment methods for suspicious activity (if financial data affected)

For more information or questions:
security@doctrina-lms.com | Support Center: [URL]

We sincerely apologize for this incident and are committed to protecting your information.

The Doctrina LMS Security Team
```

**Instructor Notification Template (Payout Issue):**

```
Subject: Important: Instructor Payout Security Notice

Dear [Instructor Name],

We've detected and resolved a security issue that may have affected instructor payout processing.

What Happened:
[Description - e.g., "A technical issue briefly exposed payout processing logs"]

Impact to You:
[Specific impact - e.g., "Your payout schedule was delayed by 3 business days"]

Resolution:
[What was done - e.g., "All affected payouts have been processed with an additional verification step"]

Verification Needed:
Please verify your recent payout on [Date] for $[Amount] was received correctly. If you notice any discrepancies, contact us immediately at instructors@doctrina-lms.com.

We appreciate your patience and understanding.

The Doctrina LMS Team
```

## 8. Security Monitoring & Logging

### 8.1 Audit Logging

**Events Logged:**

- Authentication attempts (success and failure)
- Password changes and resets
- Profile data modifications
- Admin actions (all actions logged with full context)
- Payment transactions (creation, completion, refunds)
- Instructor payout requests and completions
- Course enrollment and access
- Instructor application reviews and status changes
- Data exports and account deletions
- Course content uploads and modifications
- Review submissions and moderations

**Log Storage:**

- Convex database table: `auditLogs`
- Retention period: 2 years for audit purposes
- Critical financial logs: 7 years (IRS requirement)
- Log access restricted to Security and Admin teams
- Logs immutable (write-once, cannot be modified)

**Log Format:**

```typescript
{
  _id: Id<'auditLogs'>,
  timestamp: number,
  userId: string,
  action: string, // e.g., 'course.enroll', 'payment.complete'
  resource: string, // e.g., course ID, user ID
  details: object, // Event-specific metadata
  ipAddress: string,
  userAgent: string,
  severity: 'info' | 'warning' | 'critical',
}
```

### 8.2 Monitoring & Alerting

**Real-Time Monitoring:**

- Failed login attempts (>5 in 10 minutes → alert)
- Unusual data access patterns (student accessing 50+ courses in 1 hour)
- Large data exports (>1000 records → review)
- Payment failures or fraud indicators (velocity checks)
- Refund request spikes (>10% of transactions)
- API rate limit violations
- Server error rates (>5% → alert)
- Video download abuse (>10 downloads/hour per user)
- Multiple concurrent sessions (>5 devices → suspicious)

**Financial Transaction Monitoring:**

- Chargeback notifications (immediate alert)
- Payout fraud indicators (new instructor, high payout, low sales history)
- Unusual refund patterns (same user, multiple courses)
- Price manipulation attempts (course price changes during checkout)

**Content Security Monitoring:**

- Course content upload size anomalies
- Video playback token reuse attempts
- PDF download velocity (>5 downloads/minute)
- Watermark removal detection (future: ML-based)

**Alerting Channels:**

- PagerDuty for P0/P1 incidents (24/7 on-call)
- Slack #security-alerts for P2/P3 incidents
- Email for weekly security digests
- Dashboard for real-time metrics

### 8.3 Security Audits

**Quarterly Internal Audits:**

- Review access logs for anomalies
- Verify user permissions accuracy (role assignments)
- Check for unused/stale accounts (>6 months inactive)
- Validate encryption implementation
- Test backup and recovery procedures
- Review instructor payout accuracy (sample audit)
- Verify certificate issuance integrity

**Annual External Audits:**

- Third-party penetration testing
- SOC 2 Type II audit (future goal)
- PCI DSS compliance validation
- Accessibility audit (WCAG 2.1 AA)
- Code security audit (static analysis)

## 9. Secure Development Practices

### 9.1 Code Security

**Development Standards:**

- No hardcoded credentials or secrets
- Environment variables for all sensitive config
- Input validation on all user inputs (Zod schemas)
- Output encoding to prevent XSS
- Parameterized queries (Convex handles this)
- CORS policies restrict API access to known origins
- Rate limiting on authentication endpoints (5 attempts/10 min)
- Rate limiting on payment endpoints (3 attempts/hour)

**Next.js 15 Security:**

- Server Components for sensitive data fetching
- Client Components only when interactivity needed
- API routes protected with authentication middleware
- Server Actions validated and rate-limited
- Content Security Policy (CSP) headers configured
- X-Frame-Options: DENY (prevent clickjacking)
- X-Content-Type-Options: nosniff

**Code Review Requirements:**

- All code reviewed before merge (no direct commits to main)
- Security-focused review for authentication/authorization changes
- Payment logic reviewed by two developers minimum
- Automated security scanning (GitHub Dependabot)
- Regular dependency updates (weekly check)
- Snyk or Sonarqube integration for vulnerability scanning

### 9.2 Secrets Management

**Environment Variables:**

- Stored in Vercel environment settings (production)
- Stored in `.env.local` (development, never committed)
- Separate values for dev/staging/production
- Never committed to Git repository (.gitignore enforced)
- Rotated quarterly (Stripe, Clerk, Convex keys)

**Secret Rotation Schedule:**

- Stripe API keys: Every 6 months
- Clerk API keys: Every 6 months
- Convex deployment keys: Annually
- Video platform API keys: Annually
- Database encryption keys: Annually (managed by Convex)
- Emergency rotation: Immediately upon suspicion of compromise

**API Key Security:**

- Least-privilege access for service accounts
- Separate keys for each environment
- Keys rotated after employee departure (within 24 hours)
- Emergency revocation procedures documented
- Webhook signing secrets verified on all endpoints

### 9.3 Third-Party Security

**Vendor Assessment:**

- All vendors must have SOC 2 Type II or equivalent
- Annual security questionnaires
- Vendor access logged and monitored
- Data processing agreements (DPA) required
- Vendor breach notification within 24 hours

**Current Vendor Security Status:**

- Convex: SOC 2 Type II compliant, AWS infrastructure
- Clerk: SOC 2 Type II compliant, GDPR compliant
- Stripe: PCI DSS Level 1, SOC 2, GDPR compliant
- Vercel: SOC 2 Type II compliant, edge network
- Vimeo Business/Cloudflare Stream: SOC 2 compliant, DRM support

**Vendor Offboarding:**

- Data deletion requests within 30 days
- Access revocation immediately
- Audit logs archived
- Migration plan for critical vendors

## 10. User Privacy Controls

### 10.1 Data Minimization

**Collection Principles:**

- Only collect data necessary for platform function
- No social security numbers collected (instructors provide to Stripe directly)
- Optional fields clearly marked
- Aggregate data when possible for analytics
- Anonymize data for non-critical analytics

**Data Not Collected:**

- Demographic data (race, ethnicity, religion)
- Health information
- Political affiliations
- Biometric data (except Stripe Identity for instructors)

### 10.2 User Rights

**Data Access:**

- Users can view all their data via profile export
- Export format: JSON with human-readable sections
- Export available within 24 hours of request
- Includes: profile, course progress, certificates, reviews, purchase history

**Data Deletion:**

- Account deletion request → 30-day grace period
- Hard delete after 30 days (not recoverable)
- Some data retained for legal/financial purposes:
  - Transaction records: 7 years (IRS requirement)
  - Audit logs: 2 years
  - Course completion certificates: Permanently (anonymized after deletion)
  - Refund/dispute records: 7 years
- Course reviews anonymized (name removed, kept as "Anonymous")

**Data Portability:**

- Download all profile data (JSON format)
- Download course progress and certificates (PDF)
- Download course content (if instructor or purchased)
- Download review history
- API endpoint for automated data export (future)

### 10.3 Consent Management

**Explicit Consent Required For:**

- Email marketing communications
- Instructor profile public display
- Student testimonials and case studies
- Third-party analytics (Google Analytics, etc.)
- Course completion sharing on LinkedIn
- Instructor earnings displayed in platform testimonials

**Consent Tracking:**

- Timestamp and IP address recorded
- Opt-out available at any time
- Consent status visible in user profile
- Marketing consent separate from transactional emails
- Cookie consent banner for all visitors

**Marketing Communications:**

- Unsubscribe link in all emails
- Preference center for granular control
- Suppression list honored permanently
- Transactional emails always allowed (purchase receipts, password resets)

## 11. Marketplace-Specific Security Threats

### 11.1 Payment Fraud

**Student Payment Fraud:**

- Stolen credit card testing (carding)
- Chargeback fraud (enroll, complete, request refund)
- Coupon code abuse
- Account sharing to bypass payment

**Prevention Measures:**

- Stripe Radar for fraud detection
- Velocity checks (max 3 payment attempts per card per hour)
- IP-based geolocation matching
- Device fingerprinting
- Require strong authentication for high-value purchases (>$500)
- Coupon code usage limits (1 per user, expiration dates)

**Instructor Payout Fraud:**

- Self-enrollment fraud (instructor enrolls fake students)
- Review manipulation to boost sales
- Refund collusion (refund after payout)

**Prevention Measures:**

- 30-day hold on payouts for new instructors
- Review patterns analysis (velocity, IP clustering)
- Self-enrollment detection (instructor IP matches student IP)
- Minimum course completion rate before payout (20%)
- Manual review for instructors with >10% refund rate

### 11.2 Content Piracy

**Risks:**

- Video downloading and redistribution
- Screen recording and reposting
- Course material sharing on file-sharing sites
- Account credential sharing

**Prevention Measures:**

- DRM encryption for video streams
- Dynamic watermarking (student email + ID on videos)
- PDF watermarking on downloadable materials
- Single-device streaming enforcement (future)
- DMCA takedown automation (future)
- Forensic watermarking for leak tracing

**Detection:**

- Google Alerts for course titles
- DMCA monitoring services
- User reports of piracy
- Watermark analysis on leaked content

**Response:**

- DMCA takedown within 24 hours
- Suspend offending user account
- Notify affected instructor
- Law enforcement referral for egregious cases

### 11.3 Review and Rating Manipulation

**Risks:**

- Fake positive reviews (instructor incentivizes)
- Competitor attacks (fake negative reviews)
- Review farms (purchased reviews)
- Quid pro quo reviews (instructor-to-instructor)

**Prevention Measures:**

- Verified purchase requirement for reviews
- Minimum course completion requirement (>25% progress)
- Review velocity limits (max 5 reviews per user per day)
- IP and device clustering detection
- Language analysis for bot-generated reviews
- Instructor cannot review own courses (obvious but enforced)

**Detection Signals:**

- Review timing clusters (10 reviews in 1 hour)
- Similar language/phrases across reviews
- Accounts created recently with only review activity
- IP address clustering
- Unusual rating distributions (all 5-star or all 1-star)

**Response:**

- Flagged reviews hidden pending manual review
- Repeat offenders account suspended
- Instructor courses hidden if manipulation proven
- Public transparency report (future)

### 11.4 Instructor Verification Bypass

**Risks:**

- Fake credentials submitted
- Expired licenses not disclosed
- Unlicensed individuals posing as instructors
- Revoked licenses concealed

**Prevention Measures:**

- Primary source verification (Nursys, state boards)
- Stripe Identity verification for identity proof
- Annual license re-verification
- Real-time license status checks (future integration)
- Insurance verification ($1M/$3M minimum)

**Monitoring:**

- License expiration alerts (30 days before)
- State board disciplinary action monitoring (quarterly)
- Student complaints reviewed for credential concerns

**Response:**

- Immediate course suspension if license invalid
- Refund to students if fraud proven
- Legal action for credential fraud
- Report to state board if applicable

### 11.5 Account Takeover

**Risks:**

- Credential stuffing (leaked passwords from other sites)
- Phishing attacks
- Session hijacking
- Brute force attacks

**Prevention Measures:**

- Email verification required
- Password strength enforcement
- Rate limiting on login attempts (5 attempts per 10 minutes)
- Device fingerprinting for anomaly detection
- Email notifications for new device logins
- Two-factor authentication (optional, encouraged)
- IP-based geolocation matching (alert on country change)

**Detection:**

- Unusual login patterns (new device, new location)
- High-velocity course enrollments post-login
- Password change followed by suspicious activity
- Multiple failed 2FA attempts

**Response:**

- Automatic account lock after 5 failed attempts
- Password reset required for unlock
- Session termination on all devices
- Email notification to user
- Admin review for high-value accounts (instructors)

## 12. Compliance Checklist

### Pre-Launch Security Requirements

**Infrastructure Security:**

- [ ] SSL/TLS certificate installed and configured (Let's Encrypt or Vercel)
- [ ] HTTPS enforced for all routes (HSTS headers)
- [ ] Environment variables secured (no secrets in code, .env.local in .gitignore)
- [ ] Database encryption at rest verified (Convex default)
- [ ] CDN configured with DDoS protection (Vercel/Cloudflare)

**Authentication & Authorization:**

- [ ] User authentication flow tested (Clerk integration)
- [ ] Password requirements enforced (8+ chars, complexity)
- [ ] Email verification required before access
- [ ] Session timeout configured (30 min inactive)
- [ ] JWT token validation implemented (Convex + Clerk)
- [ ] Row-level security tested (students can't access unpurchased courses)
- [ ] Admin access controls tested (isAdmin boolean)
- [ ] Instructor access controls tested (isInstructor boolean)

**Application Security:**

- [ ] CORS policies implemented (whitelist known origins)
- [ ] Rate limiting on auth endpoints (5 attempts/10 min)
- [ ] Rate limiting on payment endpoints (3 attempts/hour)
- [ ] Input validation on all forms (Zod schemas)
- [ ] XSS protection headers configured (CSP, X-XSS-Protection)
- [ ] CSRF protection enabled (SameSite cookies)
- [ ] SQL injection prevention (Convex handles parameterization)
- [ ] File upload validation (type, size limits)

**Payment Security:**

- [ ] Stripe integration tested (checkout flow)
- [ ] Webhook signature verification implemented
- [ ] PCI compliance validated (SAQ A completed)
- [ ] Refund flow tested
- [ ] Payout flow tested (Stripe Connect)
- [ ] Fraud detection configured (Stripe Radar)

**Monitoring & Logging:**

- [ ] Audit logging operational (auditLogs table)
- [ ] Error logging configured (Sentry or similar)
- [ ] Monitoring and alerting configured (PagerDuty, Slack)
- [ ] Uptime monitoring (status page)
- [ ] Performance monitoring (Vercel Analytics)

**Backup & Recovery:**

- [ ] Backup strategy verified (Convex continuous backups)
- [ ] Recovery procedure tested (restore from backup)
- [ ] Disaster recovery plan documented
- [ ] RTO/RPO objectives defined and tested

**Compliance & Legal:**

- [ ] Privacy policy published and linked
- [ ] Terms of service published and linked
- [ ] Cookie consent banner implemented (GDPR)
- [ ] DMCA agent designated and registered
- [ ] Refund policy clearly stated
- [ ] Data processing agreements signed with vendors (Convex, Clerk, Stripe)

**Content Security:**

- [ ] Video DRM configured (if using Vimeo Business or Cloudflare Stream)
- [ ] Watermarking implemented (video and PDF)
- [ ] Download limits enforced
- [ ] Course access control tested (purchased courses only)

**Team Readiness:**

- [ ] Security training completed by team
- [ ] Incident response plan documented and reviewed
- [ ] On-call rotation established (for P0/P1 incidents)
- [ ] Security contacts designated (security@, privacy@)

**Testing:**

- [ ] Penetration testing completed (third-party)
- [ ] Vulnerability scanning automated (Dependabot, Snyk)
- [ ] Accessibility testing (WCAG 2.1 AA)
- [ ] Load testing (handle expected launch traffic)

## 13. Ongoing Security Maintenance

### Daily

- Monitor security alerts and anomalies (dashboard check)
- Review failed authentication attempts (>threshold)
- Check system error rates (>5% investigate)
- Review payment failures and chargebacks

### Weekly

- Review admin activity logs
- Verify backup completion (automated check)
- Update security dashboard metrics
- Review flagged reviews and content reports
- Check for new CVEs in dependencies (Dependabot)

### Monthly

- Review and update user permissions (remove stale accounts)
- Check for dependency vulnerabilities (npm audit, Snyk)
- Test disaster recovery procedures (sample restore)
- Security metrics review meeting
- Instructor payout audit (sample 10% of transactions)
- Review refund requests for patterns

### Quarterly

- Internal security audit (checklist-based)
- Rotate API keys and secrets (Stripe, Clerk, etc.)
- Review and update security policies
- Compliance checklist review
- Vendor security assessment (questionnaires)
- License verification audit (10% sample of active instructors)
- Penetration testing (if budget allows)

### Annually

- External penetration testing (required)
- SOC 2 audit preparation (future goal)
- Employee security training refresh
- Incident response plan update
- Insurance policy review (cyber liability, E&O)
- PCI DSS self-assessment questionnaire (SAQ A)
- WCAG accessibility audit

## 14. Security Contacts

**Security Team:**

- Security Officer: [Designated role]
- Email: security@doctrina-lms.com
- Emergency Phone: [24/7 on-call via PagerDuty]

**Vulnerability Reporting:**

- Email: security@doctrina-lms.com
- Response SLA: 24 hours for acknowledgment
- Responsible disclosure program (reward minor bugs)
- Bug bounty program (future)

**Compliance Inquiries:**

- Email: privacy@doctrina-lms.com
- Response SLA: 5 business days
- GDPR/CCPA requests handled within legal timelines

**Instructor Support (Security Issues):**

- Email: instructors@doctrina-lms.com
- Response SLA: 24 hours
- Payout security issues: escalated to P1

**Copyright/DMCA:**

- Email: dmca@doctrina-lms.com
- DMCA Agent: [Registered with U.S. Copyright Office]
- Response SLA: 24 hours for takedown

---

**Document Version:** 1.0
**Last Updated:** January 2025
**Next Review:** Quarterly (April 2025)
**Owner:** Security & Compliance Team
