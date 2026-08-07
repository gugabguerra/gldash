import { json, type RequestHandler } from '@sveltejs/kit';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getBackgroundFile } from '$lib/server/background';

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
		const ext = path.extname(filepath).slice(1);
		const mime = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }[ext] ?? 'application/octet-stream';
		return new Response(buffer, {
			headers: {
				'Content-Type': mime,
				'Cache-Control': 'public, max-age=86400, immutable'
			}
		});
	} catch (err) {
		return json({ message: `Failed to read background image: ${(err as Error).message}` }, { status: 500 });
	}
};