# Spec 002: Standardize Forms with React Hook Form + Controller

**Priority:** 🔴 **CRITICAL (2nd Highest)**  
**Status:** Active  
**Created:** 2025-11-20  
**Estimated Effort:** 2-3 days sequential | 6-8 hours parallel (3x speedup)  
**Impact:** Form handling consistency, validation, UX

---

## Summary

Standardize all forms to use React Hook Form with FormProvider + Controller pattern + Zod validation, replacing manual useState-based form handling with declarative, type-safe form management.

---

## Problem Statement

**Current State:**
- Only 1 out of 5+ major forms uses FormProvider + Controller pattern
- Most forms use manual useState + onChange handlers
- No centralized validation (ad-hoc validation in handlers)
- No type-safe form validation
- Violates standard: "Use FormProvider + Controller for all forms"

**Issues:**
```tsx
// ❌ CURRENT PATTERN (Most forms)
const [currentPassword, setCurrentPassword] = useState('');
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');

<Input 
  value={currentPassword}
  onChange={(e) => setCurrentPassword(e.target.value)}
/>

const handleSubmit = () => {
  // Manual validation
  if (newPassword !== confirmPassword) {
    toast.error('Passwords do not match');
    return;
  }
  // Submit logic
};
```

**Why This Is Bad:**
- Repetitive boilerplate (useState + onChange for every field)
- No centralized validation
- No TypeScript type safety for form data
- Difficult to test
- No built-in error state management
- No accessibility features (error announcements)

---

## Architecture Diagram

\`\`\`mermaid
graph TD
    subgraph "❌ Current: Manual useState"
    A[Form Component] --> B[useState per field]
    B --> C[onChange handlers]
    C --> D[Manual validation]
    D --> E[Manual error display]
    end
    
    subgraph "✅ Target: React Hook Form"
    F[Form Component] --> G[FormProvider]
    G --> H[Zod Schema]
    H --> I[Controller per field]
    I --> J[Auto validation]
    J --> K[Auto error display]
    end
    
    style A fill:#ffcccc
    style B fill:#ffcccc
    style C fill:#ffcccc
    style F fill:#ccffcc
    style G fill:#ccffcc
    style H fill:#ccffcc
\`\`\`

---

## User Flow (Form Submission)

\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant F as Form
    participant RHF as React Hook Form
    participant Z as Zod Schema
    participant M as Mutation
    
    rect rgb(200, 255, 200)
    Note over U,M: ✅ TARGET: FormProvider + Controller + Zod
    U->>F: Fill form fields
    F->>RHF: Field changes tracked
    U->>F: Submit form
    RHF->>Z: Validate against schema
    alt Validation Fails
        Z-->>RHF: Return errors
        RHF-->>F: Display field errors
        F-->>U: Show error messages
    else Validation Passes
        Z-->>RHF: Valid data
        RHF->>M: Call mutation with typed data
        M-->>U: Success/Error feedback
    end
    end
\`\`\`

---

## Requirements

### Functional Requirements

**FR1: FormProvider Wrapper**
- ✅ All forms must wrap inputs in `<FormProvider {...methods}>`
- ✅ Use `useForm` hook with zodResolver
- ✅ Define Zod schema for validation

**FR2: Controller for Inputs**
- ✅ All controlled inputs must use `<Controller>`
- ✅ Native inputs can use `register` (simpler)
- ✅ Custom components (Select, DatePicker) must use Controller

**FR3: Zod Validation Schemas**
- ✅ All forms have Zod schema with TypeScript types
- ✅ Client-side validation before submission
- ✅ Type inference from schema (z.infer<typeof schema>)

**FR4: Error Handling**
- ✅ Display field-level errors via FormMessage
- ✅ Accessible error announcements (ARIA)
- ✅ Form-level errors for submission failures

**FR5: Submit Handling**
- ✅ Use `handleSubmit` wrapper
- ✅ Prevent submission on validation errors
- ✅ Loading states during submission

### Non-Functional Requirements

**NFR1: Type Safety**
- ✅ Full TypeScript types inferred from Zod schemas
- ✅ No `any` types in form handling
- ✅ Autocomplete for form data

**NFR2: Accessibility**
- ✅ ARIA labels on all inputs
- ✅ Error messages announced to screen readers
- ✅ Focus management on validation errors

**NFR3: Developer Experience**
- ✅ Reduce boilerplate by 70%
- ✅ Reusable form components
- ✅ Clear error messages

### Acceptance Criteria

- [ ] All 5+ major forms migrated to RHF + Controller
- [ ] All forms have Zod validation schemas
- [ ] No manual useState for form fields
- [ ] All forms accessible (WCAG 2.1 AA)
- [ ] TypeScript strict mode passes
- [ ] ESLint zero warnings
- [ ] Form validation tests added

---

## Task Breakdown

### Phase 1: Foundation (Sequential - 2 hours)

**T1.1: Audit Existing Forms**
- [ ] List all forms in application
- [ ] Identify validation requirements
- [ ] Document form schemas

**T1.2: Create Zod Schemas**
- [ ] Create `schema/` directory for form schemas
- [ ] Define Zod schemas for each form
- [ ] Export TypeScript types from schemas

**T1.3: Setup Reusable Components**
- [ ] Verify `components/ui/form.tsx` (already exists ✅)
- [ ] Create form field wrappers if needed
- [ ] Document pattern for team

---

### Phase 2: Parallel Migration (3 streams - 4-6 hours)

#### Stream A: Settings & Profile Forms (droidz-codegen)

**T2.1: Migrate app/settings/page.tsx**
- **Complexity:** HIGH (518 lines, 8 useState calls)
- **Forms:** Notifications, Preferences, Password Change
- **Schema:** Create `schema/SettingsSchema.ts`

```tsx
// schema/SettingsSchema.ts
import { z } from 'zod';

