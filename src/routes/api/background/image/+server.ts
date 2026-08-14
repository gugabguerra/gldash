import { json, type RequestHandler } from '@sveltejs/kit';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getBackgroundFile, mimeForExtension } from '$lib/server/background';

/**
 * GET /api/background/image
 *
 * Serves the currently stored background image. Because @sveltejs/adapter-node
 * pre-bakes static files at build time, runtime-written images must be served
 * via this endpoint instead of being placed in the static assets manifest.
 */
export const GET: RequestHandler = async () => {
	const filepath = await getBackgroundFile();
	if (!filepath) {
		return json({ message: 'No background image set.' }, { status: 404 });
	}

	try {
		const buffer = await readFile(filepath);
		return new Response(buffer, {
			headers: {
				'Content-Type': mimeForExtension(path.extname(filepath).slice(1)),
				// The uploaded background can change, so avoid a long-lived cache
				// that would keep serving a stale image after a new upload.
				'Cache-Control': 'public, max-age=3600'
			}
		});
	} catch (err) {
		return json({ message: `Failed to read background image: ${(err as Error).message}` }, { status: 500 });
	}
};