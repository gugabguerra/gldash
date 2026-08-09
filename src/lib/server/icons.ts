import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);

/**
 * Resolves the installed `simple-icons` package directory at runtime.
 *
 * Resolution order:
 * 1. Module resolution from this file's location (`createRequire(import.meta.url)`),
 *    which walks up `node_modules` from the running bundle — independent of the
 *    process working directory.
 * 2. `process.cwd()/node_modules/simple-icons` — used when launching from the
 *    project root (e.g. the Docker container with `WORKDIR /app`).
 *
 * Returns `null` when the package is not installed.
 */
export function getSimpleIconsDir(): string | null {
	try {
		const main = require.resolve('simple-icons');
		const dir = path.dirname(main);
		if (existsSync(path.join(dir, 'icons'))) return dir;
	} catch {
		// simple-icons not installed in the current environment; fall through.
	}

	const cwdDir = path.join(process.cwd(), 'node_modules', 'simple-icons');
	if (existsSync(path.join(cwdDir, 'icons'))) return cwdDir;

	return null;
}