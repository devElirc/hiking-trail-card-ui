import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getByRole, within } from "@testing-library/dom";

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
    const link = getByRole(doc.body, "link", { name: /misty ridge loop/i }) as HTMLElement;
    const card = within(link);

    expect(link.getAttribute("href")).toBe("/trails/misty-ridge-loop");
    expect(card.getByRole("heading", { name: "Misty Ridge Loop" })).toBeTruthy();

    expect(card.getByText("North Cascades")).toBeTruthy();
    expect(card.getByText("4.7")).toBeTruthy();
    expect(card.getByText("Cascade Pass Trailhead, Marblemount, Washington")).toBeTruthy();
    expect(card.getByText("12.4 km")).toBeTruthy();
    expect(card.getByText("540 m")).toBeTruthy();
    expect(card.getByText("3h 20m")).toBeTruthy();
    expect(card.getByText("Moderate")).toBeTruthy();
    expect(card.queryByText(/forest ridge/i)).toBeTruthy();
    expect(card.getByText(/Best after early morning fog lifts/i)).toBeTruthy();
  });

  /**
   * Contract: the card should expose stable accessible text and labels for the UI verifier.
   */
  it("includes accessible image, stat, and difficulty labels", () => {
    const doc = loadDocument();
    const link = getByRole(doc.body, "link", { name: /misty ridge loop/i }) as HTMLElement;
    const card = within(link);

    const image = link.querySelector('img[src$="images/trail-card.jpg"]');
    expect(image).toBeTruthy();
    expect(image?.getAttribute("alt")?.trim().length).toBeGreaterThan(0);

    expect(card.queryByText(/(Distance|Length)/i)).toBeTruthy();
    expect(card.queryByText(/Ascent/i)).toBeTruthy();
    expect(card.queryByText(/Time/i)).toBeTruthy();
    const difficultyHook =
      link.querySelector('[role="meter"]') ??
      link.querySelector('[aria-label*="Difficulty" i]') ??
      card.queryByText(/Difficulty/i);
    expect(difficultyHook).toBeTruthy();
    expect(card.queryByText(/Moderate/i)).toBeTruthy();
  });

  /**
   * Contract: the image should fail gracefully so the card still has a complete media area.
   */
  it("includes an explicit image-failure fallback hook", () => {
    const html = readHtml();

    const hasInlineOnError = /onerror\s*=/i.test(html);
    const hasJsErrorListener =
      /addEventListener\s*\(\s*["']error["']/i.test(html) ||
      html.includes("addEventListener('error'") ||
      html.includes('addEventListener("error"');
    expect(hasInlineOnError || hasJsErrorListener).toBe(true);
  });

  /**
   * Contract: the reason note at the bottom of the image sits on an overlay that uses linear-gradient
   * (on the note element or an ancestor wrapper), not only on unrelated page chrome.
   */
  it("applies a linear-gradient to the reason note overlay area", () => {
    const doc = loadDocument();
    const link = getByRole(doc.body, "link", { name: /misty ridge loop/i }) as HTMLElement;
    const reason = within(link).getByText(/Best after early morning fog lifts/i);

    let current: Element | null = reason;
    let foundGradient = false;

    const mentionsGradient = (value: string) => /linear-gradient/i.test(value);

    while (current && link.contains(current)) {
      const styles = getComputedStyle(current);
      const bgImage =
        styles.getPropertyValue("background-image") || styles.backgroundImage || "";
      const bg = styles.getPropertyValue("background") || styles.background || "";

      if (mentionsGradient(bgImage) || mentionsGradient(bg)) {
        foundGradient = true;
        break;
      }

      current = current.parentElement;
    }

    // happy-dom often omits or normalizes `background-image` from `<style>` rules unlike real
    // browsers; Playwright still validates layout. If computed styles miss the gradient, require
    // it in authored `<style>` / inline CSS for this document while the note remains in the card.
    if (!foundGradient) {
      const authoredCss = Array.from(doc.querySelectorAll("style"))
        .map((el) => el.textContent ?? "")
        .join("\n");
      const inlineHints = [link.getAttribute("style") ?? "", (reason as HTMLElement).getAttribute("style") ?? ""].join(
        " ",
      );
      foundGradient =
        mentionsGradient(authoredCss + inlineHints) &&
        Boolean(link.textContent?.includes("Best after early morning fog lifts"));
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
