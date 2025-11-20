# Droidz Framework - Setup Complete

**Project:** Doctrina LMS  
**Setup Date:** 2025-11-20  
**Status:** ✅ Initialized and Ready

---

## 🎉 Setup Summary

The Droidz development framework has been successfully initialized for your project with comprehensive research using documentation and web search for best practices.

---

## ✅ What Was Set Up

### 1. Directory Structure

```
.factory/
├── memory/
│   └── org/
│       └── tech-stack.json          # Comprehensive tech stack analysis
├── specs/
│   ├── active/                       # Active feature specs
│   ├── archived/                     # Completed specs
│   └── examples/
│       └── feature-authentication-enhancement.md  # Example spec
├── scripts/
│   └── orchestrator.sh               # Parallel execution orchestrator
├── droids/                           # 7 specialist droids available
│   ├── codegen.md
│   ├── generalist.md
│   ├── infra.md
│   ├── integration.md
│   ├── refactor.md
│   ├── test.md
│   └── droidz-orchestrator.md        # Auto-invoked for complex tasks
└── standards/                        # Coding standards (pre-existing)

.runs/
└── .coordination/                    # Parallel execution tracking
```

### 2. Tech Stack Detection

✅ **Analyzed and documented:**

- **Frontend:** Next.js 16.0.1 + React 19.2.0
- **Backend:** Convex 1.28.2 (realtime database)
- **Auth:** Clerk 6.34.5
- **Styling:** Tailwind CSS 4.1.17 + shadcn/ui (Radix)
- **Forms:** React Hook Form 7.66.0 + Zod 4.1.12
- **Testing:** Vitest 4.0.8 + convex-test
- **Language:** TypeScript 5.9.3 (strict mode)
- **Package Manager:** Bun 1.3.2

Full details saved to: `.factory/memory/org/tech-stack.json`

### 3. Research & Best Practices

✅ **Researched using:**

- MCP Documentation Search (Next.js, Convex)
- Web Search for 2025 best practices
- Next.js 16 official documentation
- Convex realtime patterns

**Key Findings Applied:**

- Next.js 16 Partial Pre-Rendering (PPR) for caching
- Turbopack stable (5-10x faster Fast Refresh)
- React 19 Server Components patterns
- Convex reactive queries (eliminates useState for server data)
- Feature-based architecture for scalability
- FormProvider + Controller pattern for forms

### 4. Droids Available

✅ **7 Specialist Droids Ready:**

| Droid                   | Purpose                           | Auto-Invokes When                                          |
| ----------------------- | --------------------------------- | ---------------------------------------------------------- |
| **droidz-orchestrator** | Parallel execution coordinator    | 3+ independent tasks, "build [system]", complex features   |
| **codegen**             | Feature implementation with tests | "implement feature", "add functionality"                   |
| **test**                | Testing specialist                | "write tests", "fix test failures", "increase coverage"    |
| **infra**               | CI/CD and deployment              | "setup CI", "configure deployment", "Docker"               |
| **integration**         | External API integration          | "integrate API", "add webhook", "third-party service"      |
| **refactor**            | Code quality improvements         | "refactor code", "reduce duplication", "improve structure" |
| **generalist**          | General purpose fallback          | Unclear or mixed tasks                                     |

### 5. Example Spec Created

✅ **Created:** `.factory/specs/examples/feature-authentication-enhancement.md`

Demonstrates:

- Proper spec format
- Task breakdown for orchestration
- Parallel vs sequential execution
- 3x speedup estimation
- Clear acceptance criteria

---

## 🚀 How to Use Droidz

### Method 1: Auto-Invocation (Recommended)

Claude Code automatically detects complexity and invokes appropriate droids:

```bash
# These phrases trigger automatic orchestration:
"Build authentication system"
"Implement payment processing"
"Create search feature with frontend + backend + tests"
"Add 5 new features from roadmap"
"Refactor authentication module"
```

**You don't need to explicitly call droids - Claude Code handles it!**

### Method 2: Explicit Droid Selection

If you want to use a specific droid:

```bash
# Use orchestrator for parallel execution
"Use droidz-orchestrator to implement the auth feature"

# Use specific specialist
"Use droidz-test to write tests for the auth module"
"Use droidz-infra to setup GitHub Actions CI"
```

