<script lang="ts">
	import { Search, Settings, Pencil, Check, LayoutGrid, Rows3, Table } from '@lucide/svelte';
	import { dashboard } from '$lib/state/dashboard.svelte';
	import type { LayoutMode } from '$lib/types';

	const layoutIcons: Record<LayoutMode, typeof LayoutGrid> = {
		grid: LayoutGrid,
		fluid: Rows3,
		table: Table
	};

	function setLayout(layout: LayoutMode) {
		dashboard.config.settings.layout = layout;
		dashboard.save();
	}

	function onToggleEdit() {
		dashboard.toggleEditMode();
	}
</script>

<header
	class="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-700/50 bg-[var(--gl-background)]/95 toolbar px-6 py-3 backdrop-blur-sm"
>
	<h1 class="text-base font-bold tracking-tight">GLdash</h1>

	<div class="flex items-center gap-2">
		<div class="flex items-center gap-1 rounded-md border border-slate-700/50 p-1">
			{#each ['grid', 'fluid', 'table'] as const as mode}
				{@const Icon = layoutIcons[mode]}
				<button
					onclick={() => setLayout(mode)}
					class={`rounded p-2 transition-all duration-150 ${dashboard.config.settings.layout === mode ? 'bg-slate-700/60 text-slate-100' : 'text-slate-400 hover:text-slate-200'}`}
					aria-label={`${mode} layout`}
				>
					<Icon size={18} />
				</button>
			{/each}
		</div>

		<button
			onclick={() => dashboard.openSpotlight()}
			class="flex items-center gap-2 rounded-md border border-slate-700/50 px-3.5 py-2 text-sm text-slate-400 transition-all duration-150 hover:border-slate-500/50"
		>
			<Search size={16} />
			<span class="hidden sm:inline">Search</span>
			<kbd class="hidden rounded border border-slate-600/50 px-1 text-xs text-slate-500 sm:inline">⌘K</kbd>
		</button>

		<button
			onclick={() => dashboard.openSettings()}
			class="rounded-md border border-slate-700/50 p-2 text-slate-400 transition-all duration-150 hover:border-slate-500/50 hover:text-slate-200"
			aria-label="Settings"
		>
			<Settings size={16} />
		</button>

		<button
			onclick={onToggleEdit}
			class={`flex items-center gap-2 rounded-md border px-3.5 py-2 text-sm transition-all duration-150 ${dashboard.editMode ? 'border-emerald-500/50 text-emerald-300' : 'border-slate-700/50 text-slate-400 hover:border-slate-500/50'}`}
		>
			{#if dashboard.editMode}
				<Check size={16} /> Done
			{:else}
				<Pencil size={16} /> Edit
			{/if}
		</button>
	</div>
</header>
