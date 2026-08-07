<script lang="ts">
	import { dndzone, type DndEvent } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import { Plus, Trash2 } from '@lucide/svelte';
	import AppCard from './AppCard.svelte';
	import type { App } from '$lib/types';
	import { dashboard } from '$lib/state/dashboard.svelte';

	interface Props {
		categoryIndex: number;
		name: string;
		apps: App[];
		layout: 'grid' | 'fluid' | 'table';
		columns: number;
	}

	let { categoryIndex, name, apps, layout, columns }: Props = $props();

	const flipDurationMs = 150;

	function handleConsider(e: CustomEvent<DndEvent<App>>) {
		dashboard.config.categories[categoryIndex].apps = e.detail.items;
	}

	function handleFinalize(e: CustomEvent<DndEvent<App>>) {
		dashboard.config.categories[categoryIndex].apps = e.detail.items;
		dashboard.save();
	}

	function onAddApp() {
		dashboard.addApp(categoryIndex);
	}

	function onRemoveCategory() {
		dashboard.removeCategory(categoryIndex);
	}

	const gridColsClass: Record<number, string> = {
		2: 'sm:grid-cols-2',
		3: 'sm:grid-cols-2 lg:grid-cols-3',
		4: 'sm:grid-cols-2 lg:grid-cols-4',
		5: 'sm:grid-cols-2 lg:grid-cols-5',
		6: 'sm:grid-cols-2 lg:grid-cols-6'
	};
</script>

<section class="mb-8">
	<div class="mb-3 flex items-center justify-between">
		<h2 class="text-sm font-semibold uppercase tracking-wide text-slate-400">{name}</h2>
		{#if dashboard.editMode}
			<div class="flex items-center gap-2">
				<button
					onclick={onAddApp}
					class="flex items-center gap-1 rounded-md border border-slate-700/50 px-2 py-1 text-xs text-slate-300 transition-all duration-150 hover:border-slate-500/50"
				>
					<Plus size={12} /> Add App
				</button>
				<button
					onclick={onRemoveCategory}
					class="flex items-center gap-1 rounded-md border border-slate-700/50 px-2 py-1 text-xs text-slate-400 transition-all duration-150 hover:border-red-500/50 hover:text-red-300"
				>
					<Trash2 size={12} /> Remove
				</button>
			</div>
		{/if}
	</div>

	{#if layout === 'table'}
		<div
			class="flex flex-col gap-2"
			use:dndzone={{ items: apps, flipDurationMs, dragDisabled: !dashboard.editMode }}
			onconsider={handleConsider}
			onfinalize={handleFinalize}
		>
			{#each apps as app (app.id)}
				<div animate:flip={{ duration: flipDurationMs }}>
					<AppCard {app} ref={{ categoryIndex, appIndex: apps.indexOf(app) }} dense />
				</div>
			{/each}
		</div>
	{:else if layout === 'fluid'}
		<div
			class="flex flex-wrap gap-4"
			use:dndzone={{ items: apps, flipDurationMs, dragDisabled: !dashboard.editMode }}
			onconsider={handleConsider}
			onfinalize={handleFinalize}
		>
			{#each apps as app (app.id)}
				<div class="w-56" animate:flip={{ duration: flipDurationMs }}>
					<AppCard {app} ref={{ categoryIndex, appIndex: apps.indexOf(app) }} />
				</div>
			{/each}
		</div>
	{:else}
		<div
			class={`grid grid-cols-1 gap-4 ${gridColsClass[columns] ?? gridColsClass[4]}`}
			use:dndzone={{ items: apps, flipDurationMs, dragDisabled: !dashboard.editMode }}
			onconsider={handleConsider}
			onfinalize={handleFinalize}
		>
			{#each apps as app (app.id)}
				<div animate:flip={{ duration: flipDurationMs }}>
					<AppCard {app} ref={{ categoryIndex, appIndex: apps.indexOf(app) }} />
				</div>
			{/each}
		</div>
	{/if}
</section>
