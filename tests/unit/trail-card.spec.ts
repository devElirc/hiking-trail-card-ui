import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getByRole, getByText, queryByText } from "@testing-library/dom";

/**
 * Harbor mounts the agent artifact at `/app/index.html`. Vitest runs from `/tests`, so going
 * `../..` from `tests/unit` resolves to `/` — not the repo root — and breaks `environment/app/`.
 * Prefer `APP_DIR`, then `/app`, then a repo-relative path for local checkout runs.
 */
function getAppHtmlPath(): string {
  if (process.env.APP_DIR) {
    return path.join(process.env.APP_DIR, "index.html");
  }

  const harborApp = "/app/index.html";
  if (fs.existsSync(harborApp)) {
    return harborApp;
  }

  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
  return path.join(repoRoot, "environment", "app", "index.html");
}

function readHtml() {
  const appHtmlPath = getAppHtmlPath();
  if (!fs.existsSync(appHtmlPath)) {
    throw new Error(`Missing ${appHtmlPath}`);
  }

  return fs.readFileSync(appHtmlPath, "utf8");
}

function loadDocument() {
  document.documentElement.innerHTML = readHtml();
  return document;
}

describe("hiking trail card markup contract", () => {
  /**
   * Contract: the page should render the requested Misty Ridge Loop content and route target.
   */
  it("includes the requested trail data and detail route", () => {
    const doc = loadDocument();
    const link = getByRole(doc.body, "link", { name: /misty ridge loop/i });

    expect((link as Element).getAttribute("href")).toBe("/trails/misty-ridge-loop");
    expect(getByRole(link as HTMLElement, "heading", { name: "Misty Ridge Loop" })).toBeTruthy();

    expect(getByText(link as HTMLElement, "North Cascades")).toBeTruthy();
    expect(getByText(link as HTMLElement, "4.7")).toBeTruthy();
    expect(getByText(link as HTMLElement, "Cascade Pass Trailhead, Marblemount, Washington")).toBeTruthy();
    expect(getByText(link as HTMLElement, "12.4 km")).toBeTruthy();
    expect(getByText(link as HTMLElement, "540 m")).toBeTruthy();
    expect(getByText(link as HTMLElement, "3h 20m")).toBeTruthy();
    expect(getByText(link as HTMLElement, "Moderate")).toBeTruthy();
    expect(queryByText(link as HTMLElement, /forest ridge/i)).toBeTruthy();
    expect(getByText(link as HTMLElement, "Best after early morning fog lifts")).toBeTruthy();
  });

  /**
   * Contract: the card should expose stable accessible text and labels for the UI verifier.
   */
  it("includes accessible image, stat, and difficulty labels", () => {
    const doc = loadDocument();
    const link = getByRole(doc.body, "link", { name: /misty ridge loop/i }) as HTMLElement;

    const image = link.querySelector('img[src$="images/trail-card.jpg"]');
    expect(image).toBeTruthy();
    expect(image?.getAttribute("alt")?.trim().length).toBeGreaterThan(0);

    expect(queryByText(link, /(Distance|Length)/i)).toBeTruthy();
    expect(queryByText(link, /Ascent/i)).toBeTruthy();
    expect(queryByText(link, /Time/i)).toBeTruthy();
    const difficultyHook =
      link.querySelector('[role="meter"]') ??
      link.querySelector('[aria-label*="Difficulty" i]') ??
      queryByText(link, /Difficulty/i);
    expect(difficultyHook).toBeTruthy();
    expect(queryByText(link, /Moderate/i)).toBeTruthy();
  });

  /**
   * Contract: the image should fail gracefully so the card still has a complete media area.
   */
  it("includes an explicit image-failure fallback hook", () => {
    const html = readHtml();

    expect(html).toMatch(/onerror\s*=\s*["'][^"']+["']/i);
  });

  /**
   * Contract: the reason note at the bottom of the image sits on an overlay that uses linear-gradient
   * (on the note element or an ancestor wrapper), not only on unrelated page chrome.
   */
  it("applies a linear-gradient to the reason note overlay area", () => {
    const doc = loadDocument();
    const link = getByRole(doc.body, "link", { name: /misty ridge loop/i }) as HTMLElement;
    const reason = getByText(link, /Best after early morning fog lifts/);

    let current: Element | null = reason;
    let foundGradient = false;

    while (current && link.contains(current)) {
      const styles = getComputedStyle(current);
      const bgImage = styles.backgroundImage;
      const bg = styles.background;

      if (
        (bgImage && bgImage.includes("linear-gradient")) ||
        (bg && bg.includes("linear-gradient"))
      ) {
        foundGradient = true;
        break;
      }

      current = current.parentElement;
    }

    expect(foundGradient).toBe(true);
  });

  /**
   * Contract: the interaction styling should include hover lift, stronger shadow, and image zoom.
   */
  it("includes hover lift and image zoom styling", () => {
    const html = readHtml();

    expect(html).toMatch(/transition\s*:[^;]*(transform|box-shadow)/);
    expect(html).toMatch(/:hover[\s\S]*translateY\(/);
    expect(html).toMatch(/:hover[\s\S]*box-shadow/);
    expect(html).toMatch(/:hover[\s\S]*scale\(/);
  });

});
