import { describe, expect, it } from "vitest";
import fs from "node:fs";
import { getByRole, getByText, queryByText } from "@testing-library/dom";

const appHtmlPath = `${process.env.APP_DIR || "/app"}/index.html`;

function readHtml() {
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

    expect(link).toHaveAttribute("href", "/trails/misty-ridge-loop");
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
    expect(queryByText(link, /Difficulty/i)).toBeTruthy();
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
   * Contract: the reason overlay should use a gradient background, as required by the task.
   */
  it("applies a gradient background to the reason overlay", () => {
    const html = readHtml();

    expect(html).toMatch(/\.[A-Za-z0-9_-]*reason[A-Za-z0-9_-]*[^{]*\{[^}]*background[^:]*:[^;]*gradient/is);
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
