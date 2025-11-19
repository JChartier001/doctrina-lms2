#!/bin/bash

# Install pre-commit hook for standards audit
# This is optional and must be run manually by developers

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOK_SOURCE="$SCRIPT_DIR/pre-commit"
HOOK_DEST=".git/hooks/pre-commit"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Installing Standards Audit Pre-commit Hook"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if .git directory exists
if [ ! -d ".git" ]; then
  echo "❌ Error: Not in a git repository"
  echo "   Run this script from the repository root"
  exit 1
fi

# Check if hook already exists
if [ -f "$HOOK_DEST" ]; then
  echo "⚠️  Pre-commit hook already exists"
  echo ""
  read -p "   Overwrite existing hook? (y/N): " -n 1 -r
  echo ""
  
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Installation cancelled"
    exit 1
  fi
  
  # Backup existing hook
  BACKUP="$HOOK_DEST.backup.$(date +%s)"
  cp "$HOOK_DEST" "$BACKUP"
  echo "✅ Backed up existing hook to: $BACKUP"
fi

# Create hooks directory if it doesn't exist
mkdir -p "$(dirname "$HOOK_DEST")"

# Copy hook
cp "$HOOK_SOURCE" "$HOOK_DEST"
chmod +x "$HOOK_DEST"

echo ""
echo "✅ Pre-commit hook installed successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Usage:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  • Hook runs automatically on 'git commit'"
echo "  • Validates staged TypeScript files"
echo "  • Blocks commit if violations found"
echo ""
echo "  To skip the hook:"
echo "    git commit --no-verify"
echo ""
echo "  To uninstall:"
echo "    rm .git/hooks/pre-commit"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
