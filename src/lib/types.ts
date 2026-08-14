import { z } from 'zod';
import { createId } from '$lib/utils/uuid';

/** Layout modes supported by the dashboard. */
export const layoutOptions = ['grid', 'fluid', 'table'] as const;

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

/** Built-in default theme colors. Restored by the "Restore Defaults" action. */
export const DEFAULT_THEME = {
	background: '#0f172a',
	textColor: '#f8fafc',
	cardBackground: '#1e293b'
} as const;

/** How the dashboard background is rendered. */
export const backgroundModes = ['default', 'custom', 'solid'] as const;
export type BackgroundMode = (typeof backgroundModes)[number];

/** Server URL that serves the default background image from the config dir. */
export const BACKGROUND_DEFAULT_URL = '/api/background/default';

export const ThemeSchema = z
	.object({
		background: z.string().default(DEFAULT_THEME.background),
		textColor: z.string().default(DEFAULT_THEME.textColor),
		cardBackground: z.string().default(DEFAULT_THEME.cardBackground),
		backgroundImage: z.string().optional(),
		backgroundMode: z.enum(backgroundModes).optional()
	})
	.transform((theme) => ({
		...theme,
		// Migrate legacy configs: an existing image URL implies "custom";
		// otherwise default to the default background image.
		backgroundMode: theme.backgroundMode ?? (theme.backgroundImage ? 'custom' : 'default')
	}));

/** A validated theme with an always-present background mode. */
export type Theme = z.infer<typeof ThemeSchema>;

const defaultThemeValue: Theme = {
	background: DEFAULT_THEME.background,
	textColor: DEFAULT_THEME.textColor,
	cardBackground: DEFAULT_THEME.cardBackground,
	backgroundMode: 'default'
};

export const SettingsSchema = z.object({
	layout: z.enum(layoutOptions).default('grid'),
	columns: z.number().int().min(2).max(6).default(4),
	appName: z.string().min(1).default('GLdash'),
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
		layout: 'grid',
		columns: 4,
		appName: 'GLdash',
		theme: defaultThemeValue
	}),
	categories: z.array(CategorySchema).default([])
});

export type App = z.infer<typeof AppSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type Settings = z.infer<typeof SettingsSchema>;
export type Config = z.infer<typeof ConfigSchema>;
export type LayoutMode = (typeof layoutOptions)[number];
