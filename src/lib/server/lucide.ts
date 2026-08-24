import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);

/**
 * Root SVG attributes Lucide applies to every icon, mirroring
 * `@lucide/svelte/dist/defaultAttributes.js`. Stroke colour is left as
 * `currentColor` so the icon inherits from its container.
 */
const SVG_ATTRS: Record<string, string> = {
	xmlns: 'http://www.w3.org/2000/svg',
	viewBox: '0 0 24 24',
	fill: 'none',
	stroke: 'currentColor',
	'stroke-width': '2',
	'stroke-linecap': 'round',
	'stroke-linejoin': 'round'
};

/** One element of Lucide's icon data: a tag name plus its attributes. */
type IconNode = [string, Record<string, string | number>];

/**
 * Resolves the installed `@lucide/svelte` icons directory at runtime, using the
 * same two-step strategy as `getSimpleIconsDir()`: module resolution from this
 * file first, then the process working directory (which is what the Docker
 * image relies on). Returns `null` when the package is not installed.
 */
function getIconsDir(): string | null {
	try {
		const entry = require.resolve('@lucide/svelte');
		const dir = path.join(path.dirname(entry), 'icons');
		if (existsSync(dir)) return dir;
	} catch {
		// Not resolvable from here; fall through to the cwd lookup.
	}

	const cwdDir = path.join(process.cwd(), 'node_modules', '@lucide', 'svelte', 'dist', 'icons');
	return existsSync(cwdDir) ? cwdDir : null;
}

function escapeAttr(value: string | number): string {
	return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function renderNodes(nodes: IconNode[]): string {
	return nodes
		.map(([tag, attrs]) => {
			const safeTag = /^[a-zA-Z]+$/.test(tag) ? tag : 'path';
			const rendered = Object.entries(attrs ?? {})
				.map(([k, v]) => `${k}="${escapeAttr(v)}"`)
				.join(' ');
			return `<${safeTag}${rendered ? ' ' + rendered : ''}/>`;
		})
		.join('');
}

/**
 * Builds the SVG markup for a single Lucide icon, read from the installed
 * package on the server.
 *
 * Each shipped icon component embeds its geometry as a literal
 * `const iconNode = [...]`, which is parsed out here rather than importing the
 * Svelte component. That is what keeps all ~1760 icons out of the client
 * bundle: a `import.meta.glob` over the icon directory inlines a lazy-import
 * map for every one of them on every page load, which cost roughly 370 KB.
 *
 * Returns `null` when the icon does not exist, so callers can fall back.
 */
export async function renderLucideIcon(slug: string): Promise<string | null> {
	const iconsDir = getIconsDir();
	if (!iconsDir) return null;

	try {
		const source = await readFile(path.join(iconsDir, `${slug}.svelte`), 'utf-8');
		const match = source.match(/const iconNode\s*=\s*(\[[\s\S]*?\]);/);
		if (!match) return null;

		const nodes = JSON.parse(match[1]) as IconNode[];
		const attrs = Object.entries(SVG_ATTRS)
			.map(([k, v]) => `${k}="${v}"`)
			.join(' ');
		return `<svg ${attrs} aria-hidden="true">${renderNodes(nodes)}</svg>`;
	} catch {
		return null;
	}
}
