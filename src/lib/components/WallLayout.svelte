<script lang="ts">
	import { dndzone, type DndEvent } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import CategorySection from './CategorySection.svelte';
	import type { Category } from '$lib/types';
	import { dashboard } from '$lib/state/dashboard.svelte';

	interface Props {
		columns: number;
		density: 'rows' | 'cards' | 'tiles';
	}

	let { columns, density }: Props = $props();

	const flipDurationMs = 150;

	const dropTargetStyle = {
		outline: '2px dashed rgba(148, 163, 184, 0.6)',
		outlineOffset: '2px'
	};
</script>

<div
	class="flex flex-col gap-8"
	use:dndzone={{
		items: dashboard.config.categories,
		type: 'gldash-categories',
		flipDurationMs,
		dragDisabled: !dashboard.editMode,
		dropTargetStyle
	}}
	onconsider={(e) => {
		dashboard.config.categories = e.detail.items;
	}}
	onfinalize={(e) => {
		const newCategories = e.detail.items;
		setTimeout(() => {
			dashboard.config.categories = newCategories;
			dashboard.save();
		}, 0);
	}}
>
	{#each dashboard.config.categories as category, catIdx (category.id ?? catIdx)}
		<div animate:flip={{ duration: flipDurationMs }} class="min-w-0">
			<CategorySection
				categoryIndex={catIdx}
				name={category.name}
				apps={category.apps}
				structure="wall"
				density={dashboard.config.settings.density}
				columns={dashboard.config.settings.columns}
			/>
		</div>
	{/each}

	{#if dashboard.editMode && dashboard.config.categories.length === 0}
		<div
			class="pointer-events-none flex min-h-[120px] items-center justify-center rounded-md border-2 border-dashed border-slate-700/50 text-xs text-slate-500"
		>
			Drop category here
		</div>
	{/if}
</div>
