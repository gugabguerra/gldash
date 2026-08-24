<script lang="ts">
	import { dndzone, type DndEvent } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import { splitEvenly, packColumns, innerColumns } from '$lib/utils/columns';
	import CategorySection from './CategorySection.svelte';
	import type { Category, Density } from '$lib/types';
	import { dashboard } from '$lib/state/dashboard.svelte';

	interface Props {
		/** 'board' draws bare categories; 'panel' wraps each in a bordered container. */
		structure: 'board' | 'panel';
		columns: number;
		density: Density;
	}

	let { structure, columns, density }: Props = $props();

	const flipDurationMs = 150;

	// The columns are real elements filled here rather than a CSS `column-count`
	// flow, because svelte-dnd-action needs stable per-column box geometry to
	// work out drop targets.
	//
	// This has to be $derived, not $state seeded by an $effect: effects do not
	// run during SSR, so an effect-filled version server-renders an empty grid
	// and only fills in after hydration.
	const split = $derived.by(() => {
		// View mode balances columns by height. Edit mode switches to sequential
		// chunks so the flat order is exactly concat(col0, col1, ...) — that is
		// what makes the drop below reconstructible — and so the board does not
		// re-flow under the cursor mid-drag.
		const perRow = innerColumns(structure, density, columns);
		return dashboard.editMode
			? splitEvenly(dashboard.config.categories, columns)
			: packColumns(dashboard.config.categories, columns, (cat) =>
					Math.max(1, Math.ceil(cat.apps.length / perRow))
				);
	});

	/** Non-null only while a category is mid-flight, so the drag owns the layout. */
	let dragging = $state<Category[][] | null>(null);
	const columnArrays = $derived(dragging ?? split);

	function withColumn(columnIndex: number, items: Category[]): Category[][] {
		return columnArrays.map((col, i) => (i === columnIndex ? items : col));
	}

	function onConsiderColumn(e: CustomEvent<DndEvent<Category>>, columnIndex: number) {
		// Mid-drag: touch only local state, never the config.
		dragging = withColumn(columnIndex, e.detail.items);
	}

	function onFinalizeColumn(e: CustomEvent<DndEvent<Category>>, columnIndex: number) {
		const next = withColumn(columnIndex, e.detail.items);
		dragging = next;
		setTimeout(() => {
			dashboard.config.categories = next.flat();
			dashboard.save();
			// Hand the layout back to the derived split now that config is the
			// source of truth again.
			dragging = null;
		}, 0);
	}

	const gridColsClass: Record<number, string> = {
		1: 'grid-cols-1',
		2: 'grid-cols-1 md:grid-cols-2',
		3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
		4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
		5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
		6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
	};

	const dropTargetStyle = {
		outline: '2px dashed rgba(148, 163, 184, 0.6)',
		outlineOffset: '2px'
	};

	/**
	 * Position in the flat config array, which is what CategorySection mutates.
	 * Matched by id: mid-drag the rendered list contains dnd's placeholder clone,
	 * which is not the same object as the one in config.
	 */
	function indexOf(category: Category): number {
		return dashboard.config.categories.findIndex((c) => c.id === category.id);
	}
</script>

<div class={`grid items-start gap-8 ${gridColsClass[columns] ?? gridColsClass[4]}`}>
	{#each columnArrays as column, colIdx (colIdx)}
		<div
			class="flex min-w-0 flex-col gap-8"
			use:dndzone={{
				items: column,
				type: 'gldash-categories',
				flipDurationMs,
				dragDisabled: !dashboard.editMode,
				dropTargetStyle
			}}
			onconsider={(e) => onConsiderColumn(e, colIdx)}
			onfinalize={(e) => onFinalizeColumn(e, colIdx)}
		>
			{#each column as category, catIdx (category.id ?? catIdx)}
				<div animate:flip={{ duration: flipDurationMs }} class="min-w-0">
					{#if structure === 'panel'}
						<div
							class="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4 transition-all duration-150 hover:border-slate-500/50"
						>
							<CategorySection
								categoryIndex={indexOf(category)}
								name={category.name}
								apps={category.apps}
								{structure}
								{density}
								{columns}
							/>
						</div>
					{:else}
						<CategorySection
							categoryIndex={indexOf(category)}
							name={category.name}
							apps={category.apps}
							{structure}
							{density}
							{columns}
						/>
					{/if}
				</div>
			{/each}

			{#if dashboard.editMode && column.length === 0}
				<div
					class="pointer-events-none flex min-h-[120px] items-center justify-center rounded-lg border-2 border-dashed border-slate-700/50 text-xs text-slate-500"
				>
					Drop category here
				</div>
			{/if}
		</div>
	{/each}
</div>
