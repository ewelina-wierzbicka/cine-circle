#!/usr/bin/env bash
# Prints all commits on the current branch not yet in main.
# Use before opening a PR to verify every commit belongs to the current task.

set -euo pipefail

BRANCH=$(git branch --show-current)
BASE="main"

echo "Branch: $BRANCH"
echo "Commits not in $BASE:"
echo ""
git log --oneline "$BASE..HEAD"

echo ""
COMMIT_COUNT=$(git rev-list --count "$BASE..HEAD")
echo "$COMMIT_COUNT commit(s) ahead of $BASE."
echo ""
echo "Review the list above. Every commit should belong to the current task."
echo "If any commit is unrelated, remove it with: git rebase -i $BASE"
