import { error, text } from '@sveltejs/kit';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { RequestHandler } from './$types';

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
		error(404, `Icon "${slug}" not found.`);
	}
};
