# Pre-commit Hook Scripts

Optional pre-commit hook for standards audit.

## Installation

### Quick Install

```bash
bash .factory/audit/scripts/install-hook.sh
```

### Manual Install

```bash
# Copy hook to .git/hooks/
cp .factory/audit/scripts/pre-commit .git/hooks/pre-commit

# Make executable
chmod +x .git/hooks/pre-commit
```

## What It Does

The pre-commit hook:
1. Runs on every `git commit`
2. Scans **only staged TypeScript files**
3. Validates TypeScript compilation
4. Blocks commit if errors found
5. Can be bypassed with `--no-verify`

## Usage

### Normal Commit (with hook)
```bash
git add .
git commit -m "feat: add feature"

# Output:
# 🔍 Running standards audit on staged files...
# Found 5 TypeScript file(s) to audit
# Validating TypeScript compilation...
# ✅ Standards audit passed!
```

### Skip Hook
```bash
git commit --no-verify -m "feat: add feature"
```

### Uninstall
```bash
rm .git/hooks/pre-commit
```

## Configuration

The hook respects `.auditignore` patterns:
- Skips `node_modules/`
- Skips `.next/`
- Skips generated files
- Skips test files (if configured)

## Performance

**Fast incremental audit**:
- Only checks staged files
- Parallel processing
- < 10 seconds for typical commits

## Troubleshooting

### Hook Not Running
```bash
# Check if hook exists
ls -la .git/hooks/pre-commit

# Check if executable
chmod +x .git/hooks/pre-commit
```

### Hook Fails Incorrectly
```bash
# Skip once
git commit --no-verify

# Or uninstall
rm .git/hooks/pre-commit
```

### Update Hook
```bash
# Reinstall
bash .factory/audit/scripts/install-hook.sh
```

## Best Practices

1. **Optional**: Don't force team to use hook
2. **Educate**: Explain benefits to team
3. **Test first**: Try on small commits
4. **Iterate**: Improve based on feedback
5. **Document**: Keep this README updated

## Future Enhancements

- Auto-fix mode (fix before commit)
- Warning-only mode (don't block)
- Configurable severity threshold
- Integration with audit engine (Stream A)

---

**Created**: 2025-11-19  
**Type**: Git Hook  
**Framework**: Droidz Standards Audit
