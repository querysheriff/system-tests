import { expect, test } from '@playwright/test';
import { serverName, sql } from './stack';

const slowQuery = 'SELECT count(*) FROM orders, pg_sleep(1.2)';
const normalizedSlowQuery = 'SELECT count(*) FROM orders, pg_sleep($1)';
const slowRun = /^1\.\d{1,2}s$/;
const waitForCollector = { timeout: 4 * 60_000, intervals: [5_000] };

test('a slow query run on the monitored server shows on the Queries screen', async ({ page }) => {
	const queryLink = page.getByRole('link', { name: normalizedSlowQuery }).first();

	// Run it on every attempt, since the collector only counts calls made after its first collection.
	await expect(async () => {
		await sql('shop', slowQuery);
		await page.goto(`/queries?server=${serverName}&db=shop`);
		await expect(queryLink).toBeVisible({ timeout: 5_000 });
	}).toPass(waitForCollector);

	const row = page.getByRole('row').filter({ has: queryLink });
	await expect(row.getByRole('cell', { name: slowRun })).toBeVisible();

	await queryLink.click();
	await expect(page).toHaveURL(/\/queries\/\d+/);
	await expect(page.getByRole('cell', { name: slowRun }).first()).toBeVisible();
});

test('a slow query run on the monitored server shows on the Logs screen', async ({ page }) => {
	const event = page
		.getByRole('button', { name: /1\.\d{1,2}s · SELECT count\(\*\) FROM orders, pg_sleep\(1\.2\)/ })
		.first();

	// Run it on every attempt, since the collector only ships log lines written after it started.
	await expect(async () => {
		await sql('shop', slowQuery);
		await page.goto(`/logs?server=${serverName}`);
		await expect(event).toBeVisible({ timeout: 5_000 });
	}).toPass(waitForCollector);

	await expect(event).toContainText('shop');
	await expect(event).toContainText('postgres');
});
