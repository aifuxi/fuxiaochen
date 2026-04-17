#!/usr/bin/env bash

set -euo pipefail

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "ERROR: not inside a git repository"
  exit 1
fi

repo_root="$(git rev-parse --show-toplevel)"
branch_name="$(git branch --show-current 2>/dev/null || true)"

merge_head_present="no"
cherry_pick_present="no"
rebase_merge_present="no"
rebase_apply_present="no"

git_dir="$(git rev-parse --git-dir)"

if [ -f "${git_dir}/MERGE_HEAD" ]; then
  merge_head_present="yes"
fi

if [ -f "${git_dir}/CHERRY_PICK_HEAD" ]; then
  cherry_pick_present="yes"
fi

if [ -d "${git_dir}/rebase-merge" ]; then
  rebase_merge_present="yes"
fi

if [ -d "${git_dir}/rebase-apply" ]; then
  rebase_apply_present="yes"
fi

echo "=== repository ==="
echo "root: ${repo_root}"
echo "branch: ${branch_name:-DETACHED_HEAD}"

echo
echo "=== git state ==="
echo "merge_head: ${merge_head_present}"
echo "cherry_pick_head: ${cherry_pick_present}"
echo "rebase_merge: ${rebase_merge_present}"
echo "rebase_apply: ${rebase_apply_present}"

echo
echo "=== conflicted files ==="
git diff --name-only --diff-filter=U || true

echo
echo "=== status short ==="
git status --short

echo
echo "=== diff stat (unstaged) ==="
git diff --stat

echo
echo "=== diff stat (staged) ==="
git diff --cached --stat

echo
echo "=== untracked files ==="
git ls-files --others --exclude-standard

echo
echo "=== changed files (unstaged) ==="
git diff --name-only

echo
echo "=== changed files (staged) ==="
git diff --cached --name-only
