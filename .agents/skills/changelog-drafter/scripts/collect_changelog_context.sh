#!/usr/bin/env bash

set -euo pipefail

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "ERROR: not inside a git repository"
  exit 1
fi

repo_root="$(git rev-parse --show-toplevel)"
cd "${repo_root}"

default_range="origin/master..HEAD"
range="${1:-${default_range}}"

if [ "${range}" = "${default_range}" ] && ! git rev-parse --verify origin/master >/dev/null 2>&1; then
  echo "ERROR: origin/master does not exist locally"
  exit 1
fi

if ! git rev-list --count "${range}" >/dev/null 2>&1; then
  echo "ERROR: invalid git range: ${range}"
  exit 1
fi

commit_count="$(git rev-list --count "${range}")"
branch_name="$(git branch --show-current 2>/dev/null || true)"

echo "=== repository ==="
echo "root: ${repo_root}"
echo "branch: ${branch_name:-DETACHED_HEAD}"
echo "range: ${range}"
echo "date: $(date +%F)"

echo
echo "=== git status ==="
git status --short --branch

echo
echo "=== commit count ==="
echo "${commit_count}"

if [ "${commit_count}" = "0" ]; then
  echo
  echo "NO_UNPUBLISHED_COMMITS"
  exit 0
fi

echo
echo "=== commits oldest to newest ==="
git log --reverse --date=short --format='commit %H%nshort %h%ndate %ad%nauthor %an%nsubject %s%nbody%n%b%n---END-COMMIT---' "${range}"

echo
echo "=== diff stat ==="
git diff --stat "${range}"

echo
echo "=== changed files ==="
git diff --name-status "${range}"
