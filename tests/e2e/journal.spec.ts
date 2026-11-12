import { expect, type Page, test } from "@playwright/test";

async function signIn(page: Page, username: string, password: string) {
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/realms\/journal/);
  await page.locator("#username").fill(username);
  await page.locator("#password").fill(password);
  await page.locator("#kc-login").click();
  await expect(page.getByRole("button", { name: /Sign out/ })).toBeVisible();
}

test("an administrator creates, edits, and deletes a note", async ({ page }) => {
  const title = `Release notes ${Date.now()}`;
  const revised = `${title} revised`;

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Notes worth keeping." })).toBeVisible();
  await signIn(page, "admin", "admin-local");

  await page.getByRole("link", { name: "Write a note" }).click();
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Content").fill("A short note created by the acceptance test.");
  await page.getByRole("button", { name: "Publish note" }).click();

  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(page.getByText("Note published.")).toBeVisible();

  await page.getByRole("link", { name: "Edit" }).click();
  await page.getByLabel("Title").fill(revised);
  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(page.getByRole("heading", { name: revised })).toBeVisible();
  await expect(page.getByText("Changes saved.")).toBeVisible();

  await page.getByRole("button", { name: "Delete" }).click();
  await page.getByRole("button", { name: "Delete permanently" }).click();

  await expect(page.getByText("Note deleted.")).toBeVisible();
  await expect(page.getByRole("heading", { name: revised })).not.toBeVisible();
});

test("a reader cannot reach the editor", async ({ page }) => {
  await page.goto("/");
  await signIn(page, "reader", "reader-local");

  await expect(page.getByRole("link", { name: "Write a note" })).not.toBeVisible();
  await page.goto("/posts/new");
  await expect(page.getByRole("heading", { name: "Your role cannot do that" })).toBeVisible();
});

test("a signed-out visitor can read but not write", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Notes worth keeping." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Write a note" })).not.toBeVisible();
});
