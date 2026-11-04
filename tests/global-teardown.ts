import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { compose, root } from './stack';

export default async function globalTeardown(): Promise<void> {
	const results = join(root, 'test-results');
	await mkdir(results, { recursive: true });
	await writeFile(join(results, 'compose.log'), await compose('logs', '--no-color', '--timestamps'));
	await compose('down', '--volumes', '--remove-orphans');
}
