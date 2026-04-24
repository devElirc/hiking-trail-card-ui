import { expect, test } from "@playwright/test";

/**
 * Verify the card link, trail copy, stats values, difficulty/terrain text, and note are all present inside the outer link.
 */
test("renders the Misty Ridge Loop trail card content and link target", async ({ page }) => {
  await page.goto("/");

  const card = page.getByRole("link", { name: /misty ridge loop/i });
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute("href", "/trails/misty-ridge-loop");

  await expect(card.getByRole("heading", { name: "Misty Ridge Loop" })).toBeVisible();
  await expect(card.getByText(/North Cascades/).first()).toBeVisible();
  await expect(card.getByText("4.7").first()).toBeVisible();
  await expect(card.getByText("Cascade Pass Trailhead, Marblemount, Washington")).toBeVisible();
  await expect(card.getByText("12.4 km").first()).toBeVisible();
  await expect(card.getByText("540 m").first()).toBeVisible();
  await expect(card.getByText("3h 20m").first()).toBeVisible();
  await expect(card.getByText("Moderate").first()).toBeVisible();
  await expect(card.getByText(/forest ridge/i).first()).toBeVisible();
  await expect(card.getByText(/Best after early morning fog lifts/i)).toBeVisible();
});

/**
 * Verify Distance/Ascent/Time labels appear next to their numeric values inside the card (pairs up labels with 12.4 km, 540 m, 3h 20m).
 */
test("renders stats row labels paired with distance ascent and time values", async ({ page }) => {
  await page.goto("/");

  const card = page.getByRole("link", { name: /misty ridge loop/i });

  await expect(card.getByText(/Distance|Length/i).first()).toBeVisible();
  await expect(card.getByText("12.4 km").first()).toBeVisible();
  await expect(card.getByText(/Ascent/i).first()).toBeVisible();
  await expect(card.getByText("540 m").first()).toBeVisible();
  await expect(card.getByText(/Time/i).first()).toBeVisible();
  await expect(card.getByText("3h 20m").first()).toBeVisible();
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

  await expect(card.getByText(/North Cascades/).first()).toBeVisible();
  await expect(card.getByText("4.7").first()).toBeVisible();
  await expect(card.getByText(/Best after early morning fog lifts/i)).toBeVisible();
  await expect(card.getByText(/Distance|Length/i).first()).toBeVisible();
  await expect(card.getByText(/Ascent/i).first()).toBeVisible();
  await expect(card.getByText(/Time/i).first()).toBeVisible();
});

/**
 * Verify the region and rating badges actually overlay the image area (not just appear somewhere on the page).
 */
test("renders region and rating badges over the image", async ({ page }) => {
  await page.goto("/");

  const card = page.getByRole("link", { name: /misty ridge loop/i });
  const image = card.locator('img[src$="images/trail-card.jpg"]');
  const region = card.getByText(/North Cascades/).first();
  const rating = card.getByText("4.7").first();

  await expect(region).toBeVisible();
  await expect(rating).toBeVisible();

  const [imageBox, regionBox, ratingBox] = await Promise.all([
    image.boundingBox(),
    region.boundingBox(),
    rating.boundingBox(),
  ]);

  expect(imageBox, "Image bounding box should be measurable").toBeTruthy();
  expect(regionBox, "Region badge bounding box should be measurable").toBeTruthy();
  expect(ratingBox, "Rating badge bounding box should be measurable").toBeTruthy();

  if (!imageBox || !regionBox || !ratingBox) return;

  const withinX = (box: { x: number; width: number }) =>
    box.x >= imageBox.x && box.x + box.width <= imageBox.x + imageBox.width;
  const withinY = (box: { y: number; height: number }) =>
    box.y >= imageBox.y && box.y + box.height <= imageBox.y + imageBox.height;

  expect(withinX(regionBox) && withinY(regionBox)).toBe(true);
  expect(withinX(ratingBox) && withinY(ratingBox)).toBe(true);
});

/**
 * Verify the location line uses nowrap/hidden/ellipsis in computed styles, and difficulty meter plus Moderate and terrain text are visible inside the card.
 */
test("keeps the location on one line and exposes a difficulty meter", async ({ page }) => {
  await page.goto("/");

  const card = page.getByRole("link", { name: /misty ridge loop/i });
  const location = card.getByText("Cascade Pass Trailhead, Marblemount, Washington").first();
  const hasTruncationStyles = await location.evaluate((element) => {
    let current: Element | null = element;

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

  await expect(card.getByText("Moderate").first()).toBeVisible();
  await expect(card.getByText(/^Difficulty$/i).first()).toBeVisible();
  await expect(
    card
      .locator('[aria-label*="Difficulty" i], [role="meter"], .meter, .difficulty, .difficulty-meter')
      .first(),
  ).toBeVisible();
  await expect(card.getByText(/forest ridge/i).first()).toBeVisible();
});

/**
 * Verify the outer link and image use transform-related transitions and that hover changes box-shadow and transforms (lift + zoom).
 */
test("adds hover lift and image zoom interactions", async ({ page }) => {
  await page.goto("/");

  const card = page.getByRole("link", { name: /misty ridge loop/i });
  const image = card.locator('img[src$="images/trail-card.jpg"]');

  await expect(card).toHaveCSS("transition-property", /box-shadow|transform|all/);
  await expect(image).toHaveCSS("transition-property", /transform|all/);

  const beforeShadow = await card.evaluate((element) => getComputedStyle(element).boxShadow);
  const beforeTransform = await image.evaluate((element) => getComputedStyle(element).transform);
  const beforeCardTransform = await card.evaluate((element) => getComputedStyle(element).transform);
  await card.hover();
  await expect(card).not.toHaveCSS("box-shadow", beforeShadow);
  await expect(image).not.toHaveCSS("transform", beforeTransform);
  const afterCardTransform = await card.evaluate((element) => getComputedStyle(element).transform);
  expect(afterCardTransform).not.toBe(beforeCardTransform);
  expect(afterCardTransform).toMatch(/matrix|translate/i);
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

/**
 * Verify the card link does not wrap nested anchors (invalid / confusing nested links).
 */
test("does not place nested links inside the trail card link", async ({ page }) => {
  await page.goto("/");

  const card = page.getByRole("link", { name: /misty ridge loop/i });
  await expect(card.locator("a")).toHaveCount(0);
});
