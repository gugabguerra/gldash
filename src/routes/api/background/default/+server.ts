import { json, type RequestHandler } from '@sveltejs/kit';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { getConfigPath } from '$lib/server/yaml';
import { mimeForExtension } from '$lib/server/background';

/**
 * GET /api/background/default
 *
 * Serves the default background image. A file next to `config.yaml` overrides
 * the bundled image, so Docker config mounts can customize it without a rebuild.
 */
export const GET: RequestHandler = async () => {
	const configuredPath = path.join(path.dirname(getConfigPath()), 'default-bg.jpg');
	const bundledPath = path.join(process.cwd(), 'default-bg.jpg');
	const filepath = existsSync(configuredPath) ? configuredPath : bundledPath;

	if (!existsSync(filepath)) {
		return json({ message: 'No default background image is available.' }, { status: 404 });
	}

	try {
		const buffer = await readFile(filepath);
		return new Response(buffer, {
			headers: {
				'Content-Type': mimeForExtension(path.extname(filepath).slice(1)),
				// Default image can change, so avoid the long-lived immutable cache.
				'Cache-Control': 'public, max-age=3600'
			}
		});
	} catch (err) {
		return json({ message: `Failed to read default background image: ${(err as Error).message}` }, { status: 500 });
	}
};
