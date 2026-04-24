#!/bin/bash
set -euo pipefail

APP_DIR="${APP_DIR:-/app}"
APP_FILE="$APP_DIR/index.html"
IMAGE_DIR="$APP_DIR/images"
IMAGE_FILE="$IMAGE_DIR/trail-card.jpg"

mkdir -p "$IMAGE_DIR"

if [ ! -f "$IMAGE_FILE" ]; then
  printf "placeholder image for the trail card fallback\n" > "$IMAGE_FILE"
fi

# Inspect the existing placeholder before replacing it.
grep -n "placeholder\|Build the Misty Ridge Loop trail card here" "$APP_FILE" || true

python3 - <<'PY'
import os
from pathlib import Path

app_file = Path(os.environ.get("APP_DIR", "/app")) / "index.html"
original = app_file.read_text(encoding="utf-8")

trail = {
    "name": "Misty Ridge Loop",
    "id": "misty-ridge-loop",
    "region": "North Cascades",
    "rating": "4.7",
    "location": "Cascade Pass Trailhead, Marblemount, Washington",
    "distance": "12.4 km",
    "ascent": "540 m",
    "time": "3h 20m",
    "difficulty": "Moderate",
    "terrain": "forest ridge",
    "reason": "Best after early morning fog lifts",
    "image": "images/trail-card.jpg",
}

title = f"{trail['name']} Trail Card"
href = f"/trails/{trail['id']}"

