import { expect, test } from "@playwright/test";

/**
 * Verify the card exposes the requested trail fields and makes the entire card a link.
 */
test("renders the Misty Ridge Loop trail card content and link target", async ({ page }) => {
  await page.goto("/");

  const card = page.getByRole("link", { name: /misty ridge loop/i });
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute("href", "/trails/misty-ridge-loop");

  await expect(card.getByRole("heading", { name: "Misty Ridge Loop" })).toBeVisible();
  await expect(card.getByText("North Cascades")).toBeVisible();
  await expect(card.getByText("4.7")).toBeVisible();
  await expect(card.getByText("Cascade Pass Trailhead, Marblemount, Washington")).toBeVisible();
  await expect(card.getByText("12.4 km").first()).toBeVisible();
  await expect(card.getByText("540 m").first()).toBeVisible();
  await expect(card.getByText("3h 20m").first()).toBeVisible();
  await expect(card.getByText("Moderate")).toBeVisible();
  await expect(card.getByText(/forest ridge/i).first()).toBeVisible();
  await expect(card.getByText("Best after early morning fog lifts")).toBeVisible();
});

/**
 * Verify the image, region/rating overlays, reason overlay, and stat labels are present.
 */
test("uses the trail image with readable overlays and accessible labels", async ({ page }) => {
  await page.goto("/");

  const card = page.getByRole("link", { name: /misty ridge loop/i });
  const image = card.locator('img[src$="images/trail-card.jpg"]');
  await expect(image).toHaveAttribute("src", /images\/trail-card\.jpg$/);
  await expect(image).toHaveAttribute("alt", /.+/);

  await expect(card.getByText("North Cascades")).toBeVisible();
  await expect(card.getByText("4.7")).toBeVisible();
  await expect(card.getByText("Best after early morning fog lifts")).toBeVisible();
  await expect(card.getByText(/Distance|Length/i).first()).toBeVisible();
  await expect(card.getByText(/Ascent/i).first()).toBeVisible();
  await expect(card.getByText(/Time/i).first()).toBeVisible();
});

/**
 * Verify long location text is clipped cleanly and the difficulty meter is visible.
 */
test("keeps the location on one line and exposes a difficulty meter", async ({ page }) => {
  await page.goto("/");

  const location = page.getByText("Cascade Pass Trailhead, Marblemount, Washington").first();
  const hasTruncationStyles = await location.evaluate((element) => {
    let current = element;

    for (let depth = 0; current && depth < 4; depth += 1) {
      const styles = getComputedStyle(current);
      if (
        styles.whiteSpace === "nowrap" &&
        styles.overflow === "hidden" &&
        styles.textOverflow === "ellipsis"
      ) {
        return true;
      }

      current = current.parentElement;
    }

    return false;
  });

  expect(hasTruncationStyles).toBe(true);

  await expect(page.getByText("Moderate")).toBeVisible();
  await expect(page.locator('[aria-label*="Difficulty" i], [role="meter"], .meter, .difficulty, .difficulty-meter').first()).toBeVisible();
});

/**
 * Verify the card and image have hover transitions rather than a static layout.
 */
test("adds hover lift and image zoom interactions", async ({ page }) => {
  await page.goto("/");

  const card = page.getByRole("link", { name: /misty ridge loop/i });
  const image = card.locator('img[src$="images/trail-card.jpg"]');

  await expect(card).toHaveCSS("transition-property", /box-shadow|transform|all/);
  await expect(image).toHaveCSS("transition-property", /transform|all/);

  const beforeShadow = await card.evaluate((element) => getComputedStyle(element).boxShadow);
  await card.hover();
  await expect(card).not.toHaveCSS("box-shadow", beforeShadow);
});

/**
 * Verify the link card uses a responsive width rather than a desktop-only fixed layout.
 */
test("uses a responsive card width on small screens", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const card = page.getByRole("link", { name: /misty ridge loop/i });
  const width = await card.evaluate((element) => element.getBoundingClientRect().width);

  expect(width).toBeLessThanOrEqual(390);
  expect(width).toBeGreaterThan(280);
});
