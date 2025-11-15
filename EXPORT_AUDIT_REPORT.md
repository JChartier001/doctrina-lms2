# Default Export Audit Report

**Date**: 2025-11-15
**Task**: STANDARDS-AUDIT
**Orchestration Session**: 20251115-180114

## Executive Summary

- **Total files with default exports**: 54
- **Next.js special files (keep)**: 40
- **Configuration files (keep)**: 7
- **Regular components (convert)**: 4
- **Dead code (remove)**: 2
- **Middleware (rename file)**: 1

## Files to Convert to Named Exports

### 1. providers/ConvexProvider.tsx
- **Current**: `export default ConvexClientProvider`
- **Action**: Convert to named export `export { ConvexClientProvider }`
- **Imported by**:
  - `providers/index.tsx:2` - `import ConvexClientProvider from './ConvexProvider';`
- **Impact**: Low - Only imported by providers/index.tsx

### 2. providers/index.tsx
- **Current**: `export default Providers`
- **Action**: Convert to named export `export { Providers }`
- **Imported by**:
  - `app/layout.tsx:31` - `import Providers from '@/providers';`
- **Impact**: Low - Only imported by app/layout.tsx

### 3. components/image-upload.tsx
- **Current**: `export default ImageUpload`
- **Action**: Convert to named export `export { ImageUpload }`
- **Imported by**:
  - `components/course-wizard/basic-info-step.tsx` - `import ImageUpload from '@/components/image-upload';`
- **Impact**: Low - Only imported by one file

### 4. lib/dayjs.ts
- **Current**: `export default dayjs`
- **Action**: Convert to named export `export { default as dayjs }`
- **Note**: This is a re-export of the dayjs library with plugins configured
- **Imported by**:
  - `app/instructor/live-sessions/page.tsx:1` - `import dayjs, { Dayjs } from 'dayjs';` (uses original)
  - `app/live/page.tsx:1` - `import dayjs from 'dayjs';` (uses original)
  - `app/notifications/page.tsx:8` - `import dayjs from '@/lib/dayjs';`
  - `components/course-wizard/pricing-step.tsx:3` - `import dayjs from 'dayjs';` (uses original)
  - `components/date-range-picker.tsx:8` - `import dayjs from 'dayjs';` (uses original)
  - `components/notification-center.tsx:3` - `import dayjs from 'dayjs';` (uses original)
  - `components/ui/calendar.tsx:5` - `import dayjs, { Dayjs } from 'dayjs';` (uses original)
  - `convex/search.ts:3` - `import dayjs from '../lib/dayjs';`
  - `convex/users.ts:8` - `import { now } from '../lib/dayjs';`
- **Impact**: Medium - Used in 9 locations, but only 3 files import from @/lib/dayjs
- **Recommendation**: Most files import from 'dayjs' directly, so this wrapper may not be necessary. Consider standardizing all imports to use @/lib/dayjs to get the configured plugins.

## Dead Code to Remove

### 1. components/course-wizard/lesson-structure.tsx
- **Current**: `export default LessonStructure`
- **Action**: DELETE FILE - Entire file is commented out, no imports found
- **Imported by**: None (dead code)
- **Impact**: None - Safe to delete

### 2. components/course-wizard/section-structure.tsx
- **Current**: `export default SectionStructure`
- **Action**: DELETE FILE - Entire file is commented out, no imports found
- **Imported by**: None (dead code)
- **Impact**: None - Safe to delete

## Special Case: Middleware

### 1. proxy.ts
- **Current**: `export default clerkMiddleware(...)`
- **Action**: RENAME FILE to `middleware.ts` (Next.js convention)
- **Reason**: This appears to be Next.js middleware but is named incorrectly
- **Impact**: Medium - Requires file rename and potential next.config.mjs update
- **Note**: Next.js expects middleware to be in `middleware.ts` at the root level

## Files to Keep (Framework/Config Required)

### Next.js App Router Special Files (40 files)

These files MUST use default exports per Next.js App Router requirements:

#### Root Layout
- `app/layout.tsx:31` - Root layout component

