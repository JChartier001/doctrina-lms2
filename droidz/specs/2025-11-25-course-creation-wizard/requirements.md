# Requirements Gathering - Course Creation Wizard

**Date**: 2025-11-25  
**Status**: In Progress

## User Responses - Round 1

### 1. Course Status & Lifecycle

**Status Field:**
- ✅ Yes, need status field
- Possible statuses to consider:
  - `draft` - Course being created, not visible to students
  - `published` - Live and available for purchase/enrollment
  - `archived` - No new purchases, but existing students can still access
  - Other statuses TBD

**Archiving:**
- When instructor archives a course:
  - ❌ No new purchases allowed
  - ✅ Existing enrolled students retain full access to content
  - Course hidden from catalog/search

**Course Review/Approval:**
- ❌ No admin review workflow (at least not initially)
- ✅ Need Terms & Conditions stating instructors are liable for their own content
- ✅ Need student/customer reporting system for:
  - Inaccurate content
  - Inappropriate content (x-rated, etc.)
  - Content that violates guidelines

### 2. Save Draft Behavior

**User Expectation:**
- "If I click Save Draft, it should be saved somewhere"
- ✅ Save which step the instructor was on (resume capability)
- Implementation: Choose best UX pattern

**Initial thoughts:**
- Step 1: Create course record with status `draft`
- Later steps: Update existing draft incrementally
- Store `currentStep` field to resume progress

### 3. Publishing Requirements

**Minimum Requirements to Publish:**
- ✅ At least 1 module
- ✅ At least 1 lesson
- ✅ Must have thumbnail image
- ✅ Pricing can be free (with conditions - see below)

**Free Courses:**
- Instructors CAN make courses free
- ⚠️ Free courses should be limited to "very minimal courses"
- Need compensation mechanism to cover storage/hosting costs
- **QUESTION**: What defines "minimal"? Duration? Number of lessons? File size?
- **QUESTION**: Compensation options:
  - Platform fee even for free courses?
  - Limit free courses to X lessons or X GB storage?
  - Require paid tier for instructors offering free courses?

### 4. Edit Published Courses

**Editing Capability:**
- ✅ Instructors should be able to edit published courses
- ✅ Industry standards change (especially healthcare/aesthetics)
- ✅ Need to keep courses up-to-date

**Versioning Question:**
- User is considering keeping "versions" somewhere
- **QUESTION**: Versioning approach:
  - Option A: Keep full version history (storage intensive)
  - Option B: Keep change log only (what changed, when)
  - Option C: No versioning, just track "last updated" date
  - Option D: Certificate students based on version they completed

**Student Impact:**
- **QUESTION**: When instructor updates published course:
  - Do enrolled students see updates immediately?
  - Should there be a notification system?
  - Should significant changes require student acknowledgment?

### 5. Preview Functionality

**Preview Options Suggested:**
- Option A: Course landing page (student purchase view)
- Option B: Student course access view (after purchase)
- Option C: Toggle between both views

**User Question**: "Do you have a suggestion?"

**Recommendation needed**: Which preview mode(s) to implement?

### 6. Video Upload Strategy

**Decision:**
- ✅ **MUST be included in this phase**
- Courses are primarily video-based

**Requirements:**
- Fast to access (streaming quality)
- Cost-effective (not "an arm and a leg")

**Options to Consider:**
- Cloudflare Stream (~$1/1000 minutes stored, $1/1000 minutes delivered)
- Vimeo Pro/Business (~$20-75/month unlimited)
- Bunny.net Stream (~$0.005/GB stored, $0.01/GB delivered)
- AWS S3 + CloudFront (variable, can be expensive)
- Mux (~$0.015/GB delivered, built for streaming)

**QUESTION**: Video hosting decision needed based on:
- Expected storage volume
- Expected viewer count
- Budget constraints
- Technical requirements (adaptive bitrate, DRM?)

### 7. Minimum Course Structure

**To Save Draft:**
- ✅ Must have at least a title
- Can be incomplete otherwise

**To Publish:**
- ✅ At least 1 module
- ✅ At least 1 lesson per module (or total?)
- ✅ Must have thumbnail
- ✅ Must have pricing (can be free)

### 8. Error Handling

**Validation Display:**
- ✅ Show errors after submit attempt (not while typing)
- ✅ Combination of:
  - Inline errors below fields
  - Summary at top if submit fails
  - Toast notifications for server errors