export const notificationPreferencesSchema = z.object({
  courseUpdates: z.boolean(),
  discussionMentions: z.boolean(),
  newMessages: z.boolean(),
  promotions: z.boolean(),
});

export const accountPreferencesSchema = z.object({
  language: z.enum(['english', 'spanish', 'french']),
  timezone: z.string(),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain number'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;
export type AccountPreferences = z.infer<typeof accountPreferencesSchema>;
export type PasswordChange = z.infer<typeof passwordChangeSchema>;
```

**Migration:**
```tsx
// app/settings/page.tsx
'use client';

import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';

import { passwordChangeSchema, PasswordChange } from '@/schema/SettingsSchema';
import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/convex/_generated/api';

export default function SettingsPage() {
  const updatePassword = useMutation(api.users.updatePassword);
  
  const form = useForm<PasswordChange>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  
  const onSubmit = async (data: PasswordChange) => {
    try {
      await updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password updated successfully');
      form.reset();
    } catch (error) {
      toast.error('Failed to update password');
    }
  };
  
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Controller
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Controller
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Controller
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Updating...' : 'Update Password'}
        </Button>
      </form>
    </FormProvider>
  );
}
```

**T2.2: Migrate app/profile/page.tsx**
- **Complexity:** MEDIUM (6 useState calls)
- **Schema:** Create `schema/ProfileSchema.ts`

```tsx
// schema/ProfileSchema.ts
export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  specialty: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url('Must be valid URL').optional().or(z.literal('')),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
```

---

#### Stream B: Checkout & Payment Forms (droidz-codegen)

**T2.3: Migrate app/checkout/[courseId]/page.tsx**
- **Complexity:** HIGH (8 useState calls, payment form)
- **Schema:** Create `schema/CheckoutSchema.ts`

```tsx
// schema/CheckoutSchema.ts
export const checkoutSchema = z.object({
  cardNumber: z.string()
    .regex(/^\d{16}$/, 'Card number must be 16 digits'),
  cardExpiry: z.string()
    .regex(/^\d{2}\/\d{2}$/, 'Format: MM/YY'),
  cardCvc: z.string()
    .regex(/^\d{3,4}$/, 'CVC must be 3-4 digits'),
  name: z.string().min(1, 'Name required'),
  email: z.string().email('Valid email required'),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
```

**Special Considerations:**
- Use Stripe Elements (Controller compatible)
- PCI compliance (don't store card data)
- Loading states during payment processing

---

#### Stream C: Instructor & Admin Forms (droidz-codegen)

**T2.4: Migrate app/instructor/verification/page.tsx**
- **Complexity:** MEDIUM (5 useState calls)
- **Schema:** Create `schema/InstructorVerificationSchema.ts`

```tsx
// schema/InstructorVerificationSchema.ts
export const verificationSchema = z.object({
  licenseNumber: z.string().min(1, 'License number required'),
  licenseState: z.string().min(1, 'State required'),
  licenseExpiry: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format: YYYY-MM-DD')
    .refine(date => new Date(date) > new Date(), {
      message: 'License must not be expired',
    }),
  licenseFile: z.instanceof(File).optional(),
  idFile: z.instanceof(File).optional(),
});

export type VerificationFormData = z.infer<typeof verificationSchema>;
```

**T2.5: Migrate app/instructor/live-sessions/page.tsx**
- **Complexity:** MEDIUM (2 useState calls + newSession object)
- **Schema:** Create `schema/LiveSessionSchema.ts`

```tsx
// schema/LiveSessionSchema.ts
export const liveSessionSchema = z.object({
  title: z.string().min(1, 'Title required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  scheduledFor: z.date().min(new Date(), 'Must be future date'),
  duration: z.number().min(15, 'Minimum 15 minutes').max(240, 'Maximum 4 hours'),
  maxParticipants: z.number().min(1).max(500),
  isRecorded: z.boolean(),
});

export type LiveSessionFormData = z.infer<typeof liveSessionSchema>;
```

---

### Phase 3: Testing (Sequential - 2 hours)

**T3.1: Form Validation Tests**
```tsx
// app/settings/__tests__/password-form.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { passwordChangeSchema } from '@/schema/SettingsSchema';

describe('Password Change Form', () => {
  it('should validate password requirements', async () => {
    const user = userEvent.setup();
    render(<PasswordChangeForm />);
    
    const newPasswordInput = screen.getByLabelText('New Password');
    await user.type(newPasswordInput, 'weak');
    
    await user.click(screen.getByRole('button', { name: /update/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/must be at least 8 characters/i)).toBeInTheDocument();
    });
  });
  
  it('should validate password match', async () => {
    const user = userEvent.setup();
    render(<PasswordChangeForm />);
    
    await user.type(screen.getByLabelText('New Password'), 'ValidPass123');
    await user.type(screen.getByLabelText('Confirm Password'), 'DifferentPass123');
    
    await user.click(screen.getByRole('button', { name: /update/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });
  
  it('should submit valid form', async () => {
    const mockMutation = vi.fn();
    const user = userEvent.setup();
    render(<PasswordChangeForm updatePassword={mockMutation} />);
    
    await user.type(screen.getByLabelText('Current Password'), 'OldPass123');
    await user.type(screen.getByLabelText('New Password'), 'NewPass123!');
    await user.type(screen.getByLabelText('Confirm Password'), 'NewPass123!');
    
    await user.click(screen.getByRole('button', { name: /update/i }));
    
    await waitFor(() => {
      expect(mockMutation).toHaveBeenCalledWith({
        currentPassword: 'OldPass123',
        newPassword: 'NewPass123!',
      });
    });
  });
});
```

**T3.2: Accessibility Tests**
```tsx
// Test ARIA labels, error announcements
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = render(<PasswordChangeForm />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

**T3.3: Integration Tests**
- [ ] Test form submission with Convex mutations
- [ ] Test error handling from backend
- [ ] Test optimistic updates

---

## Security Considerations

### OWASP Checklist

✅ **A01: Broken Access Control**
- Forms submit to Convex mutations with auth checks

✅ **A03: Injection**
- Zod validation prevents injection attacks
- Type-safe data handling

✅ **A04: Insecure Design**
- Client + server validation (defense-in-depth)
- Password requirements enforced

✅ **A05: Security Misconfiguration**
- No sensitive data in form default values
- PCI compliance for payment forms (Stripe Elements)

✅ **A07: Identification and Authentication Failures**
- Password complexity requirements
- Current password verification for changes

---

## Edge Cases & Error Handling

### Edge Case 1: Form Reset After Submission
```tsx
const onSubmit = async (data: FormData) => {
  await mutation(data);
  form.reset(); // Clear form after successful submission
};
```

### Edge Case 2: Backend Validation Errors
```tsx
const onSubmit = async (data: FormData) => {
  try {
    await mutation(data);
  } catch (error) {
    if (error.message.includes('email already exists')) {
      form.setError('email', {
        type: 'manual',
        message: 'Email already in use',
      });
    }
  }
};
```

### Edge Case 3: File Upload Validation
```tsx
const fileSchema = z.instanceof(File)
  .refine(file => file.size <= 5 * 1024 * 1024, 'File must be less than 5MB')
  .refine(file => ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type), 
    'Only JPEG, PNG, or PDF allowed');
```

### Edge Case 4: Dynamic Field Arrays
```tsx
const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: 'items',
});

fields.map((field, index) => (
  <Controller
    key={field.id}
    control={form.control}
    name={`items.${index}.name`}
    render={({ field }) => <Input {...field} />}
  />
));
```

### Edge Case 5: Conditional Validation
```tsx
const schema = z.object({
  type: z.enum(['student', 'instructor']),
  licenseNumber: z.string().optional(),
}).refine(data => {
  if (data.type === 'instructor') {
    return !!data.licenseNumber;
  }
  return true;
}, {
  message: 'License number required for instructors',
  path: ['licenseNumber'],
});
```

### Edge Case 6: Debounced Validation (Async)
```tsx
const emailSchema = z.string().email().refine(async (email) => {
  const exists = await checkEmailExists(email);
  return !exists;
}, 'Email already in use');

// Use with mode: 'onChange' or 'onBlur'
const form = useForm({
  resolver: zodResolver(schema),
  mode: 'onBlur', // Validate on blur to reduce API calls
});
```

### Edge Case 7: Custom Input Components
```tsx
<Controller
  control={form.control}
  name="date"
  render={({ field }) => (
    <DatePicker
      selected={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
    />
  )}
/>
```

### Edge Case 8: Multi-Step Forms
```tsx
const [step, setStep] = useState(1);

const form = useForm({
  resolver: zodResolver(multiStepSchema),
  mode: 'onChange',
});

// Validate current step before proceeding
const handleNext = async () => {
  const isValid = await form.trigger(getFieldsForStep(step));
  if (isValid) setStep(step + 1);
};
```

---

## Testing Strategy

### Unit Tests (Zod Schemas)

```typescript
// schema/__tests__/SettingsSchema.test.ts
import { passwordChangeSchema } from '../SettingsSchema';

describe('Password Change Schema', () => {
  it('should require all fields', () => {
    const result = passwordChangeSchema.safeParse({});
    expect(result.success).toBe(false);
  });
  
  it('should enforce password complexity', () => {
    const result = passwordChangeSchema.safeParse({
      currentPassword: 'old',
      newPassword: 'weak',
      confirmPassword: 'weak',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.some(i => 
      i.message.includes('8 characters')
    )).toBe(true);
  });
  
  it('should validate password match', () => {
    const result = passwordChangeSchema.safeParse({
      currentPassword: 'OldPass123',
      newPassword: 'NewPass123!',
      confirmPassword: 'DifferentPass123!',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.some(i => 
      i.message.includes('do not match')
    )).toBe(true);
  });
  
  it('should pass valid data', () => {
    const result = passwordChangeSchema.safeParse({
      currentPassword: 'OldPass123',
      newPassword: 'NewPass123!',
      confirmPassword: 'NewPass123!',
    });
    expect(result.success).toBe(true);
  });
});
```

### Integration Tests (Form Components)

See T3.1 above for complete examples.

### E2E Tests (User Flows)

```typescript
// tests/e2e/settings.spec.ts
test('user can change password', async ({ page }) => {
  await page.goto('/settings');
  
  await page.fill('[name="currentPassword"]', 'OldPassword123!');
  await page.fill('[name="newPassword"]', 'NewPassword123!');
  await page.fill('[name="confirmPassword"]', 'NewPassword123!');
  
  await page.click('button[type="submit"]');
  
  await expect(page.getByText('Password updated successfully')).toBeVisible();
});

test('shows validation errors', async ({ page }) => {
  await page.goto('/settings');
  
  await page.fill('[name="newPassword"]', 'weak');
  await page.click('button[type="submit"]');
  
  await expect(page.getByText(/must be at least 8 characters/i)).toBeVisible();
});
```

---

## Success Metrics

### Code Metrics

**Before Migration:**
- Manual useState per field: 50+ fields
- Custom validation logic: 15+ files
- Lines of form boilerplate: ~1000
- Type safety: 50%

**After Migration:**
- Manual useState per field: 0 ✅
- Custom validation logic: Centralized in schemas ✅
- Lines of form boilerplate: ~300 (70% reduction) ✅
- Type safety: 100% ✅

### User Experience Metrics

- **Validation Feedback:** Instant (on blur/change)
- **Error Clarity:** Specific field-level messages
- **Accessibility Score:** WCAG 2.1 AA compliant
- **Form Completion Rate:** Improve by 15-20% (better UX)

### Developer Experience Metrics

- **Time to Add New Form:** < 15 minutes (schema + Controller)
- **Boilerplate Reduction:** 70%
- **Type Safety:** Full TypeScript inference

---

## Forms to Migrate (Priority Order)

### High Priority (Phase 2):
1. ✅ `app/settings/page.tsx` - Password, Notifications, Preferences (3 forms)
2. ✅ `app/profile/page.tsx` - Profile update form
3. ✅ `app/checkout/[courseId]/page.tsx` - Payment form (HIGH IMPACT)
4. ✅ `app/instructor/verification/page.tsx` - Verification form
5. ✅ `app/instructor/live-sessions/page.tsx` - Session creation

### Medium Priority (Optional):
6. `app/community/topic/[id]/page.tsx` - Reply form (simple)
7. Course wizard forms (already uses RHF ✅ - just verify)

---

## Dependencies

**Existing (Already Installed):**
- ✅ react-hook-form@7.66.0
- ✅ zod@4.1.12
- ✅ @hookform/resolvers@5.2.2

**New Dependencies:**
```bash
# For testing (if not already installed)
bun add -D @testing-library/user-event
```

---

## Migration Pattern Reference

### Pattern 1: Simple Form Field

**Before:**
```tsx
const [email, setEmail] = useState('');

<Input
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

**After:**
```tsx
const form = useForm({
  resolver: zodResolver(schema),
});

<Controller
  control={form.control}
  name="email"
  render={({ field }) => <Input {...field} />}
/>
```

---

### Pattern 2: Select/Dropdown

**Before:**
```tsx
const [language, setLanguage] = useState('english');

<Select value={language} onValueChange={setLanguage}>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="english">English</SelectItem>
  </SelectContent>
</Select>
```

**After:**
```tsx
<Controller
  control={form.control}
  name="language"
  render={({ field }) => (
    <Select value={field.value} onValueChange={field.onChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="english">English</SelectItem>
      </SelectContent>
    </Select>
  )}
/>
```

---

### Pattern 3: Checkbox/Switch

**Before:**
```tsx
const [enabled, setEnabled] = useState(false);

<Switch checked={enabled} onCheckedChange={setEnabled} />
```

**After:**
```tsx
<Controller
  control={form.control}
  name="enabled"
  render={({ field }) => (
    <Switch 
      checked={field.value} 
      onCheckedChange={field.onChange} 
    />
  )}
/>
```

---

### Pattern 4: Form Submission

**Before:**
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Manual validation
  if (!email) {
    toast.error('Email required');
    return;
  }
  
  await saveData({ email });
};

<form onSubmit={handleSubmit}>
```

**After:**
```tsx
const onSubmit = async (data: FormData) => {
  // Data already validated by Zod!
  await saveData(data);
};

<form onSubmit={form.handleSubmit(onSubmit)}>
```

---

## Rollout Plan

### Week 1: Critical Forms (Days 1-2)
- Day 1: Settings page (3 forms), Profile page
- Day 2: Checkout page, Instructor verification

### Week 2: Testing & Polish (Days 3-4)
- Day 3: Add form validation tests
- Day 4: Accessibility audit, bug fixes

---

## Resources

**Documentation:**
- React Hook Form: https://react-hook-form.com/
- Zod: https://zod.dev/
- Multi-Step Form Example: https://github.com/itsdevelopershakil/multi-step-form-with-validation

**Standards:**
- `.factory/standards/templates/react.md` - Form patterns
- `.factory/standards/shadcn-ui.md` - Form UI components

**Examples in Codebase:**
- ✅ Good: `components/course-wizard/basic-info-step.tsx` - Uses Controller correctly
- ❌ Bad: `app/settings/page.tsx` - Manual useState

---

## Orchestration Notes

**Recommended Execution:** Parallel with Droidz Orchestrator

**Why Parallel Works:**
- ✅ 3 independent form groups (settings/profile, checkout, instructor)
- ✅ No shared dependencies
- ✅ Clear schemas defined upfront

**Sequential Time:** 16-20 hours  
**Parallel Time (3 agents):** 6-8 hours  
**Speedup:** 3x faster ⚡

**Orchestrator Command:**
```bash
"Use orchestrator to implement Spec 002 in parallel"
```

---

## Post-Migration Validation Checklist

- [ ] All forms tested manually
- [ ] All validation rules working
- [ ] Error messages display correctly
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Form submission to Convex working
- [ ] TypeScript types inferred from schemas
- [ ] `bun typescript` passes
- [ ] `bun lint` passes
- [ ] Form tests added and passing

---

**Dependencies:** 
- Should run AFTER Spec 001 (Convex migration) for optimal flow
- Can run independently if needed

**Next Spec:** [003-frontend-testing.md](./003-frontend-testing.md)

---

*This spec is executable and ready for implementation. See "Orchestration Notes" for fastest execution strategy.*
