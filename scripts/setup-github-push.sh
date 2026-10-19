#!/usr/bin/env bash
# Configure git to push to GitHub using GITHUB_TOKEN from the environment.
set -euo pipefail

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo "Missing GITHUB_TOKEN. Add it as a Cursor secret, then re-run."
  exit 1
fi

REPO_URL="https://x-access-token:${GITHUB_TOKEN}@github.com/quangthanhsolar-source/erp-dien-mat-troi.git"
git remote set-url origin "$REPO_URL"

# Verify auth without printing the token
if ! git ls-remote origin HEAD >/dev/null 2>&1; then
  echo "GITHUB_TOKEN cannot access the repo. Check token scopes (need repo) and that it belongs to an account with write access."
  exit 1
fi

echo "GitHub push auth OK."
