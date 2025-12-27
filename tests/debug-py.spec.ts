import { test, expect } from "@playwright/test";

test.describe("Python Bridge Debug", () => {
  test("can call Python /hi endpoint", async ({ page }) => {
    await page.goto("/debug/py");

    await expect(page.getByRole("heading", { name: "Python Bridge Debug" })).toBeVisible();

    // Call the /hi endpoint
    await page.getByRole("button", { name: "Call /hi" }).click();

    // Wait for response to appear
    await expect(page.getByText('"message"')).toBeVisible();
  });

  test("can call Python /greet endpoint", async ({ page }) => {
    await page.goto("/debug/py");

    // Fill in the form
    await page.getByLabel("First Name").fill("Alice");
    await page.getByLabel("Last Name").fill("Smith");

    // Call the /greet endpoint
    await page.getByRole("button", { name: "Call /greet" }).click();

    // Wait for greeting response
    await expect(page.getByText("Alice")).toBeVisible();
    await expect(page.getByText("Smith")).toBeVisible();
  });
});
