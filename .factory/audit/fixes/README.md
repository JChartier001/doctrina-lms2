# Auto-Fix Engine

Automated code fixing system for standards violations with backup and rollback support.

## Features

- ✅ **Safe Auto-Fixes**: Applies only safe, non-breaking transformations
- ✅ **Backup System**: Creates timestamped backups before modifications
- ✅ **Rollback Support**: Automatically reverts if TypeScript compilation fails
- ✅ **Validation**: Runs TypeScript compiler after fixes
- ✅ **Extensible**: Plugin system for custom fixers

## Architecture

```
.factory/audit/fixes/
├── auto-fixer.ts          # Main auto-fix engine
├── backup.ts              # Backup and restore system
├── types.ts               # TypeScript type definitions
├── index.ts               # Public API exports
└── fixers/
    ├── use-client.ts      # Add "use client" directive
    ├── exports.ts         # Convert default → named exports
    ├── console.ts         # Remove console.log statements
    └── types.ts           # Add TypeScript return types
```

## Fixers

### 1. Use Client Fixer

**Rule ID**: `nextjs-001`, `use-client`

**What it fixes**: Adds `"use client"` directive to components using React hooks

**Example**:
```typescript
// Before
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button>{count}</button>;
}

// After
"use client";

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button>{count}</button>;
}
```

### 2. Exports Fixer

**Rule ID**: `ts-export`, `default-export`

**What it fixes**: Converts default exports to named exports

**Example**:
```typescript
// Before
export default function MyComponent() {
  return <div>Hello</div>;
}

// After
export function MyComponent() {
  return <div>Hello</div>;
}
```

### 3. Console Fixer

**Rule ID**: `no-console`

**What it fixes**: Comments out console.log statements

**Example**:
```typescript
// Before
console.log('Debug:', user);
const result = processUser(user);

// After
// console.log('Debug:', user); // Removed by audit
const result = processUser(user);
```

### 4. Types Fixer

**Rule ID**: `ts-return-type`

**What it fixes**: Adds return types to functions (simple cases only)

**Example**:
```typescript
// Before
function getUserName(id: string) {
  // no return statement
  console.log(id);
}

// After
function getUserName(id: string): void {
  // no return statement
  console.log(id);
}
```

**Note**: Complex type inference is skipped and requires manual fix.

## Usage

### Programmatic API

```typescript
import { createAutoFixEngine } from '.factory/audit/fixes';

// Create engine instance
const engine = createAutoFixEngine();

// Fix single file
const violations = [
  {
    ruleId: 'nextjs-001',
    severity: 'error',
    message: 'Missing "use client"',
    filePath: 'components/Counter.tsx',
    line: 1,
    column: 1,
  },
];

await engine.fixFile('components/Counter.tsx', violations);

// Get report
const report = engine.getReport();
console.log(`Fixed: ${report.fixedCount}/${report.totalViolations}`);
console.log(`Success rate: ${report.successRate}%`);
```

### Fix Multiple Files

```typescript
import { fixAll } from '.factory/audit/fixes';

const violationsByFile = new Map([
  ['components/Counter.tsx', [/* violations */]],
  ['app/page.tsx', [/* violations */]],
]);

const report = await fixAll(violationsByFile);

console.log('Files modified:', report.filesModified);
console.log('Backups:', report.backups);
```

### Custom Fixer

```typescript
import { createAutoFixEngine, type AutoFixer } from '.factory/audit/fixes';

const myFixer: AutoFixer = {
  name: 'My Custom Fixer',
  ruleId: 'custom-001',
  description: 'Fixes custom violations',
  
  canFix(violation, sourceCode) {
    return violation.ruleId === 'custom-001';
  },
  
  fix(violation, sourceCode) {
    const fixed = sourceCode.replace(/old/g, 'new');
    return { fixed, applied: true };
  },
};

const engine = createAutoFixEngine();
engine.registerFixer(myFixer);
```

