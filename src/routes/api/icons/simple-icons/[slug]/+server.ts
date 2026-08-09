import { error, text } from '@sveltejs/kit';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { RequestHandler } from './$types';

const FALLBACK_SVG =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5Zm0 2h14v14H5V5Zm3 3h8v2H8V8Zm0 4h5v2H8v-2Z"/></svg>';

/**
 * GET /api/icons/simple-icons/[slug]
 *
 * Serves a single Simple Icons brand SVG by slug, read directly from the
 * `simple-icons` package on the server. Keeps the (large) icon dataset out
 * of the client bundle entirely — only the requested icon is ever sent.
 */
export const GET: RequestHandler = async ({ params }) => {
	const slug = params.slug.replace(/[^a-z0-9-]/gi, '');
	if (!slug) {
		error(400, 'Invalid icon slug.');
	}

	const filePath = path.join(process.cwd(), 'node_modules', 'simple-icons', 'icons', `${slug}.svg`);

	try {
		const svg = await readFile(filePath, 'utf-8');
		return text(svg, {
			headers: {
				'Content-Type': 'image/svg+xml',
				'Cache-Control': 'public, max-age=86400, immutable'
			}
		});
	} catch {
		// Unsupported brands remain renderable without falling back to a third-party favicon service.
		return text(FALLBACK_SVG, {
			headers: {
				'Content-Type': 'image/svg+xml',
				'Cache-Control': 'public, max-age=3600'
			}
		});
	}
};
