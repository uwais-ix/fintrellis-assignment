#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

if [[ -z "${SONAR_TOKEN:-}" ]]; then
  echo "Set SONAR_TOKEN to a token from http://localhost:9000 before scanning." >&2
  exit 1
fi

if [[ -z "${JAVA_HOME:-}" && -n "${JAVA25_HOME:-}" ]]; then
  export JAVA_HOME="$JAVA25_HOME"
fi

echo "==> Generating backend coverage"
(cd backend && ./mvnw -B -q verify)

echo "==> Generating frontend coverage"
pnpm --filter frontend test:coverage

echo "==> Scanning with SonarQube"
docker run --rm \
  --network fintrellis-journal_default \
  -v "$root:/usr/src" \
  -w /usr/src \
  -e SONAR_TOKEN \
  sonarsource/sonar-scanner-cli \
  -Dsonar.host.url=http://sonarqube:9000 \
  -Dsonar.token="$SONAR_TOKEN"