## Backup System

### How It Works

1. **Before fixing**: Creates timestamped backup in `.backup/`
2. **After fixing**: Validates TypeScript compilation
3. **On failure**: Automatically restores from backup
4. **On success**: Keeps backup for manual rollback

### Backup Structure

```
.backup/
└── 2025-11-19_18-30-00/
    ├── components/
    │   └── Counter.tsx
    ├── app/
    │   └── page.tsx
    └── manifest.json
```

### Manual Rollback

```typescript
import { createAutoFixEngine } from '.factory/audit/fixes';

const engine = createAutoFixEngine();
await engine.fixFile('components/Counter.tsx', violations);

// Rollback all changes
const restored = engine.rollbackAll();
console.log(`Restored ${restored} files`);
```

## Safety Checks

### TypeScript Validation

After applying fixes, the engine runs:
```bash
bun run tsc --noEmit <file>
```

If compilation fails, the file is automatically restored from backup.

### Safe vs. Unsafe Fixes

**Safe** (auto-applied):
- Add `"use client"` directive
- Convert default → named exports
- Comment out console.log
- Add `: void` to functions without return

**Unsafe** (require manual review):
- Complex type inference
- Refactoring logic
- Security-related changes
- Behavior modifications

## Configuration

Configuration via `.auditrc.json`:

```json
{
  "autoFix": {
    "enabled": true,
    "safe": ["use-client", "exports", "console"],
    "requireManual": ["types", "security"],
    "backup": true,
    "backupDir": ".backup"
  }
}
```

## Reports

The auto-fix engine generates detailed reports:

```typescript
interface AutoFixReport {
  totalViolations: number;      // Total violations found
  fixedCount: number;            // Successfully fixed
  failedCount: number;           // Failed to fix
  skippedCount: number;          // Skipped (not fixable)
  successRate: number;           // Percentage (0-100)
  filesModified: string[];       // List of modified files
  backups: BackupInfo[];         // Backup locations
  errors: Array<{                // Errors encountered
    file: string;
    error: string;
  }>;
}
```

## Error Handling

### Compilation Failure
```typescript
// File: components/Counter.tsx
// Error: TypeScript compilation failed

// Action: Automatic rollback from backup
// Result: File restored to original state
```

### Fixer Crash
```typescript
// File: app/page.tsx
// Error: Fixer threw exception

// Action: Skip this fixer, try next
// Result: Violation marked as failed
```

## Testing

The auto-fix engine is fully tested:

```bash
# Run tests
bun test .factory/audit/fixes/

# Coverage
bun test --coverage .factory/audit/fixes/
```

## Best Practices

1. **Always review auto-fixes** before committing
2. **Keep backups** until changes are verified
3. **Run tests** after auto-fix
4. **Use incrementally** (one file at a time for first use)
5. **Extend carefully** (test custom fixers thoroughly)

## Limitations

- Only fixes violations with registered fixers
- Skips complex type inference (requires manual fix)
- Cannot fix semantic/logic errors
- Limited to TypeScript/TSX files

## Future Enhancements

- AI-powered fix suggestions (GPT-4)
- Interactive mode (choose fixes to apply)
- Diff preview before applying
- Undo/redo support
- Performance optimizations (parallel processing)

## Integration

### CI/CD

The auto-fix engine integrates with GitHub Actions:

```yaml
- name: Auto-fix violations
  run: bun run audit:fix
  
- name: Verify fixes
  run: bun run typescript
```

### Pre-commit Hook

Optional pre-commit hook runs incremental audit:

```bash
# Install hook
bash .factory/audit/scripts/install-hook.sh

# Runs on git commit
# Validates staged files only
```

## Support

For issues or questions:
1. Check this README
2. Review `.factory/specs/active/001-codebase-standards-audit.md`
3. Create issue in project repository

---

**Created**: 2025-11-19  
**Version**: 1.0.0  
**Framework**: Droidz Auto-Fix System
