import { json, type RequestHandler } from '@sveltejs/kit';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { getConfigPath } from '$lib/server/yaml';
import { mimeForExtension } from '$lib/server/background';

/**
 * GET /api/background/default
 *
 * Serves the shipped default background image, `config/default-bg.jpg`, living
 * next to `config.yaml`. It is read at request time so that editing the file
 * (or mounting a new one via the Docker volume) takes effect without a rebuild.
 * Returns 404 when the file is absent — the dashboard then falls back to the
 * solid color + gradient overlay.
 */
export const GET: RequestHandler = async () => {
	const filepath = path.join(path.dirname(getConfigPath()), 'default-bg.jpg');

	if (!existsSync(filepath)) {
		return json({ message: 'No default background image set.' }, { status: 404 });
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