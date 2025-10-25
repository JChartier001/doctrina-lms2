# Instructor Vetting Process - Doctrina LMS

**Document Purpose:** Comprehensive operational guide for vetting and verifying professional instructors on the Doctrina LMS platform

**Target Audience:** Platform administrators, compliance team, operations staff

**Last Updated:** January 2025

---

## 1. Overview

### 1.1 Why We Vet Instructors

Doctrina LMS operates as an **educational marketplace**, not an accredited institution. While instructors are independent contractors responsible for their own content and credentials, the platform maintains a systematic vetting process to:

- **Legal Defensibility:** Demonstrate "reasonable care" in instructor selection
- **Student Trust:** Provide verified credentials and reduce fraud risk
- **Quality Assurance:** Ensure instructors meet minimum professional standards
- **Liability Reduction:** Transfer risk through proper verification and contracts
- **Competitive Differentiation:** Unlike platforms with no vetting, we verify all professionals

### 1.2 Legal Framework

**Standard:** "Reasonable Care" - Courts assess whether the platform exercised appropriate caution given the circumstances.

**Our Position:** As a healthcare education marketplace, we verify core credentials (license, insurance, identity) but do NOT:

- Guarantee instructor quality or teaching ability
- Assess course content accuracy (instructor's responsibility)
- Verify every claimed certification or credential
- Conduct background checks (MVP - may add later)

**Result:** Balanced approach providing legal protection without becoming an accreditation body.

---

## 2. Minimum Qualification Requirements

### 2.1 Professional License (REQUIRED)

**Accepted License Types:**

- Physician: MD or DO
- Nurse Practitioner: NP (all specialties)
- Physician Assistant: PA or PA-C
- Registered Nurse: RN
- Dentist: DDS or DMD
- Licensed Practical Nurse: LPN (for specific non-clinical courses only)
- Other healthcare licenses: Review on case-by-case basis

**License Requirements:**

- Must be ACTIVE (not expired)
- Must be UNRESTRICTED (no disciplinary actions or practice limitations)
- Must be from a US state (US-only platform for MVP)
- Must be verifiable via primary source (state board or Nursys)

### 2.2 Professional Liability Insurance (REQUIRED)

**Minimum Coverage:**

- $1,000,000 per occurrence
- $3,000,000 aggregate
- Policy MUST cover "teaching," "instruction," or "education" activities

**Accepted Proof:**

- Current Certificate of Insurance (COI)
- Insurance declarations page
- Direct confirmation from insurance company

**Verification:**

- Named insured must match instructor's legal name
- Coverage dates must be current
- Coverage amounts must meet minimums
- Policy must not exclude teaching activities

### 2.3 Clinical Experience (REQUIRED)

**For Clinical/Procedure Courses:**

- Minimum 3 years active practice performing procedures being taught
- Current active practice strongly preferred
- Documented procedure volume (e.g., "performed 1,000+ Botox treatments")

**For Business/Practice Management Courses:**

- Documented business success in medical aesthetics
- Minimum 2 years running aesthetic practice
- Demonstrated growth metrics

### 2.4 Identity Verification (REQUIRED)

**Method:** Third-party identity verification service

- Stripe Identity (preferred - already integrated with payments)
- Persona
- Truework
- Other FCRA-compliant service

**What's Verified:**

- Government-issued photo ID (driver's license, passport)
- Name matches application
- Photo matches ID
- ID is not expired or fraudulent

### 2.5 Independent Contractor Agreement (REQUIRED)

**Must Include:**

- Independent contractor status (not employee)
- Instructor representations and warranties about credentials
- Indemnification clauses (instructor indemnifies platform)
- Content ownership and licensing terms
- Compliance with all applicable laws
- Termination provisions

**Signature:**

- Electronic signature acceptable (DocuSign, Clerk Flows, etc.)
- Must be dated
- Both parties receive signed copy

---

## 3. Vetting Workflow - Step-by-Step

### STAGE 1: Application Submission

**Instructor Actions:**

1. Completes application form with:
   - Full legal name
   - Professional license information (type, number, state)
   - Years of experience and specialties
   - Professional liability insurance carrier
   - Brief bio and teaching philosophy
   - Proposed course topics

**Platform Actions:**

1. Review application for completeness
2. Screen for obvious red flags:
   - Unlicensed individuals
   - Inappropriate course topics (outside healthcare focus)
   - Poor communication skills (significant grammar/spelling issues)
3. Send initial response within 48 hours:
   - Approved to proceed → Send document request list
   - Need more information → Request clarifications
   - Rejected → Explain reason (rare at this stage)

**Timeline:** 48 hours from submission to initial response

**Current Implementation:** Instructor visits `/instructor/verification` page

---

### STAGE 2: Document Collection

**Platform Requests (via email template):**

1. Copy of current professional license (front and back)
2. Current Certificate of Insurance (COI)
3. Government-issued photo ID (for identity verification)
4. Resume or CV (for experience documentation)
5. Professional headshot (for instructor profile)

**Platform Provides:**

- Secure upload link (via platform or file storage service)
- Clear deadline (7 days to submit documents)
- Instructions for each document type
- Contact information for questions

**Instructor Actions:**

- Upload requested documents within 7 days
- Respond to any clarification requests

**Platform Actions:**

- Send reminder at day 5 if documents not received
- Mark application "Incomplete" if no response after 14 days
- Review documents within 24 hours of receipt

**Timeline:** 7 days for instructor to submit; 24 hours for platform review

**Current Implementation:** `/instructor/verification` page collects:

- License number, state, expiry date
- License document upload
- Government ID upload
- ⚠️ **Missing:** Insurance COI upload, resume, headshot

---

### STAGE 3: License Verification (PRIMARY SOURCE)

**CRITICAL:** We verify licenses directly with state boards, NOT by trusting uploaded documents alone.

**For Nurses (RN, NP, LPN):**

**Option A: Nursys e-Notify (Preferred)**

1. Go to [nursys.com](https://www.nursys.com)
2. Create account or log in
3. Search for nurse by license number and state
4. Verify:
   - License is active
   - No disciplinary actions
   - Expiration date is current
   - License type matches application
5. Subscribe to e-Notify for automatic status updates ($8/year per license)
6. Screenshot verification results
7. Save to instructor file

**Option B: State Board Website**

1. Navigate to state nursing board website
2. Use "License Verification" or "License Lookup" tool
3. Search by license number and name
4. Verify same information as Nursys
5. Screenshot results
6. Save to instructor file

**For Physicians (MD, DO):**

1. Navigate to state medical board website
2. Search physician by name and license number
3. Verify:
   - Active license
   - No disciplinary actions
   - Board certifications (if claimed)
   - Practice address
4. Screenshot verification
5. Save to instructor file

**For PAs, Dentists, Other Professionals:**

1. Navigate to appropriate state licensing board
2. Follow similar verification process
3. Document results

**Verification Checklist:**

- [ ] License number matches application
- [ ] Name matches application (exactly)
- [ ] License is ACTIVE status
- [ ] No DISCIPLINARY ACTIONS or restrictions
- [ ] Expiration date is future date (not expired)
- [ ] License type matches claimed credential
- [ ] Screenshot saved to instructor file
- [ ] Verification date documented

**If Discrepancies Found:**

- Email instructor immediately with specific issue
- Request explanation within 48 hours
- Suspend application pending resolution
- If no satisfactory resolution → Reject application

**Timeline:** 30 minutes per instructor; same day as document receipt

---

### STAGE 4: Insurance Verification

**Review Certificate of Insurance (COI):**

**Required Elements:**

- [ ] Named insured matches instructor's legal name
- [ ] Policy type: Professional Liability or Errors & Omissions
- [ ] Coverage amounts meet minimums:
  - $1,000,000 per occurrence
  - $3,000,000 aggregate (or annual aggregate)
- [ ] Effective date is past date (policy active)
- [ ] Expiration date is future date (policy current)
- [ ] Policy includes "teaching" or "instruction" coverage

**Verification Methods:**

**Method 1: Review COI Directly**

- Most COIs list covered activities
- Look for "Education," "Teaching," "Instruction" in covered services
- If unclear, proceed to Method 2

**Method 2: Contact Insurance Agent**

- COI lists agent name and phone number
- Call agent: "We're verifying coverage for [Instructor Name]. Does their professional liability policy cover teaching and instruction activities?"
- Document agent response (name, date, answer)
- If yes → Approved
- If no → Request instructor obtain rider or new policy

**Method 3: Request Declarations Page**

- Ask instructor for full policy declarations page
- Review covered activities section
- Verify teaching is included

**Common Issues:**

**Issue:** Policy excludes teaching

- **Solution:** Instructor must add teaching rider (usually $200-500/year additional)
- **Timeline:** Give instructor 14 days to update policy
- **Verification:** Request updated COI showing teaching coverage

**Issue:** Coverage amounts insufficient

- **Solution:** Instructor must increase coverage limits
- **Timeline:** 14 days to provide updated COI
- **Alternative:** Some insurers offer "teaching-only" policies at lower premiums

**Issue:** Policy expired

- **Solution:** Request current COI
- **Action:** Cannot approve until current policy provided

**Timeline:** 15-20 minutes per instructor; same day as license verification

---

### STAGE 5: Scope of Practice Verification

**Purpose:** Ensure instructor is legally permitted to perform AND teach the procedures in their proposed courses.

**Process:**

**Step 1: Review Proposed Course Topics**

- List all procedures instructor plans to teach
- Example: Botox injections, dermal fillers, laser hair removal, chemical peels

**Step 2: Research State Scope of Practice**

- Identify instructor's license type and state
- Research that state's scope of practice for that license type
- Use resources:
  - State nursing board scope of practice statements
  - State medical board regulations
  - American Med Spa Association state guide

**Step 3: Verify Instructor Can Perform Procedures**

- Cross-reference procedures with scope of practice
- Determine if instructor can legally perform these procedures in their state

**Examples:**

**Example 1: RN in California Teaching Botox**

- California allows RNs to administer Botox under physician supervision
- **Verification:** RN can legally perform → RN can teach
- **Note Required on Course:** "California requires physician supervision; check your state's requirements"

**Example 2: Esthetician Teaching Injectable Procedures**

- NO US state allows estheticians to perform injectable procedures
- **Rejection Reason:** Estheticians cannot legally perform injectables → Cannot teach
- **Alternative:** Esthetician could teach surface treatments (facials, microdermabrasion, etc.)

**Example 3: NP in Arizona Teaching Laser Treatments**

- Arizona is full practice authority state
- NPs can perform laser treatments independently
- **Verification:** NP can legally perform → NP can teach
- **Note Required:** "Scope of practice varies by state; verify your state allows this procedure"

**Step 4: Document Scope Determination**

- Create scope of practice memo for instructor file:
  - Instructor license type and state
  - Procedures proposed to teach
  - Relevant scope of practice regulations
  - Determination: Approved / Approved with restrictions / Not approved
  - State-specific warnings required on courses

**Timeline:** 30-45 minutes per instructor (first time); 15 minutes (subsequent - use database)

---

### STAGE 6: Identity Verification

**Automated Process via Stripe Identity:**

**Step 1: Send Identity Verification Link**

1. Generate Stripe Identity verification session
2. Email link to instructor
3. Expires in 7 days

**Step 2: Instructor Completes Verification**

1. Takes photo of government-issued ID
2. Takes selfie for liveness check
3. Stripe compares photo to ID
4. Results returned to platform

**Step 3: Review Results**

- **Verified:** ID is authentic, photo matches, not expired → Approved
- **Failed:** ID issues detected → Contact instructor to retry
- **Fraud Suspected:** Reject application immediately

**Manual Backup (if Stripe Identity unavailable):**

1. Request clear photo or scan of government ID (front and back)
2. Video call with instructor to verify appearance matches ID
3. Document verification (screenshots, notes)
4. Less preferred but acceptable for MVP

**Timeline:** Automated (instructor completes at their pace); 5 minutes to review results

**Current Implementation:** lms2 verification form collects ID upload but doesn't use Stripe Identity yet

---

### STAGE 7: Contractor Agreement Signature

**Process:**

**Step 1: Prepare Agreement**

- Use standard Independent Contractor Agreement template
- Fill in instructor-specific information:
  - Legal name
  - License information
  - Proposed course topics
  - Payment terms (platform revenue share)

**Step 2: Send for Signature**

- Use DocuSign, Clerk Flows, or similar e-signature platform
- Include signing deadline (7 days)
- Provide copy of agreement for instructor review before signing

**Step 3: Instructor Reviews and Signs**

- Instructor receives agreement
- Reviews terms (encourage consulting attorney if desired)
- Electronically signs

**Step 4: Platform Countersigns**

- Admin reviews signed agreement
- Platform representative countersigns
- Fully executed agreement saved to instructor file
- Copy sent to instructor automatically

**Key Agreement Provisions to Verify:**

- Independent contractor status acknowledged
- Instructor represents credentials are accurate
- Indemnification clauses present
- Content ownership terms clear
- Payment terms match platform policy
- Termination provisions included

**Timeline:** 7 days for instructor to sign; same day for platform countersignature

---

### STAGE 8: Final Review and Approval

**Comprehensive Checklist:**

Before approving instructor, verify ALL requirements met:

**Documents Received:**

- [ ] Professional license copy (uploaded)
- [ ] Certificate of Insurance (COI) (uploaded)
- [ ] Government-issued photo ID (uploaded or verified via Stripe)
- [ ] Resume/CV (uploaded)
- [ ] Professional headshot (uploaded)

**Verifications Completed:**

- [ ] License verified with primary source (Nursys or state board)
- [ ] License is active and unrestricted
- [ ] Insurance verified and meets minimums ($1M/$3M)
- [ ] Teaching coverage confirmed on insurance policy
- [ ] Scope of practice verified for proposed courses
- [ ] Identity verified (Stripe Identity or manual)
- [ ] Name consistency across all documents

**Agreements Signed:**

- [ ] Independent Contractor Agreement fully executed
- [ ] Instructor acknowledged contractor status
- [ ] Indemnification clauses included

**Profile Ready:**

- [ ] Instructor bio written or reviewed
- [ ] Professional headshot uploaded
- [ ] Credentials listed accurately
- [ ] Course topics identified

**Final Decision:**

**If ALL items checked:**

- **APPROVE INSTRUCTOR**
- Update user record: Set `isInstructor = true`
- Send approval email with next steps
- Grant access to course creation dashboard
- Add "Verified Professional" badge to profile
- Allow course creation via wizard

**If ANY items missing or failed:**

- **PENDING** status - Request missing items
- Give deadline for completion (typically 7-14 days)
- Send reminder emails at intervals
- If no response after 30 days → Mark application "Expired"

**If serious issues discovered:**

- **REJECT APPLICATION**
- Send rejection email with clear reason
- Document reason in instructor file
- Offer reapplication option if issue can be resolved (e.g., license renewal)

**Timeline:** 30 minutes for final review and decision

---

## 4. Database Schema Integration

### InstructorApplications Table

**Fields:**

```typescript
{
  _id: Id<'instructorApplications'>,
  userId: Id<'users'>,
  status: 'pending' | 'documents_requested' | 'under_review' | 'approved' | 'rejected' | 'expired',

  // License Information
  licenseType: string,               // 'MD', 'RN', 'NP', etc.
  licenseNumber: string,
  licenseState: string,
  licenseExpiry: string,
  licenseVerified: boolean,
  licenseVerifiedAt?: number,
  licenseVerifiedBy?: Id<'users'>,  // Admin who verified

  // Insurance Information
  insuranceProvider: string,
  insurancePolicyNumber?: string,
  insuranceExpiry?: string,
  insuranceVerified: boolean,
  insuranceVerifiedAt?: number,

  // Identity Verification
  identityVerified: boolean,
  identityVerifiedAt?: number,
  stripeIdentitySessionId?: string,

  // Scope of Practice
  proposedCourseTopics: string[],
  scopeOfPracticeVerified: boolean,
  scopeNotes?: string,              // Any restrictions or warnings

  // Documents
  documents: {
    licenseUpload?: string,         // File URL
    insuranceUpload?: string,
    idUpload?: string,
    resumeUpload?: string,
    headshotUpload?: string,
  },

  // Agreement
  contractorAgreementSigned: boolean,
  contractorAgreementSignedAt?: number,
  contractorAgreementDocId?: string,

  // Application Lifecycle
  submittedAt: number,
  reviewedAt?: number,
  reviewedBy?: Id<'users'>,         // Admin who reviewed
  approvedAt?: number,
  rejectedAt?: number,
  rejectionReason?: string,
  expiresAt?: number,

  // Communication
  lastReminderSent?: number,
  notes?: string,                   // Admin notes
}
```

**Indexes:**

- `by_user` - Get application for specific user
- `by_status` - Query applications by status
- `by_submitted` - Sort by submission date

---

## 5. Post-Approval Requirements

### 5.1 Annual Re-Verification

**Required Annually:**

- License verification (check status via Nursys or state board)
- Insurance verification (request updated COI)

**Process:**

1. 60 days before license expiration → Email instructor requesting renewal confirmation
2. 30 days before insurance expiration → Email instructor requesting updated COI
3. If expired → Set `isInstructor = false` until updated documents received
4. Verify updated documents same as initial verification
5. Update expiration dates in database
6. Send confirmation of re-verification

### 5.2 Ongoing Monitoring

**Automated (if using Nursys e-Notify):**

- Receive alerts if license status changes (suspended, revoked, disciplinary action)
- Immediately set `isInstructor = false` if alert received
- Contact instructor to investigate
- Reinstate only after resolution confirmed

**Manual (if not using e-Notify):**

- Quarterly random sampling of instructor licenses
- Verify 10-20% of instructors each quarter
- Investigate any status changes

### 5.3 Student Complaint Triggers

**If student complaints received:**

- Review complaint details
- Investigate instructor conduct
- Document findings
- Actions based on severity:
  - **Minor issues:** Warning, required corrective action
  - **Moderate issues:** Temporary suspension (set `isInstructor = false`), review process
  - **Severe issues:** Permanent ban, report to licensing board if necessary

---

## 6. Implementation Checklist

### Phase 1: MVP (Minimum Viable Vetting)

- [ ] Create `instructorApplications` table in Convex
- [ ] Update `/instructor/verification` form to collect all required fields
- [ ] Add file upload capability for license, insurance, ID, resume, headshot
- [ ] Create admin review dashboard at `/admin/applications`
- [ ] Implement manual verification workflow
- [ ] Add email templates for each stage
- [ ] Create rejection/approval notification system
- [ ] Update user record `isInstructor` field on approval

### Phase 2: Automation

- [ ] Integrate Stripe Identity for ID verification
- [ ] Automate license verification via Nursys API (if available)
- [ ] Add DocuSign/e-signature integration for contractor agreement
- [ ] Build expiration tracking and reminder system
- [ ] Implement Nursys e-Notify for ongoing monitoring

### Phase 3: Enhanced Features

- [ ] Build instructor dashboard showing verification status
- [ ] Add progress indicators for application stages
- [ ] Create comprehensive admin reporting
- [ ] Implement automated compliance checks
- [ ] Add background check integration (optional)

---

## 7. Tools and Resources

### 7.1 Verification Tools

**License Verification:**

- [Nursys.com](https://www.nursys.com) (nurses)
- [National Practitioner Data Bank](https://www.npdb.hrsa.gov) (physicians)
- State licensing board websites (all professions)

**Identity Verification:**

- Stripe Identity (integrated with payments)
- [Persona.com](https://www.persona.com)
- [Truework.com](https://www.truework.com)

**Insurance Verification:**

- Review COI directly
- Contact insurance agent (phone verification)
- Insurance company confirmation letters

### 7.2 State Scope of Practice Resources

- American Med Spa Association (AMSA) state regulations guide
- State nursing board scope of practice statements
- State medical board regulations
- Internal scope of practice database (to be built)

---

## 8. Metrics and Reporting

### 8.1 Vetting Metrics to Track

**Volume:**

- Applications received (monthly)
- Applications approved (monthly)
- Applications rejected (monthly)
- Approval rate (%)
- Time to approval (average days)

**Quality:**

- License verification success rate
- Insurance verification issues (%)
- Scope of practice rejections (%)
- Identity verification failure rate
- Student complaints per instructor

**Operational:**

- Average time per stage
- Bottlenecks identified
- Document collection completion rate
- Re-verification compliance rate

### 8.2 Quarterly Review

**Every 3 months:**

1. Review rejection reasons (identify patterns)
2. Analyze approval timeline (identify delays)
3. Survey sample of approved instructors (satisfaction with process)
4. Update process based on learnings
5. Train team on any new procedures

---

## 9. Legal and Compliance Notes

### 9.1 Record Retention

**Retention Requirements:**

- Approved instructors: Duration of relationship + 7 years
- Rejected applicants: 3 years (in case of disputes)
- Verification documents: 7 years
- Contractor agreements: Duration + 7 years
- Re-verification records: 7 years

### 9.2 Privacy and Data Protection

**PII Handling:**

- All instructor documents contain PII (license numbers, SSN on some insurance docs)
- Store securely (encrypted at rest)
- Access restricted to vetting team only
- Never share with third parties without consent
- Delete upon request (Right to Erasure) unless required for legal compliance

### 9.3 Anti-Discrimination Compliance

**Fair Application Review:**

- Decisions based solely on objective credentials (license, insurance, experience)
- No discrimination based on race, gender, age, religion, disability, etc.
- Document all rejection reasons clearly
- Consistent application of standards

---

**Document Status:** ✅ Complete - Ready for Implementation
**Version:** 1.0
**Next Review:** Quarterly or as regulations change
