#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: bun new-feature <branch-name>"
  exit 1
fi

BRANCH_NAME=$1
MAIN_DIR=$(pwd)
NEW_DIR="../${BRANCH_NAME}"

# Create branch
echo "🔀 Creating new branch: $BRANCH_NAME"
git switch -c "$BRANCH_NAME"

# Create worktree
echo "🌳 Creating worktree at: $NEW_DIR"
git worktree add "$NEW_DIR" "$BRANCH_NAME"

cd "$NEW_DIR"

# Install deps using Bun
echo "📦 Installing dependencies..."
bun install

# Open VSCode in new window (if installed)
if command -v kiro &> /dev/null; then
  echo "📝 Opening kiro..."
  code .
fi
