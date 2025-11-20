# Standards Audit Report

**Date**: 11/19/2025
**Project**: doctrina-lms
**Compliance Score**: 87.3%

## Summary

- ✅ 453 files scanned
- ⚠️ 142 violations found
- 🎯 Target: 90% compliance

## Violations by Standard

| Standard   | Violations | Severity  |
| ---------- | ---------- | --------- |
| Typescript | 45         | 🔴 High   |
| React      | 32         | 🔴 High   |
| Nextjs     | 28         | 🟡 Medium |
| Security   | 15         | 🟢 Low    |
| Testing    | 12         | 🟢 Low    |
| Forms      | 7          | 🟢 Low    |
| Tailwind   | 3          | 🟢 Low    |

## Violations by Severity

- 🔴 **Error**: 58
- 🟡 **Warning**: 72
- ℹ️ **Info**: 12

## Top Violations

1. Component uses hooks but missing "use client" (1 file)
2. Default export instead of named export (1 file)
3. Missing explicit return type (1 file)
4. Missing authentication check in mutation (1 file)
5. Client component could be server component (1 file)
6. Test committed with .only() flag (1 file)
7. Inline object literal in JSX prop (1 file)
8. Hardcoded color instead of theme variable (1 file)

## Detailed Violations (Top 20)

### 1. Component uses hooks but missing "use client"

- **File**: `app/dashboard/page.tsx`
- **Line**: 12
- **Rule**: nextjs-001
- **Severity**: 🔴 error
- **Code**: `const [user] = useState()`
- **Fix**: Add "use client" directive at top of file

### 2. Default export instead of named export

- **File**: `components/courses/CourseCard.tsx`
- **Line**: 8
- **Rule**: react-003
- **Severity**: 🔴 error
- **Code**: `export default function CourseCard() { ... }`
- **Fix**: Change to: export function CourseCard() { ... }

### 3. Missing authentication check in mutation

- **File**: `convex/users.ts`
- **Line**: 45
- **Rule**: security-007
- **Severity**: 🔴 error
- **Code**: `export const updateUser = mutation({`
- **Fix**: Add: const identity = await ctx.auth.getUserIdentity(); if (!identity) throw new Error("Unauthorized");

### 4. Test committed with .only() flag

- **File**: `components/ui/Button.test.tsx`
- **Line**: 12
- **Rule**: testing-001
- **Severity**: 🔴 error
- **Code**: `it.only('renders button', () => {`
- **Fix**: Remove .only(): it('renders button', () => {

---

[Full details in HTML report](.audit-reports/index.html)

Run `bun run audit:fix` to auto-fix 99 violations
