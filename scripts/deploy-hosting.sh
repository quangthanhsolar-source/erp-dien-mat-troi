#!/usr/bin/env bash
# Deploy Firebase Hosting to production (app.quangthanhsolar.com)
set -euo pipefail

if [[ -z "${FIREBASE_TOKEN:-}" ]]; then
  echo "Missing FIREBASE_TOKEN."
  exit 1
fi

npx --yes firebase-tools deploy --only hosting --project quang-thanh-solar-erp --non-interactive --token "$FIREBASE_TOKEN"
echo "Deploy complete → https://app.quangthanhsolar.com"
