export type ResolvedIcon =
	| { kind: 'lucide'; svg: string }
	| { kind: 'simple-icon'; svg: string }
	| { kind: 'image'; src: string };

/** Converts a slug into kebab-case, matching Lucide's individual icon file names. */
function toKebabCase(slug: string): string {
	return slug
		.trim()
		.replace(/[_\s]+/g, '-')
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.toLowerCase();
}

const resolvedIcons = new Map<string, Promise<ResolvedIcon>>();

/**
 * Resolves an app's `icon` field into a renderable representation.
 *
 * Resolution order:
 * 1. `lucide:<name>` — a Lucide icon SVG.
 * 2. `simple-icons:<slug>` — a Simple Icons brand SVG.
 * 3. `http(s)://...` or `/...` — a direct image URL.
 * 4. Fallback — the generic server icon.
 *
 * Both icon sets are fetched from the server one icon at a time, so neither
 * dataset is bundled. Lucide was previously loaded through an
 * `import.meta.glob` over its icon directory, which inlined a lazy-import entry
 * for all ~1760 icons into the main chunk on every page load.
 */
export async function resolveIcon(icon: string | undefined, appUrl: string): Promise<ResolvedIcon> {
	const value = (icon ?? '').trim();
	const cacheKey = `${value}|${appUrl}`;
	const cached = resolvedIcons.get(cacheKey);
	if (cached) return cached;

	const resolved = resolveIconUncached(value);
	resolvedIcons.set(cacheKey, resolved);
	return resolved;
}

async function resolveIconUncached(value: string): Promise<ResolvedIcon> {
	if (value.startsWith('lucide:')) {
		const svg = await fetchIconSvg('lucide', value.slice('lucide:'.length));
		if (svg) return { kind: 'lucide', svg };
	}

	if (value.startsWith('simple-icons:')) {
		const svg = await fetchIconSvg('simple-icons', value.slice('simple-icons:'.length));
		if (svg) return { kind: 'simple-icon', svg };
	}

	if (/^https?:\/\//i.test(value) || value.startsWith('/')) {
		return { kind: 'image', src: value };
	}

	const fallback = await fetchIconSvg('lucide', 'server');
	if (fallback) return { kind: 'lucide', svg: fallback };
	return { kind: 'image', src: '/android-chrome-192x192.png' };
}

/**
 * Fetches one icon's SVG markup from its server endpoint. Returns `null` on any
 * failure so the caller can fall through to the next resolution step.
 */
async function fetchIconSvg(set: 'lucide' | 'simple-icons', slug: string): Promise<string | null> {
	const kebab = toKebabCase(slug);
	if (!kebab) return null;

	try {
		const response = await fetch(`/api/icons/${set}/${kebab}`);
		if (!response.ok) return null;
		return await response.text();
	} catch {
		return null;
	}
}
