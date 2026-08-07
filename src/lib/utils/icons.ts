import type { Component } from 'svelte';
import type { IconProps } from '@lucide/svelte';

export type ResolvedIcon =
	| { kind: 'lucide'; component: Component<IconProps> }
	| { kind: 'simple-icon'; svg: string }
	| { kind: 'image'; src: string }
	| { kind: 'favicon'; src: string };

/** Converts a slug into kebab-case, matching Lucide's individual icon file names. */
function toKebabCase(slug: string): string {
	return slug
		.trim()
		.replace(/[_\s]+/g, '-')
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.toLowerCase();
}



/** Lazily-loaded map of Lucide icon modules, keyed by kebab-case filename (e.g. "server"). */
const lucideIconModules = import.meta.glob('/node_modules/@lucide/svelte/dist/icons/*.svelte', {
	import: 'default'
}) as Record<string, () => Promise<Component<IconProps>>>;

/** Dynamically imports a single Lucide icon component by its kebab-case slug. */
async function loadLucideIcon(slug: string): Promise<Component<IconProps> | null> {
	const path = `/node_modules/@lucide/svelte/dist/icons/${slug}.svelte`;
	const loader = lucideIconModules[path];
	if (!loader) return null;
	try {
		return await loader();
	} catch {
		return null;
	}
}

/**
 * Resolves an app's `icon` field into a renderable representation.
 *
 * Resolution order:
 * 1. `lucide:<name>` — a Lucide icon component.
 * 2. `simple-icons:<slug>` — a Simple Icons brand SVG.
 * 3. `http(s)://...` or `/...` — a direct image URL.
 * 4. Fallback — Google's favicon service, derived from the app's URL.
 */
export async function resolveIcon(icon: string | undefined, appUrl: string): Promise<ResolvedIcon> {
	const value = (icon ?? '').trim();

	if (value.startsWith('lucide:')) {
		const slug = toKebabCase(value.slice('lucide:'.length));
		const component = await loadLucideIcon(slug);
		if (component) {
			return { kind: 'lucide', component };
		}
	}

	if (value.startsWith('simple-icons:')) {
		const slug = value.slice('simple-icons:'.length);
		const svg = await loadSimpleIconSvg(slug);
		if (svg) {
			return { kind: 'simple-icon', svg };
		}
	}

	if (/^https?:\/\//i.test(value) || value.startsWith('/')) {
		return { kind: 'image', src: value };
	}

	return { kind: 'favicon', src: faviconFallback(appUrl) };
}

/**
 * Loads a Simple Icons SVG markup string for the given slug, if it exists.
 * Fetched from the server-side `/api/icons/simple-icons/[slug]` endpoint so the
 * (large) icon dataset never ships in the client bundle.
 */
async function loadSimpleIconSvg(slug: string): Promise<string | null> {
	const kebab = toKebabCase(slug);
	try {
		const response = await fetch(`/api/icons/simple-icons/${kebab}`);
		if (!response.ok) return null;
		return await response.text();
	} catch {
		return null;
	}
}

/** Builds a favicon URL for a given app URL via Google's public favicon service. */
export function faviconFallback(appUrl: string): string {
	try {
		const { hostname } = new URL(appUrl);
		return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
	} catch {
		return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(appUrl)}&sz=64`;
	}
}