#### Page Components (26 files)
- `app/admin/certificates/page.tsx:82`
- `app/admin/dashboard/page.tsx:263`
- `app/certificates/verify/page.tsx:13`
- `app/checkout/[courseId]/page.tsx:23`
- `app/checkout/success/page.tsx:13`
- `app/community/page.tsx:97`
- `app/community/topic/[id]/page.tsx:99`
- `app/courses/[id]/learn/page.tsx:19`
- `app/courses/[id]/page.tsx:19`
- `app/courses/page.tsx:16`
- `app/dashboard/page.tsx:17`
- `app/dashboard/progress/page.tsx:95`
- `app/instructor/courses/[id]/analytics/page.tsx:24`
- `app/instructor/courses/new/page.tsx:8`
- `app/instructor/courses/wizard/page.tsx:61`
- `app/instructor/dashboard/page.tsx:18`
- `app/instructor/live-sessions/page.tsx:33`
- `app/instructor/verification/page.tsx:15`
- `app/live/[id]/page.tsx:15`
- `app/live/page.tsx:15`
- `app/notifications/page.tsx:31`
- `app/page.tsx:14`
- `app/profile/certificates/page.tsx:15`
- `app/profile/page.tsx:19`
- `app/profile/purchases/page.tsx:13`
- `app/programs/[id]/page.tsx:220`
- `app/programs/page.tsx:90`
- `app/recommendations/page.tsx:20`
- `app/resources/[id]/page.tsx:17`
- `app/resources/page.tsx:12`
- `app/search/page.tsx:19`
- `app/settings/page.tsx:18`

#### Loading Components (7 files)
- `app/admin/certificates/loading.tsx:1`
- `app/certificates/verify/loading.tsx:1`
- `app/checkout/success/loading.tsx:1`
- `app/notifications/loading.tsx:4`
- `app/recommendations/loading.tsx:3`
- `app/resources/[id]/loading.tsx:3`
- `app/resources/loading.tsx:3`
- `app/search/loading.tsx:1`

#### Not Found Components (1 file)
- `app/resources/[id]/not-found.tsx:5`

### Configuration Files (7 files)

These files require default exports per their respective frameworks:

#### Convex Configuration
- `convex/auth.config.ts:14` - Convex Auth configuration
- `convex/http.ts:88` - Convex HTTP routes
- `convex/schema.ts:195` - Convex database schema

#### Next.js Configuration
- `next.config.mjs:11` - Next.js configuration

#### Testing Configuration
- `vitest.config.ts:4` - Vitest configuration

#### Code Quality Configuration
- `eslint.config.mjs:91` - ESLint flat config format
- `postcss.config.mjs:5` - PostCSS configuration
- `prettier.config.mjs:18` - Prettier configuration

## Documentation Examples (Excluded from Count)

The following files are in documentation and not part of the actual codebase:

- `.cursor/rules/convex_rules.mdc` - 5 examples
- `CLAUDE.md` - 2 examples
- `STANDARDS_CHECK_REPORT.md` - 2 examples
- `docs/SETUP.md` - 2 examples
- `docs/TESTING-STRATEGY.md` - 3 examples
- `docs/THIRD-PARTY-INTEGRATIONS.md` - 3 examples
- `docs/stories/story-109.2.md` - 1 example

Total: 18 documentation examples (excluded from audit)

## Recommendations

### High Priority
1. **Convert regular components** (providers/ConvexProvider.tsx, providers/index.tsx, components/image-upload.tsx) to named exports
2. **Delete dead code** (lesson-structure.tsx, section-structure.tsx)
3. **Investigate proxy.ts** - Determine if it should be renamed to middleware.ts

### Medium Priority
4. **Standardize dayjs usage** - Either:
   - Option A: Keep lib/dayjs.ts and ensure all imports use @/lib/dayjs (not raw dayjs)
   - Option B: Remove lib/dayjs.ts and import dayjs directly everywhere (losing plugin configuration)
   - **Recommendation**: Option A - Ensures consistent plugin configuration across the app

### Low Priority
5. **Document exceptions** - Add comments to config files explaining why they use default exports

## Impact Analysis

### Conversion Effort
- **4 files** to convert from default to named exports
- **6 import statements** to update
- **Estimated time**: 30 minutes
- **Risk**: Low (changes are mechanical and type-safe)

### Dead Code Removal
- **2 files** to delete
- **Estimated time**: 5 minutes
- **Risk**: None (no imports found)

### Middleware Investigation
- **1 file** to investigate/rename
- **Estimated time**: 15 minutes
- **Risk**: Medium (may affect routing if not properly configured)

## Next Steps

1. Create subtask for STANDARDS-EXPORTS wave to:
   - Convert 4 regular components to named exports
   - Update 6 import statements
   - Delete 2 dead code files
   - Investigate proxy.ts middleware naming

2. Verify all changes with:
   - `bun run typescript` - Type checking
   - `bun run lint` - ESLint validation
   - `bun run test` - Test suite
   - `bun run build` - Production build

3. Document the standard in `.claude/standards/typescript.md` under the "Exports" section

## Conclusion

The audit found **54 default exports** in the codebase:
- **40** are Next.js special files that must remain as default exports
- **7** are configuration files that require default exports
- **4** are regular components that should be converted to named exports
- **2** are dead code files that should be deleted
- **1** is a middleware file that may need renaming

The codebase is largely compliant with the named export standard, with only **4 regular component files** (7.4%) needing conversion. The majority of default exports (87%) are framework-required and correct.

---

**Generated**: 2025-11-15
**Auditor**: droidz-generalist
**Status**: Complete
