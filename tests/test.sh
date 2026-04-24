#!/bin/bash
set -euo pipefail

TEST_DIR="${TEST_DIR:-/tests}"
APP_DIR="${APP_DIR:-/app}"
APP_FILE="$APP_DIR/index.html"
PACKAGE_MANIFEST="$TEST_DIR/package.json"
PACKAGE_LOCK="$TEST_DIR/package-lock.json"

export PLAYWRIGHT_BROWSERS_PATH="${PLAYWRIGHT_BROWSERS_PATH:-/ms-playwright}"

mkdir -p /logs/verifier

TEST_EXIT=0

require_in_file() {
  local pattern="$1"
  local description="$2"

  if ! grep -Eq "$pattern" "$APP_FILE"; then
    echo "Verifier check failed: $description" >&2
    TEST_EXIT=1
  fi
}

# Check if we're in a valid working directory
if [ "$PWD" = "/" ]; then
  echo "Error: No working directory set." >&2
  TEST_EXIT=1
fi

if [ ! -f "$APP_FILE" ]; then
  echo "Error: $APP_FILE not found." >&2
  TEST_EXIT=1
else
  # String/CSS greps below mirror instruction.md and catch obvious omissions fast.
  # Behavioral coverage (nested links, badge geometry, truncation computed styles, hover diffs, responsive width)
  # lives in tests/unit/trail-card.spec.ts and tests/e2e/trail-card.spec.ts (run via npm after this block).
  require_in_file "Misty Ridge Loop" "trail name is missing"
  require_in_file "/trails/misty-ridge-loop" "card link target is missing"
  require_in_file "North Cascades" "region text is missing"
  require_in_file "4\\.7" "rating is missing"
  require_in_file "12\\.4 km" "distance stat is missing"
  require_in_file "540 m" "ascent stat is missing"
  require_in_file "3h 20m" "time stat is missing"
  require_in_file "Moderate" "difficulty text is missing"
  if ! grep -Eiq "forest ridge" "$APP_FILE"; then
    echo "Verifier check failed: terrain text (forest ridge) is missing" >&2
    TEST_EXIT=1
  fi
  require_in_file "Best after early morning fog lifts" "reason text is missing"
  require_in_file "images/trail-card.jpg" "trail image path is missing"
  require_in_file "linear-gradient" "gradient styling is missing"
  if ! grep -Eqi "onerror" "$APP_FILE" \
    && ! grep -Fq "addEventListener('error'" "$APP_FILE" \
    && ! grep -Fq 'addEventListener("error"' "$APP_FILE"; then
    echo "Verifier check failed: image failure hook is missing (use onerror on the trail <img> or addEventListener('error' / \"error\" on that image)" >&2
    TEST_EXIT=1
  fi
  require_in_file "text-overflow[[:space:]]*:[[:space:]]*ellipsis" "location truncation is missing text-overflow ellipsis"
  require_in_file "white-space[[:space:]]*:[[:space:]]*nowrap" "location truncation is missing white-space nowrap"
  require_in_file "overflow[[:space:]]*:[[:space:]]*hidden" "location truncation is missing overflow hidden"
  if ! grep -Eq 'role="meter"' "$APP_FILE" && ! grep -Eq 'aria-label="[^"]*[Dd]ifficulty[^"]*"' "$APP_FILE"; then
    echo "Verifier check failed: difficulty meter must use role=\"meter\" or an aria-label containing Difficulty" >&2
    TEST_EXIT=1
  fi
  if ! grep -Fq 'translateY(' "$APP_FILE" && ! grep -Fq 'translate3d(' "$APP_FILE"; then
    echo "Verifier check failed: hover lift needs a vertical CSS translation (translateY or translate3d)" >&2
    TEST_EXIT=1
  fi
  require_in_file "box-shadow" "hover shadow styling is missing"
  if ! grep -Fq 'scale(' "$APP_FILE"; then
    echo "Verifier check failed: image zoom (scale) on hover is missing" >&2
    TEST_EXIT=1
  fi

  cd "$TEST_DIR" || TEST_EXIT=1

  if [ ! -f "$PACKAGE_MANIFEST" ] || [ ! -f "$PACKAGE_LOCK" ]; then
    echo "Error: pinned test dependencies are missing from $TEST_DIR." >&2
    TEST_EXIT=1
  fi

  echo "Installing verifier dependencies..."
  npm ci --no-fund --no-audit || TEST_EXIT=$?
fi

set +e
if [ "$TEST_EXIT" -eq 0 ]; then
  echo "Running unit tests..."
  npm run test:unit
  UNIT_EXIT=$?

  if [ "$UNIT_EXIT" -eq 0 ]; then
    echo "Running end-to-end tests..."
    npm run test:e2e
    TEST_EXIT=$?
  else
    TEST_EXIT=$UNIT_EXIT
  fi
else
  TEST_EXIT=1
fi

if [ "$TEST_EXIT" -eq 0 ]; then
  :
else
  false
fi

if [ $? -eq 0 ]; then
  echo 1 > /logs/verifier/reward.txt
else
  echo 0 > /logs/verifier/reward.txt
fi