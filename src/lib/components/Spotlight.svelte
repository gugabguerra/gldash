<script lang="ts">
	import { Search } from '@lucide/svelte';
	import AppIcon from './AppIcon.svelte';
	import { dashboard } from '$lib/state/dashboard.svelte';
	import type { App } from '$lib/types';

	let query = $state('');
	let inputEl = $state<HTMLInputElement | null>(null);

	const results = $derived.by<App[]>(() => {
		const q = query.trim().toLowerCase();
		const all = dashboard.config.categories.flatMap((c) => c.apps);
		if (!q) return all.slice(0, 8);
		return all.filter((app) => app.title.toLowerCase().includes(q) || app.note?.toLowerCase().includes(q)).slice(0, 8);
	});

	function onClose() {
		dashboard.closeSpotlight();
		query = '';
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onClose();
	}

	$effect(() => {
		if (dashboard.spotlightOpen) {
			inputEl?.focus();
		}
	});
</script>

<svelte:window
	onkeydown={(e) => {
		if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
			e.preventDefault();
			dashboard.spotlightOpen ? onClose() : dashboard.openSpotlight();
		}
	}}
/>

{#if dashboard.spotlightOpen}
	<div
		class="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-[15vh]"
		role="presentation"
		onclick={onClose}
		onkeydown={onKeydown}
	>
		<div
			class="w-full max-w-lg rounded-lg border border-slate-700/50 bg-[var(--gl-card-background)] p-3"
			role="dialog"
			aria-modal="true"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<div class="flex items-center gap-2 border-b border-slate-700/50 px-2 pb-3">
				<Search size={16} class="text-slate-400" />
				<input
					bind:this={inputEl}
					bind:value={query}
					placeholder="Search apps…"
					class="flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
				/>
				<kbd class="rounded border border-slate-600/50 px-1 text-xs text-slate-500">Esc</kbd>
			</div>

			<div class="mt-2 flex max-h-80 flex-col gap-1 overflow-y-auto">
				{#each results as app (app.id)}
					<a
						href={app.url}
						target="_blank"
						rel="noreferrer"
						onclick={onClose}
						class="flex items-center gap-3 rounded-md px-2 py-2 transition-colors duration-150 hover:bg-slate-700/40"
					>
						<AppIcon icon={app.icon} url={app.url} size={20} />
						<span class="flex-1 truncate text-sm">{app.title}</span>
						{#if app.note}
							<span class="truncate text-xs opacity-75">{app.note}</span>
						{/if}
					</a>
				{:else}
					<p class="px-2 py-4 text-center text-xs text-slate-500">No apps found.</p>
				{/each}
			</div>
		</div>
	</div>
{/if}
