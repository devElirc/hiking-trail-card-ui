#!/bin/bash
set -euo pipefail

SCRIPT_PATH="${BASH_SOURCE[0]:-$0}"
TEST_DIR="${TEST_DIR:-$(cd "$(dirname "$SCRIPT_PATH")" && pwd)}"
APP_DIR="${APP_DIR:-/app}"
APP_FILE="$APP_DIR/index.html"

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
  # Quick shell-level contract checks so the verifier is not just "file exists".
  require_in_file "Misty Ridge Loop" "trail name is missing"
  require_in_file "/trails/misty-ridge-loop" "card link target is missing"
  require_in_file "North Cascades" "region text is missing"
  require_in_file "Best after early morning fog lifts" "reason text is missing"
  require_in_file "images/trail-card.jpg" "trail image path is missing"
  require_in_file "text-overflow[[:space:]]*:[[:space:]]*ellipsis" "location truncation is missing text-overflow ellipsis"
  require_in_file "white-space[[:space:]]*:[[:space:]]*nowrap" "location truncation is missing white-space nowrap"
  require_in_file "linear-gradient" "gradient styling is missing"
  require_in_file 'role="meter"|aria-label="Difficulty"|class="[^"]*(meter|difficulty|difficulty-meter)[^"]*"' "difficulty meter element is missing"

  cd "$TEST_DIR" || TEST_EXIT=1

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