**Connection Loss:**
- ✅ Retry functionality needed
- ❓ Retry button vs. background retry (not decided)
- ❓ localStorage backup (uncertain, "could work")

**Decision needed**: 
- Auto-retry with loading indicator + manual retry button fallback?
- localStorage as safety net?

## User Responses - Round 2 (Final)

### 1. Free Course Limits & Compensation

**Decision:**
- ✅ Base free course limits on instructor's subscription tier
- Different instructor tiers will have different limits
- Implementation: Define tier limits when implementing subscription system

**Rationale:**
- Aligns with business model
- Flexible for different instructor levels
- Can adjust limits per tier as needed

### 2. Course Versioning & Updates

**Decision:**
- ✅ Start with NO versioning (Option A)
- ✅ Implement versioning LATER if needed

**Concern Noted:**
- Certification requirements may change (state boards, etc.)
- Student completed course under old requirements
- May need to prove which version student completed

**Mitigation Strategy:**
- Track "Last Updated" date on course
- Track "Completed Date" on student enrollment
- If versioning needed later, can show: "Completed on [date] when course requirements were [X]"

**Recommendation for Future:**
- When/if versioning added, use Option D (Certificate Versioning)
- Certificate shows: "Completed Version 2.1 on [date]"
- Minimal storage impact, solves certification tracking

### 3. Student Notifications for Course Updates

**Decision:**
- ✅ Claude's choice for first implementation
- ✅ Can change later based on user feedback

**First Implementation Decision:**
- **Use Option 2**: In-app notification badge
  - Shows: "This course has new content!"
  - Non-intrusive
  - Students see it when they return to course
  - No email spam
  - Easy to implement with existing notification system

**Future Enhancement:**
- Add email notifications for major updates (opt-in)
- Add notification preferences per course

### 4. Preview Functionality

**Decision:**
- ✅ **Approved**: Start with course landing page preview only
- Shows: Title, description, pricing, curriculum, what you'll learn, requirements
- Student view (after purchase) can be added later

### 5. Video Hosting Service

**Primary Choice:**
- ✅ **Bunny.net Stream** (preferred)

**Research Requested:**
- ⏳ Need to research AWS S3 + CloudFront as comparison
- Include costs, pros/cons in final decision

### 6. Error Handling Details

**Connection Loss Retry:**
- ✅ Auto-retry 3 times in background with loading indicator
- ✅ If all retries fail, show manual "Retry" button with error message
- ✅ localStorage backup as safety net (clears after successful save)

**Course Status Values:**
- ✅ `draft` - Being created, not visible
- ✅ `published` - Live and purchasable
- ✅ `archived` - No new purchases, existing students retain access
- ✅ (Optional: `unpublished` - was published, temporarily hidden, can republish)

**Validation Display:**
- ✅ Show errors after submit attempt (not while typing)
- ✅ Inline errors below fields
- ✅ Summary at top if multiple errors
- ✅ Toast notifications for server errors

### 7. Content Reporting System

**Decision:**
- ✅ **Separate phase** - not part of Course Creation Wizard spec
- Will be its own spec: Student Reporting & Content Moderation
- Includes admin review workflows, moderation queue, etc.

## Video Hosting Research

### Detailed Cost Comparison: Bunny.net Stream vs AWS S3 + CloudFront

#### Bunny.net Stream (Recommended ✅)

**Pricing Structure:**
- **Storage**: $0.01/GB (Frankfurt) + geo-replication if needed
- **Encoding Costs**:
  - 2160p/1440p: $0.15/minute
  - 1080p/720p: $0.05/minute
  - 480p/360p/240p: $0.025/minute
- **CDN Delivery**:
  - Europe/North America: $0.01/GB
  - Asia/South America: $0.03/GB
  - Middle East/Africa: $0.06/GB
  - **Volume Pricing**: Down to $0.005/GB for 500TB+
- **Minimum**: $10/year recharge

**Example Cost (100 courses, 3 hours each = 300 hours):**
- Storage (assume 900GB after encoding): ~$9/month
- Encoding (300 hours @ 1080p): $900 one-time
- Delivery (assume 5TB/month): ~$50/month
- **Total**: ~$59/month recurring + $900 one-time setup

**Pros:**
- ✅ Simple, transparent pricing
- ✅ Much cheaper than AWS for video
- ✅ Includes adaptive bitrate automatically
- ✅ Built-in video player
- ✅ DRM available ($99/month base)
- ✅ Easy API integration
- ✅ No egress fees from storage to CDN
- ✅ Fast global delivery

