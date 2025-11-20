# Droidz Memory System

This directory contains organizational memory for the Droidz framework.

## Structure

```
memory/
└── org/
    └── tech-stack.json     # Comprehensive tech stack analysis
```

## Purpose

The memory system stores:

- **Tech Stack Analysis** - Detected technologies, versions, patterns
- **Architectural Decisions** - Key choices and rationale
- **Best Practices** - Research findings and recommendations

## Files

### `org/tech-stack.json`

Comprehensive analysis of your project's technology stack including:

- **Project metadata** - Name, type, version, package manager
- **Frontend stack** - Framework, library, styling, UI components
- **Backend stack** - Database, authentication, payments
- **Development tools** - TypeScript, testing, linting
- **Architecture** - Patterns, data flow, file structure
- **Best practices** - Research findings and recommendations

**Updated:** 2025-11-20  
**Research Sources:** MCP Docs, Web Search, Next.js 16 docs, Convex patterns

## Usage

Droids automatically reference this memory when:

- Generating code (follows detected patterns)
- Making architectural decisions (aligns with existing choices)
- Implementing features (uses correct versions and APIs)

## Maintenance

Update `tech-stack.json` when:

- Upgrading major dependencies
- Adding new frameworks/libraries
- Changing architectural patterns
- Making significant technology decisions

## Related Directories

- `.factory/standards/` - Coding standards (what to follow)
- `.factory/specs/` - Feature specifications (what to build)
- `.factory/droids/` - Droid configurations (who builds it)