html = f"""<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <style>
      :root {{
        --ink: #1d2a22;
        --muted: #66756d;
        --leaf: #2f6f4f;
        --leaf-dark: #184632;
        --gold: #f5b932;
        --mist: #eef5ee;
        --surface: rgba(255, 255, 248, 0.96);
      }}

      * {{
        box-sizing: border-box;
      }}

      body {{
        min-height: 100vh;
        margin: 0;
        display: grid;
        place-items: center;
        padding: 32px 18px;
        background:
          radial-gradient(circle at 20% 10%, rgba(184, 213, 177, 0.8), transparent 28rem),
          linear-gradient(140deg, #f6f0e5 0%, #dceadd 52%, #b7cdbb 100%);
        color: var(--ink);
        font-family: "Trebuchet MS", "Avenir Next", sans-serif;
      }}

      main {{
        width: 100%;
        display: grid;
        place-items: center;
      }}

      .trail-card {{
        width: min(92vw, 390px);
        display: block;
        overflow: hidden;
        border-radius: 28px;
        background: var(--surface);
        color: inherit;
        text-decoration: none;
        box-shadow: 0 18px 40px rgba(46, 65, 48, 0.2);
        transition: transform 220ms ease, box-shadow 220ms ease;
      }}

      .trail-card:hover,
      .trail-card:focus-visible {{
        transform: translateY(-8px);
        box-shadow: 0 28px 58px rgba(37, 58, 42, 0.32);
      }}

      .media {{
        position: relative;
        height: 235px;
        overflow: hidden;
        background:
          linear-gradient(135deg, rgba(26, 70, 51, 0.82), rgba(149, 179, 152, 0.35)),
          var(--mist);
      }}

      .media img {{
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 450ms ease;
      }}

      .trail-card:hover .media img,
      .trail-card:focus-visible .media img {{
        transform: scale(1.07);
      }}

      .badge {{
        position: absolute;
        top: 16px;
        z-index: 1;
        border-radius: 999px;
        backdrop-filter: blur(10px);
        font-weight: 700;
      }}

      .region {{
        left: 16px;
        background: rgba(255, 255, 255, 0.78);
        padding: 8px 13px;
      }}

      .rating {{
        right: 16px;
        display: inline-flex;
        gap: 5px;
        align-items: center;
        background: rgba(29, 42, 34, 0.76);
        color: #fff8e6;
        padding: 8px 12px;
      }}

      .star {{
        color: var(--gold);
      }}

      .reason {{
        position: absolute;
        inset-inline: 0;
        bottom: 0;
        padding: 44px 18px 16px;
        color: #fff;
        font-size: 0.92rem;
        font-weight: 700;
        background: linear-gradient(0deg, rgba(13, 28, 21, 0.82), rgba(13, 28, 21, 0));
      }}

      .content {{
        padding: 22px;
      }}

      h1 {{
        margin: 0 0 8px;
        font-size: 1.55rem;
        line-height: 1.1;
      }}

      .location {{
        margin: 0;
        max-width: 100%;
        color: var(--muted);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }}

      .stats {{
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin: 20px 0;
      }}

      .stat {{
        min-width: 0;
        border-radius: 16px;
        background: #eef5ee;
        padding: 11px 8px;
        text-align: center;
        font-weight: 800;
      }}

      .stat span {{
        display: block;
        margin-bottom: 2px;
        color: var(--muted);
        font-size: 0.74rem;
        font-weight: 700;
      }}

      .footer {{
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        padding-top: 18px;
        border-top: 1px solid #d9e3d7;
      }}

      .difficulty-label,
      .terrain-label {{
        display: block;
        color: var(--muted);
        font-size: 0.72rem;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }}

      .meter {{
        display: inline-grid;
        grid-template-columns: repeat(5, 18px);
        gap: 4px;
        margin-top: 7px;
      }}

      .meter span {{
        height: 7px;
        border-radius: 999px;
        background: #cddbcf;
      }}

      .meter span:nth-child(-n + 3) {{
        background: var(--leaf);
      }}

      .terrain {{
        margin: 4px 0 0;
        color: var(--leaf-dark);
        font-weight: 800;
        text-align: right;
      }}

      @media (max-width: 480px) {{
        body {{
          padding: 18px 12px;
        }}

        .trail-card {{
          width: min(100%, 390px);
          border-radius: 24px;
        }}

        .content {{
          padding: 18px;
        }}

        .stats {{
          gap: 8px;
        }}

        .footer {{
          gap: 14px;
        }}
      }}
    </style>
  </head>
  <body>
    <main id="root">
      <a class="trail-card" data-testid="trail-card" href="{href}" aria-label="{trail['name']} trail details">
        <section class="media" aria-label="Trail photo">
          <img src="{trail['image']}" alt="{trail['name']} trail" onerror="this.style.display='none';" />
          <span class="badge region">{trail['region']}</span>
          <span class="badge rating"><span class="star">&#9733;</span> {trail['rating']}</span>
          <div class="reason">{trail['reason']}</div>
        </section>

        <section class="content">
          <h1>{trail['name']}</h1>
          <p class="location">{trail['location']}</p>

          <div class="stats" aria-label="Trail stats">
            <div class="stat" aria-label="Trail distance"><span>Distance</span>{trail['distance']}</div>
            <div class="stat" aria-label="Elevation gain"><span>Ascent</span>{trail['ascent']}</div>
            <div class="stat" aria-label="Estimated hiking time"><span>Time</span>{trail['time']}</div>
          </div>

          <footer class="footer">
            <div>
              <span class="difficulty-label">Difficulty: {trail['difficulty']}</span>
              <div
                class="meter"
                role="meter"
                aria-label="Difficulty"
                aria-valuemin="1"
                aria-valuemax="5"
                aria-valuenow="3"
                aria-valuetext="{trail['difficulty']}"
              >
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>

            <div>
              <span class="terrain-label">Terrain</span>
              <p class="terrain">{trail['terrain']}</p>
            </div>
          </footer>
        </section>
      </a>
    </main>
  </body>
</html>
"""

if "Build the Misty Ridge Loop trail card here." not in original:
    raise SystemExit("Unexpected starting HTML in /app/index.html")

app_file.write_text(html, encoding="utf-8")
PY

# Verify the file contents after writing so the oracle leaves a real check in the trace.
grep -q "Misty Ridge Loop" "$APP_FILE"
grep -q "/trails/misty-ridge-loop" "$APP_FILE"
grep -q "Best after early morning fog lifts" "$APP_FILE"
grep -q "linear-gradient" "$APP_FILE"
grep -q 'role="meter"' "$APP_FILE"

# Read back a few lines for trace visibility.
sed -n '1,80p' "$APP_FILE"