### Method 3: Spec-Driven Development

1. **Create a spec** in `.factory/specs/active/`
2. **Reference it:** "Implement the feature from feature-name.md spec"
3. **Orchestrator auto-activates** if spec has parallel tasks

---

## 📋 Example Workflows

### Workflow 1: Build New Feature (Parallel)

```
YOU: "Build a notification system with real-time updates"

CLAUDE CODE:
├─ Detects complexity (backend + frontend + tests)
├─ Auto-invokes droidz-orchestrator
├─ Orchestrator breaks into 3 streams:
│  ├─ Stream A: codegen → Backend notifications API (Convex)
│  ├─ Stream B: codegen → Frontend notification UI (React)
│  └─ Stream C: test → Notification tests
├─ 3 agents work in parallel (20-25 min)
└─ Synthesized result presented

Result: 3x faster than sequential development
```

### Workflow 2: Fix Failing Tests

```
YOU: "Fix failing tests in auth module"

CLAUDE CODE:
├─ Auto-invokes droidz-test (testing specialist)
├─ Analyzes test failures
├─ Applies systematic-debugging skill
└─ Fixes tests + ensures coverage

Result: Expert testing patterns applied
```

### Workflow 3: Refactor Codebase

```
YOU: "Refactor the course management code"

CLAUDE CODE:
├─ Auto-invokes droidz-refactor
├─ Analyzes code quality issues
├─ Applies standards from .factory/standards/
├─ Ensures no behavior changes (tests still pass)
└─ Improves structure and maintainability

Result: Clean, maintainable code
```

---

## 🎯 Available Commands

### Droidz Commands

```bash
# Check Droidz status
"What droids are available?"
"Show me the Droidz setup status"

# Use orchestrator
"Use orchestrator to [task]"
"Implement [feature] in parallel"

# Use specific droid
"Use droidz-test to write tests"
"Use droidz-infra to setup CI"
```

### Development Commands

```bash
# Start development
bun dev                    # Frontend + Backend
bun dev:frontend           # Next.js only
bun dev:backend            # Convex only

# Code quality
bun verify                 # Format + Lint + TypeCheck + Test
bun lint:fix               # Fix linting issues
bun formatting:fix         # Fix formatting
bun typescript             # Type check

# Testing
bun test                   # Run all tests
bun test:watch             # Watch mode
bun test:ui                # UI mode
bun test:coverage          # Coverage report

# Convex
bun convex:deploy          # Deploy backend
bun convex:logs            # View logs
```

---

## 📚 Key Files & Documentation

### Standards (Auto-Enforced)

- `.factory/standards/nextjs.md` - Next.js 16 App Router patterns
- `.factory/standards/react-convex.md` - Convex reactive patterns
- `.factory/standards/typescript.md` - TypeScript strict mode
- `.factory/standards/testing.md` - Vitest + convex-test
- `.factory/standards/security.md` - Security best practices
- `.factory/standards/forms.md` - FormProvider + Controller pattern

### Memory System

- `.factory/memory/org/tech-stack.json` - Tech stack analysis
- `.factory/specs/examples/` - Example specs
- `.factory/specs/active/` - Active feature specs
- `.factory/specs/archived/` - Completed specs

### Droids

- `.factory/droids/` - All droid configurations
- `.factory/scripts/orchestrator.sh` - Orchestration script

---

## 🔍 Environment Check Results

### ✅ Dependencies Available

- **Git:** 2.51.0 ✓
- **Bun:** 1.3.2 ✓
- **Node:** 24.10.0 (via Volta) ✓
- **Disk Space:** 1.68 TB free ✓

### ⚠️ Optional Dependencies (Windows)

- **jq:** Not available (JSON processing - Windows alternative: PowerShell)
- **tmux:** Not available (Linux/Mac terminal multiplexer - not needed on Windows)

**Note:** Windows doesn't have native `jq` or `tmux`, but Droidz works without them using PowerShell equivalents.

### Git Worktrees

- **Status:** Available (git worktree list works)
- **Current:** Single worktree (main working tree)
- **Usage:** Can create parallel worktrees for isolated development

---

## 🎓 Best Practices Applied

Based on research and tech stack analysis:

1. **Use Server Components by default** - Only add `'use client'` when needed
2. **Leverage Convex reactivity** - No `useState` for server data (use `useQuery`)
3. **FormProvider + Controller pattern** - Required for all forms (React Hook Form)
4. **Feature-based architecture** - Co-locate related components, hooks, tests
5. **100% test coverage goal** - TDD with Vitest + convex-test
6. **TypeScript strict mode** - Explicit types for all parameters and returns
7. **Zero-warnings policy** - ESLint max-warnings 0
8. **Defense-in-depth validation** - Client + server validation with Zod
9. **Git worktrees for parallel work** - Isolate feature development

---

## 🚦 Next Steps

### Immediate Actions

1. **Try the orchestrator:**

   ```
   "Build a dashboard feature with charts and data visualization"
   ```

   Watch Claude Code auto-invoke orchestrator and parallelize work!

2. **Review the example spec:**

   ```
   Open: .factory/specs/examples/feature-authentication-enhancement.md
   ```

   See how to structure specs for optimal orchestration.

3. **Check your tech stack analysis:**
   ```
   Open: .factory/memory/org/tech-stack.json
   ```
   Review detected technologies and patterns.

### Create Your First Spec

```markdown
# .factory/specs/active/my-feature.md

## Overview

Brief description of the feature

## Task Breakdown

### Phase 1: Foundation (Sequential)

- [ ] Analyze existing code
- [ ] Define interfaces

### Phase 2: Parallel Implementation

#### Stream A: Backend (droidz-codegen)

- [ ] Task 1
- [ ] Task 2

#### Stream B: Frontend (droidz-codegen)

- [ ] Task 1
- [ ] Task 2

#### Stream C: Tests (droidz-test)

- [ ] Test 1
- [ ] Test 2

### Phase 3: Integration (Sequential)

- [ ] Merge streams
- [ ] Create PR

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
```

Then: **"Implement my-feature.md using orchestrator"**

---

## 💡 Tips for Maximum Productivity

### 1. Let Auto-Invocation Work

Don't micromanage - Claude Code knows when to use orchestration:

- ✅ "Build X" → Auto-detects complexity
- ❌ "Use orchestrator to maybe possibly build X" → Unnecessary

### 2. Write Good Specs

Clear specs = better orchestration:

- Break into parallel streams
- Define clear interfaces
- List acceptance criteria

### 3. Trust the Standards

All droids automatically follow `.factory/standards/`:

- No need to repeat "use TypeScript strict mode"
- No need to say "write tests"
- Standards are auto-enforced

### 4. Check Progress Proactively

When orchestrator runs agents:

- Ask "How's it going?" to check file changes
- Agents work silently - you control when to check
- Progress visible via git status and file timestamps

### 5. Use Verification

Before committing:

```bash
bun verify  # Runs: format + lint + typecheck + test coverage
```

---

## 🛠️ Troubleshooting

### Issue: Orchestrator Not Auto-Invoked

**Cause:** Task not complex enough (single file, simple change)

**Solution:**

- Explicitly request: "Use orchestrator to..."
- OR let Claude Code handle directly (might be faster for simple tasks)

### Issue: Droid Not Following Standards

**Cause:** Standards file missing or unclear

**Solution:**

- Check `.factory/standards/` directory
- Add/update relevant standard
- Re-run task

### Issue: Git Worktree Conflicts

**Cause:** Multiple worktrees editing same files

**Solution:**

- Use feature-based worktrees (isolated features)
- Coordinate file ownership between streams

---

## 📞 Getting Help

### Resources

1. **Example Spec:** `.factory/specs/examples/feature-authentication-enhancement.md`
2. **Tech Stack:** `.factory/memory/org/tech-stack.json`
3. **Standards:** `.factory/standards/`
4. **Droids:** `.factory/droids/`

### Commands

```bash
# Check setup status
"Show Droidz status"

# View available droids
"List all droids"

# Review tech stack
"What's our tech stack?"

# Get orchestrator help
"How do I use the orchestrator?"
```

---

## 🎉 You're All Set!

Your Doctrina LMS project is now equipped with the Droidz framework for **3-5x faster parallel development**.

**Try it now:**

```
"Build a progress tracking dashboard with charts and user analytics"
```

Watch the orchestrator break it into parallel streams and coordinate multiple specialist droids!

---

**Happy Coding! 🚀**
