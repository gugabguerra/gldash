import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
	// The config directory is only runtime state managed by the app. Excluding it
	// from Vite's watcher prevents a full dev-server page reload every time the
	// dashboard persists changes (which would discard client-side UI state).
	server: {
		watch: {
			ignored: ['**/config/**']
		}
	},
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// Node adapter is used for the Docker deployment target.
			// See https://svelte.dev/docs/kit/adapters for more information about adapters.
			adapter: adapter()
		}),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			manifest: {
				name: 'GLdash',
				short_name: 'GLdash',
				description: 'Fast, elegant homelab dashboard and application launcher.',
				theme_color: '#0f172a',
				background_color: '#0f172a',
				display: 'standalone',
				start_url: '/',
				icons: [
					{
						src: '/android-chrome-192x192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: '/android-chrome-512x512.png',
						sizes: '512x512',
						type: 'image/png'
					}
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,svg,png,ico,webp}'],
				// Uploaded backgrounds are runtime data served by /api/background/image.
				// They must not be added to the finite PWA precache manifest.
				globIgnores: ['**/backgrounds/**']
			},
			devOptions: {
				enabled: false
			}
		})
	]
});
