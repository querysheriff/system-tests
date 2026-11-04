import { defineConfig, devices } from '@playwright/test';
import { adminState, baseURL } from './tests/stack';

export default defineConfig({
	testDir: 'tests',
	// Query stats reach the backend only on the collector's second once-a-minute collection.
	timeout: 5 * 60_000,
	fullyParallel: true,
	globalSetup: './tests/global-setup.ts',
	globalTeardown: './tests/global-teardown.ts',
	use: { ...devices['Desktop Chrome'], baseURL, trace: 'retain-on-failure' },
	projects: [
		{ name: 'onboarding', testMatch: 'onboarding.setup.ts' },
		{ name: 'system', testMatch: '*.e2e.ts', dependencies: ['onboarding'], use: { storageState: adminState } }
	]
});
