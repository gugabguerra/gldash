/**
 * Plain values and types shared by client and server.
 *
 * Deliberately free of any `zod` import. `types.ts` builds its schemas from
 * these, but Zod itself must never reach the browser: it JIT-compiles parsers
 * with `eval`, which the app's strict CSP blocks, and it costs a few hundred KB
 * in the client bundle for validation that only ever runs on the server.
 */

/** How categories are arranged on the dashboard. */
export const structureOptions = ['board', 'panel', 'wall'] as const;
export type Structure = (typeof structureOptions)[number];

/** How each app is drawn inside a category. */
export const densityOptions = ['rows', 'cards', 'tiles'] as const;
export type Density = (typeof densityOptions)[number];

/** How the dashboard background is rendered. */
export const backgroundModes = ['solid', 'gradient', 'custom'] as const;
export type BackgroundMode = (typeof backgroundModes)[number];

/** Built-in default theme colors. Restored by the "Restore Defaults" action. */
export const DEFAULT_THEME = {
	background: '#0f172a',
	textColor: '#f8fafc',
	cardBackground: '#1e293b',
	/** Drives interactive state only — selection, focus, hover, edit mode. */
	accent: '#34d399'
} as const;

/** Default dashboard name, used until the user renames it. */
export const DEFAULT_APP_NAME = 'GLdash';

/**
 * A fresh, empty configuration for the client store to hold until the server's
 * data arrives. Returned from a factory rather than shared as a constant,
 * because the store mutates the object it is given.
 */
export function createEmptyConfig() {
	return {
		settings: {
			structure: 'board' as Structure,
			density: 'cards' as Density,
			columns: 4,
			appName: DEFAULT_APP_NAME,
			theme: {
				background: DEFAULT_THEME.background as string,
				textColor: DEFAULT_THEME.textColor as string,
				cardBackground: DEFAULT_THEME.cardBackground as string,
				accent: DEFAULT_THEME.accent as string,
				backgroundMode: 'solid' as BackgroundMode
			}
		},
		categories: []
	};
}