**Cons:**
- ⚠️ Smaller company (less established than AWS)
- ⚠️ Fewer integrations than AWS ecosystem

---

#### AWS S3 + CloudFront + MediaConvert

**Pricing Structure:**
- **S3 Storage**: $0.023/GB/month (Standard class)
- **MediaConvert Encoding** (Professional tier):
  - First 50k minutes: $0.0825/minute (~¥0.0825 CNY per normalized minute)
  - 50k-1M minutes: $0.066/minute
  - 1M-10M minutes: $0.0495/minute
  - Adaptive bitrate uses "normalized minutes" (multipliers for resolution/codec)
- **S3 → CloudFront Transfer**: ~$0.02/GB (internal AWS)
- **CloudFront → Internet**:
  - First 10TB: $0.085/GB
  - 10TB-50TB: $0.080/GB
  - 50TB-150TB: $0.060/GB
  - Volume discounts available
- **CloudFront Requests**: $0.0075 per 10,000 HTTP requests

**Example Cost (100 courses, 3 hours each = 300 hours):**
- Storage (900GB): ~$21/month
- Encoding (300 hours): ~$1,485 one-time (assuming 1080p ABR = 6x multiplier)
- S3 → CloudFront (5TB/month): ~$100/month
- CloudFront → Users (5TB/month): ~$425/month
- Requests (assume 500k/month): ~$37.50/month
- **Total**: ~$583/month recurring + $1,485 one-time setup

**Alternative: AWS Example from Docs**
- 60-minute video streaming to 1,000 users:
  - MediaConvert: $3.15
  - S3 Storage (9GB): $0.207
  - CloudFront (1000 viewers): $229.50
  - **Total per video**: ~$232.86/month

**Pros:**
- ✅ Extremely scalable
- ✅ Integrated with AWS ecosystem
- ✅ Enterprise-grade reliability
- ✅ Advanced features (Lambda@Edge, etc.)
- ✅ Detailed analytics

**Cons:**
- ❌ **10x more expensive** than Bunny.net for video
- ❌ Complex pricing (hard to predict)
- ❌ Requires more technical setup
- ❌ Multiple services to manage (S3, CloudFront, MediaConvert)
- ❌ Egress fees add up quickly

---

### Side-by-Side Comparison

| Feature | Bunny.net Stream | AWS S3 + CloudFront |
|---------|------------------|---------------------|
| **Storage** | $0.01/GB | $0.023/GB |
| **Encoding** | $0.05/min (1080p) | $0.0825/min (1080p) |
| **Delivery** | $0.01/GB (US/EU) | $0.085/GB (first 10TB) |
| **100 Courses Cost** | ~$59/month | ~$583/month |
| **Complexity** | Simple, all-in-one | Complex, multiple services |
| **Setup Time** | Minutes | Hours/Days |
| **Adaptive Bitrate** | Included | Extra cost (normalized minutes) |
| **Video Player** | Included | Need separate solution |
| **Best For** | Startups, LMS, video-first | Enterprise, AWS-heavy infrastructure |

---

### Final Recommendation

**Use Bunny.net Stream** for Doctrina LMS because:

1. **Cost Savings**: ~90% cheaper than AWS ($59 vs $583/month)
2. **Simplicity**: One service vs managing S3 + CloudFront + MediaConvert
3. **Video-First**: Built specifically for video streaming
4. **Fast Setup**: API is straightforward, get running in hours not days
5. **Adaptive Bitrate**: Included automatically with encoding
6. **Predictable Pricing**: No surprise egress fees
7. **Perfect for LMS**: Designed for educational content delivery

**When to Consider AWS Instead:**
- Already heavily invested in AWS infrastructure
- Need ultra-high scale (millions of concurrent viewers)
- Require specific AWS integrations (Lambda@Edge, etc.)
- Have AWS credits or enterprise discount

**Next Steps:**
1. Create Bunny.net account
2. Set up Stream zone
3. Integrate Bunny.net API into course upload flow
4. Use Bunny.net video player or build custom player
5. Configure DRM if needed for premium content ($99/month)

## Requirements Finalized

✅ All major decisions made
✅ Implementation approach clear
✅ Open questions resolved
⏳ Final video hosting comparison pending

## Next Steps

1. ✅ Complete S3 research
2. ✅ Document final video hosting recommendation
3. ✅ Save requirements and mark spec shaping complete
4. → User can proceed to `/write-spec` to generate detailed specification
