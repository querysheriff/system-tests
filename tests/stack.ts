import { execFile } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

export const root = fileURLToPath(new URL('..', import.meta.url));
export const runDir = join(root, '.run');
export const adminState = join(runDir, 'admin.json');
export const collectorConfig = join(runDir, 'collector.yml');

export const baseURL = 'http://localhost:18080';
export const serverName = 'system-test';
export const admin = { email: 'admin@example.com', password: 'system-test-password' };

const run = promisify(execFile);

export async function compose(...args: string[]): Promise<string> {
	const { stdout } = await run('docker', ['compose', '--profile', 'collector', ...args], {
		cwd: root,
		maxBuffer: 64 * 1024 * 1024
	});
	return stdout;
}

export function sql(database: string, query: string): Promise<string> {
	return compose(
		'exec',
		'-T',
		'monitored-postgres',
		'psql',
		'-U',
		'postgres',
		'-d',
		database,
		'-v',
		'ON_ERROR_STOP=1',
		'-c',
		query
	);
}
