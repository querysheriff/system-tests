import { mkdir } from 'node:fs/promises';
import globalTeardown from './global-teardown';
import { compose, runDir } from './stack';

export default async function globalSetup(): Promise<void> {
	await compose('down', '--volumes', '--remove-orphans');
	await mkdir(runDir, { recursive: true });
	try {
		await compose('up', '--detach', '--wait', 'proxy', 'monitored-postgres');
	} catch (error) {
		// Playwright skips global teardown when setup fails, so save the logs and stop the stack here.
		await globalTeardown();
		throw error;
	}
}
