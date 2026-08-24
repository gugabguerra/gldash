import { error, text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { renderLucideIcon } from '$lib/server/lucide';

/** Rendered once: the icon used when a slug does not resolve. */
const FALLBACK_SVG =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>';

/**
 * GET /api/icons/lucide/[slug]
 *
 * Serves a single Lucide icon as SVG, built on the server from the installed
 * package. Mirrors the Simple Icons endpoint, and for the same reason: only the
 * requested icon is ever sent, so the full icon set never reaches the browser.
 */
export const GET: RequestHandler = async ({ params }) => {
	const slug = params.slug.replace(/[^a-z0-9-]/gi, '');
	if (!slug) {
		error(400, 'Invalid icon slug.');
	}

	const svg = await renderLucideIcon(slug);
	return text(svg ?? FALLBACK_SVG, {
		headers: {
			'Content-Type': 'image/svg+xml',
			'Cache-Control': svg ? 'public, max-age=86400, immutable' : 'public, max-age=3600'
		}
	});
};
