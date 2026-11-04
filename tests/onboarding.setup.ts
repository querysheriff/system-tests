import { expect, test as setup } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { admin, adminState, collectorConfig, compose, serverName } from './stack';

setup('the first user signs in as admin and connects a collector with a new token', async ({ page }) => {
	await page.goto('/login');
	await page.getByLabel('Email').fill(admin.email);
	await page.getByLabel('Password').fill(admin.password);
	await page.getByRole('button', { name: 'Sign in' }).click();
	await expect(page).toHaveURL(/\/queries/);

	await page.goto('/admin/collectors');
	await page.getByRole('button', { name: 'New Token' }).click();
	await page.getByLabel('Server').fill(serverName);
	await page.getByRole('button', { name: 'Create Token' }).click();
	const token = await page.getByText(/^qsc_/).innerText();

	await writeFile(
		collectorConfig,
		`backend:
  url: http://backend:3000/api
  token: ${JSON.stringify(token)}
postgres: postgresql://querysheriff_collector:querysheriff_collector@monitored-postgres:5432/postgres
logs:
  path: /var/lib/postgresql/data/log
`
	);
	await compose('up', '--detach', 'collector');

	await page.context().storageState({ path: adminState });
});
