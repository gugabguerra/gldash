<script lang="ts">
	import { Search } from '@lucide/svelte';
	import SpotlightResult from './SpotlightResult.svelte';
	import { dashboard } from '$lib/state/dashboard.svelte';
	import { extractHost } from '$lib/utils/url';
	import type { App } from '$lib/types';

	let query = $state('');
	let inputEl = $state<HTMLInputElement | null>(null);
	let selectedIndex = $state(0);
	let resultsContainer = $state<HTMLDivElement | null>(null);

	interface Result {
		app: App;
		/** The note when the app has one, otherwise its host. */
		secondary: string;
		/** Hosts render monospaced and dimmer, so they read as addresses not prose. */
		mono: boolean;
	}

	const enrich = (app: App): Result => ({
		app,
		secondary: app.note || extractHost(app.url),
		mono: !app.note
	});

	const results = $derived.by<Result[]>(() => {
		const q = query.trim().toLowerCase();
		const all = dashboard.config.categories.flatMap((c) => c.apps);
		if (!q) return all.slice(0, 8).map(enrich);
		return all
			.filter(
				(app) =>
					app.title.toLowerCase().includes(q) ||
					app.note?.toLowerCase().includes(q) ||
					extractHost(app.url).toLowerCase().includes(q)
			)
			.slice(0, 8)
			.map(enrich);
	});

	// Re-reading `query` is what subscribes this effect: any new search puts the
	// highlight back on the first result.
	$effect(() => {
		query;
		selectedIndex = 0;
	});

	function onClose() {
		dashboard.closeSpotlight();
		query = '';
	}

	function scrollSelectedIntoView() {
		setTimeout(() => {
			const link = resultsContainer?.querySelector(
				`[data-result-index="${selectedIndex}"]`
			) as HTMLAnchorElement | null;
			if (link) {
				link.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
			}
		}, 0);
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			onClose();
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
			scrollSelectedIntoView();
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIndex = Math.max(selectedIndex - 1, 0);
			scrollSelectedIntoView();
		} else if (e.key === 'Enter') {
			e.preventDefault();
			const link = resultsContainer?.querySelector(
				`[data-result-index="${selectedIndex}"]`
			) as HTMLAnchorElement | null;
			if (link) {
				link.click();
			}
		}
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
					onkeydown={onKeydown}
				/>
				<kbd class="rounded border border-slate-600/50 px-1 text-xs text-slate-500">Esc</kbd>
			</div>

			<div
				bind:this={resultsContainer}
				class="mt-2 flex max-h-80 flex-col gap-1 overflow-y-auto"
			>
				{#each results as { app, secondary, mono }, index (app.id)}
					<SpotlightResult
						{app}
						{secondary}
						{mono}
						{index}
						selected={index === selectedIndex}
						onopen={onClose}
					/>
				{:else}
					<p class="px-2 py-4 text-center text-xs text-slate-500">No apps found.</p>
				{/each}
			</div>
		</div>
	</div>
{/if}
