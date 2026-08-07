import { z } from 'zod';

/** Layout modes supported by the dashboard. */
export const layoutOptions = ['grid', 'fluid', 'table'] as const;

export const AppSchema = z.object({
	id: z.string().min(1),
	title: z.string().min(1),
	url: z.string().min(1),
	icon: z.string().optional().default(''),
	note: z.string().optional().default(''),
	githubRepo: z.string().optional(),
	dockerImage: z.string().optional()
});

export const CategorySchema = z.object({
	name: z.string().min(1),
	apps: z.array(AppSchema).default([])
});

export const ThemeSchema = z.object({
	background: z.string().default('#0f172a'),
	textColor: z.string().default('#f8fafc'),
	cardBackground: z.string().default('#1e293b')
});

export const SettingsSchema = z.object({
	layout: z.enum(layoutOptions).default('grid'),
	columns: z.number().int().min(2).max(6).default(4),
	theme: ThemeSchema.default(ThemeSchema.parse({}))
});

export const ConfigSchema = z.object({
	settings: SettingsSchema.default(SettingsSchema.parse({})),
	categories: z.array(CategorySchema).default([])
});

export type App = z.infer<typeof AppSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type Theme = z.infer<typeof ThemeSchema>;
export type Settings = z.infer<typeof SettingsSchema>;
export type Config = z.infer<typeof ConfigSchema>;
export type LayoutMode = (typeof layoutOptions)[number];
