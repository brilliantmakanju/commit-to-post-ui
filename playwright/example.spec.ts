// import { test, expect } from '@playwright/test';
//
// test('has title', async ({ page }) => {
// 	await page.goto('http://playwright.dev/');
//
// 	// Expect a title "to contain" a substring.
// 	await expect(page).toHaveTitle(/Playwright/);
// });
//
// test('get started link', async ({ page }) => {
// 	await page.goto('http://playwright.dev/');
//
// 	// Click the get started link.
// 	await page.getByRole('link', { name: 'Get started' }).click();
//
// 	// Expects page to have a heading with the name of Installation.
// 	await expect(
// 		page.getByRole('heading', { name: 'Installation' }),
// 	).toBeVisible();
// });

// import { expect, test } from "@playwright/test";
//
// test("should upload a file and log its name", async ({ page }) => {
// 	// Navigate to the page
// 	await page.goto("http://localhost:3000");
//
// 	// Upload a file
// 	const filePath = "./public/Anime-Girl4.png";
// 	const fileUploadInput = await page.locator("#file-upload");
// 	await fileUploadInput.setInputFiles(filePath);
//
// 	// Validate the file name is displayed in the UI
// 	const uploadedText = await page.locator(
// 		"text=Uploaded file: Anime-Girl4.png",
// 	);
// 	await expect(uploadedText).toBeVisible();
//
// 	// Validate that the image preview is displayed
// 	const previewImage = await page.locator('img[alt="Uploaded preview"]');
// 	await expect(previewImage).toBeVisible();
//
// 	// Check for console log
// 	page.on("console", message => {
// 		if (
// 			message.type() === "log" &&
// 			message.text().includes("Uploaded file: sample-file.txt")
// 		) {
// 		}
// 	});
// });
