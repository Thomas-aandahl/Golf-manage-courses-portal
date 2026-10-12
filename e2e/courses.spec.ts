import { expect, test, type Page } from "@playwright/test";
import { fileURLToPath } from "node:url";

// Every test gets a fresh browser context, so localStorage/IndexedDB start empty and the mock seeds itself.
// Seed order: Pebble Beach and St. Andrews are featured; the rest follow newest first.

const IMAGE = fileURLToPath(new URL("../public/seed/albany.jpg", import.meta.url));

const courseList = (page: Page) => page.getByRole("list", { name: "Courses" });
const courseNames = (page: Page) => courseList(page).getByRole("heading", { level: 2 });
const card = (page: Page, name: string) => courseList(page).getByRole("listitem").filter({ hasText: name });

async function openMenu(page: Page, name: string) {
  await card(page, name).hover();
  await page.getByRole("button", { name: `Actions for ${name}` }).click();
}

test("create a featured course, see it persist, then delete it", async ({ page }) => {
  const name = "Adare Manor";

  await page.goto("/");
  await expect(courseNames(page).first()).toHaveText("Pebble Beach Golf Links");

  // Create
  await page.getByRole("link", { name: "Create a course" }).click();
  await page.getByLabel(/Course name/).fill(name);

  // The preview updates as the user types.
  await expect(page.getByRole("complementary", { name: "Card preview" })).toContainText(name);

  await page.getByLabel(/^Difficulty/).selectOption("4");
  await page.getByLabel(/^Par/).fill("72");
  await page.getByLabel("Featured course").check();
  await page.getByLabel(/^City/).fill("Limerick");
  await page.getByLabel(/^Country/).selectOption("IE");
  await page.locator('input[type="file"]').setInputFiles(IMAGE);
  await expect(page.getByText("albany.jpg")).toBeVisible();
  await page.getByRole("button", { name: "Save" }).click();

  // Back on the list: newly featured goes after the courses that were featured before it.
  await expect(page).toHaveURL("/");
  await expect(courseNames(page).nth(0)).toHaveText("Pebble Beach Golf Links");
  await expect(courseNames(page).nth(1)).toHaveText("St. Andrews");
  await expect(courseNames(page).nth(2)).toHaveText(name);
  await expect(card(page, name)).toContainText("Limerick, IE");

  // The uploaded image survives a reload (stored in IndexedDB, shown via an object URL).
  await page.reload();
  await expect(courseNames(page).nth(2)).toHaveText(name);
  // The image is decorative (alt=""), so it has no img role – query the element.
  await expect(card(page, name).locator("img")).toHaveAttribute("src", /^blob:/);

  // Delete
  await openMenu(page, name);
  await page.getByRole("menuitem", { name: "Delete" }).click();
  const dialog = page.getByRole("dialog", { name: "Delete course" });
  await expect(dialog).toContainText(name);
  await dialog.getByRole("button", { name: "Delete" }).click();

  await expect(card(page, name)).toHaveCount(0);
  await expect(page.getByText(`"${name}" was deleted`)).toBeVisible();
  // Focus lands somewhere sensible instead of being lost with the removed card.
  await expect(page.getByRole("link", { name: "Create a course" })).toBeFocused();
});

test("a failed delete removes the card optimistically, then rolls it back", async ({ page }) => {
  await page.goto("/");
  await expect(courseList(page)).toBeVisible();

  // Make the mock API fail deletes, via the reviewer panel.
  await page.getByText("Mock API").click();
  await page.getByLabel("Fail deleting").check();

  await openMenu(page, "Albany");
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete" }).click();

  // Gone immediately (optimistic)…
  await expect(card(page, "Albany")).toHaveCount(0);
  // …and back once the simulated server error arrives, with an explanation.
  await expect(card(page, "Albany")).toHaveCount(1);
  await expect(page.getByText(`Could not delete "Albany". It has been restored.`)).toBeVisible();
});
