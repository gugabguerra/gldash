import { z } from 'zod';
import { createId } from '$lib/utils/uuid';
import {
	backgroundModes,
	densityOptions,
	structureOptions,
	fontFamilies,
	DEFAULT_THEME,
	DEFAULT_APP_NAME
} from '$lib/constants';

// Re-exported so server code can keep importing schema and constants from one
// place. Client code should import from `$lib/constants` directly — importing
// from here drags Zod into the browser bundle.
export {
	backgroundModes,
	densityOptions,
	structureOptions,
	fontFamilies,
	DEFAULT_THEME
} from '$lib/constants';
export type { BackgroundMode, Density, Structure, FontFamily } from '$lib/constants';

export const AppSchema = z.object({
	id: z.string().min(1),
	title: z.string().min(1),
	url: z
		.string()
		.min(1)
		.refine((v) => /^(https?:\/\/|\/)/i.test(v), {
			message: 'URL must start with http://, https://, or /'
		}),
	icon: z.string().optional().default(''),
	note: z.string().optional().default('')
});

export const CategorySchema = z.object({
	id: z.string().min(1).optional().default(() => createId()),
	name: z.string().min(1),
	apps: z.array(AppSchema).default([])
});

export const ThemeSchema = z
	.object({
		background: z.string().default(DEFAULT_THEME.background),
		textColor: z.string().default(DEFAULT_THEME.textColor),
		cardBackground: z.string().default(DEFAULT_THEME.cardBackground),
		accent: z.string().default(DEFAULT_THEME.accent),
		backgroundImage: z.string().optional(),
		// `.catch` rather than a bare enum: a config written by an older version
		// may carry a mode that no longer exists, and an unknown value should
		// fall back rather than fail the whole config load.
		backgroundMode: z.enum(backgroundModes).optional().catch(undefined),
		// Same defensive `.catch` as backgroundMode — an unknown family from an
		// older or hand-edited config falls back to the default.
		fontFamily: z.enum(fontFamilies).optional().catch(undefined)
	})
	.transform((theme) => ({
		...theme,
		// An uploaded image implies "custom"; everything else falls back to the
		// plain colour ground.
		backgroundMode: theme.backgroundMode ?? (theme.backgroundImage ? 'custom' : 'gradient'),
		fontFamily: theme.fontFamily ?? 'oxanium'
	}));

/** A validated theme with an always-present background mode. */
export type Theme = z.infer<typeof ThemeSchema>;

const defaultThemeValue: Theme = {
	background: DEFAULT_THEME.background,
	textColor: DEFAULT_THEME.textColor,
	cardBackground: DEFAULT_THEME.cardBackground,
	accent: DEFAULT_THEME.accent,
	backgroundMode: 'gradient',
	fontFamily: 'oxanium'
};

export const SettingsSchema = z.object({
	structure: z.enum(structureOptions).default('board'),
	density: z.enum(densityOptions).default('cards'),
	columns: z.number().int().min(2).max(6).default(4),
	appName: z.string().min(1).default(DEFAULT_APP_NAME),
	theme: ThemeSchema.default(defaultThemeValue)
});

/**
 * Server-only authentication settings stored in `config.yaml`.
 * Kept out of `ConfigSchema` so secrets never reach the client.
 * `adminPasswordHash` is a bcrypt hash; an empty string means no password
 * is set yet (first-run setup or manual reset by emptying the variable).
 */
export const AuthConfigSchema = z.object({
	adminPasswordHash: z.string().default('')
});

export type AuthConfig = z.infer<typeof AuthConfigSchema>;

export const ConfigSchema = z.object({
	settings: SettingsSchema.default({
		structure: 'board',
		density: 'cards',
		columns: 4,
		appName: DEFAULT_APP_NAME,
		theme: defaultThemeValue
	}),
	categories: z.array(CategorySchema).default([])
});

export type App = z.infer<typeof AppSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type Settings = z.infer<typeof SettingsSchema>;
export type Config = z.infer<typeof ConfigSchema>;
