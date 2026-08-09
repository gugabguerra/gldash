import { json } from '@sveltejs/kit';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import type { RequestHandler } from './$types';
import { getSimpleIconsDir } from '$lib/server/icons';

/** @lucide/svelte file names are resolved at build time by Vite. */
const lucideIconModules = import.meta.glob('/node_modules/@lucide/svelte/dist/icons/*.svelte');

let cachedSimpleIconSlugs: string[] | null = null;

/**
 * Lists simple-icons SVG slugs from the installed package, cached per process.
 * Degrades to an empty list (never throws) so the Lucide catalog keeps working
 * even when Simple Icons is unavailable at runtime.
 */
async function listSimpleIconSlugs(): Promise<string[]> {
	if (cachedSimpleIconSlugs) return cachedSimpleIconSlugs;

	const iconsDir = getSimpleIconsDir();
	if (!iconsDir) {
		cachedSimpleIconSlugs = [];
		return cachedSimpleIconSlugs;
	}

	try {
		const files = await readdir(path.join(iconsDir, 'icons'));
		cachedSimpleIconSlugs = files
			.filter((file) => file.endsWith('.svg'))
			.map((file) => file.slice(0, -'.svg'.length))
			.sort();
	} catch {
		cachedSimpleIconSlugs = [];
	}

	return cachedSimpleIconSlugs;
}

/**
 * GET /api/icons
 *
 * Returns the list of available `lucide:*` and `simple-icons:*` slugs so the
 * client can offer icon autocomplete without bundling either icon dataset.
 */
export const GET: RequestHandler = async () => {
	try {
		const [simpleIconSlugs, lucideIconPaths] = await Promise.all([
			listSimpleIconSlugs(),
			Promise.resolve(Object.keys(lucideIconModules))
		]);

		const lucideSlugs = lucideIconPaths
			.map((filePath) => filePath.split('/').pop()?.replace(/\.svelte$/, '') ?? '')
			.filter(Boolean)
			.sort();

		return json({ lucide: lucideSlugs, 'simple-icons': simpleIconSlugs });
	} catch (err) {
		return json({ message: (err as Error).message }, { status: 500 });
	}
};