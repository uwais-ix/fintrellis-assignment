#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

java_major() {
  "$1/bin/java" -version 2>&1 | sed -n 's/.*version "\([0-9]*\).*/\1/p' | head -n 1
}

supported_java() {
  [[ "$(java_major "$1")" == "25" ]]
}

resolve_java_home() {
  local candidate
  if [[ -n "${JAVA25_HOME:-}" ]] && supported_java "$JAVA25_HOME"; then
    printf '%s\n' "$JAVA25_HOME"
    return 0
  fi
  if [[ -n "${JAVA_HOME:-}" ]] && supported_java "$JAVA_HOME"; then
    printf '%s\n' "$JAVA_HOME"
    return 0
  fi
  for candidate in /usr/lib/jvm/*25* /opt/java/*25*; do
    if [[ -x "$candidate/bin/java" ]] && supported_java "$candidate"; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done
  return 1
}

if ! java_home="$(resolve_java_home)"; then
  echo "A JDK 25 is required to match the project build. Set JAVA25_HOME to its location." >&2
  exit 1
fi
export JAVA_HOME="$java_home"

echo "==> Installing JavaScript dependencies"
pnpm install --frozen-lockfile

echo "==> Verifying the backend"
(cd backend && ./mvnw -B -q verify)

echo "==> Checking the frontend"
pnpm lint
pnpm typecheck
pnpm test
pnpm build

echo "==> Checking generated API types"
pnpm --filter frontend api:generate
git diff --exit-code -- frontend/src/lib/api/schema.d.ts

echo "==> Checking API version alignment"
grep -q 'url: /api/v1' contracts/openapi.yaml
grep -q 'String V1 = "/api/v1"' backend/src/main/java/mu/uwais/fintrellis/web/ApiPaths.java
grep -q '^VITE_API_BASE_URL=/api/v1' frontend/.env.example

echo "==> Validating the Compose file"
docker compose config --quiet

echo "All checks passed."
