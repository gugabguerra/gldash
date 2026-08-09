<script lang="ts">
	import { dndzone, type DndEvent } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import { dashboard } from '$lib/state/dashboard.svelte';
	import type { Category } from '$lib/types';
	import { BACKGROUND_DEFAULT_URL } from '$lib/types';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import CategorySection from '$lib/components/CategorySection.svelte';
	import EditAppModal from '$lib/components/EditAppModal.svelte';
	import SettingsDrawer from '$lib/components/SettingsDrawer.svelte';
	import Spotlight from '$lib/components/Spotlight.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';

	let { data } = $props();

	const flipDurationMs = 150;

	function onConsiderCategory(e: CustomEvent<DndEvent<Category>>) {
		dashboard.config.categories = e.detail.items;
	}

	function onFinalizeCategory(e: CustomEvent<DndEvent<Category>>) {
		const newCategories = e.detail.items;
		setTimeout(() => {
			dashboard.config.categories = newCategories;
			dashboard.save();
		}, 0);
	}

	$effect(() => {
		if (data.config) {
			dashboard.init(data.config);
		}
	});

	const theme = $derived(dashboard.config.settings.theme);
	const layout = $derived(dashboard.config.settings.layout);
	const categoryGridClass = $derived(layout === 'grid' ? 'lg:grid-cols-2' : '');
	const backgroundStyle = $derived.by(() => {
		// Subtle radial gradient overlay for depth — always on top of the background
		const overlay = `radial-gradient(ellipse at center, rgba(45, 5, 66, 0.08) 0%, transparent 60%), radial-gradient(circle at 15% 25%, rgba(30, 41, 59, 0.04) 0%, transparent 40%), radial-gradient(circle at 85% 75%, rgba(30, 41, 59, 0.04) 0%, transparent 40%)`;
		const color = theme.background;
		const vars = `--gl-background:${color}; --gl-text:${theme.textColor}; --gl-card-background:${theme.cardBackground};`;
		// 'solid' → no image, just the color + gradient; otherwise use the
		// custom upload, falling back to the shipped default image.
		const image =
			theme.backgroundMode === 'solid' ? null : theme.backgroundImage ?? BACKGROUND_DEFAULT_URL;
		if (image) {
			return `${vars} background-image: ${overlay}, url('${image}'); background-color: ${color};`;
		}
		return `${vars} background-image: ${overlay}; background-color: ${color};`;
	});
</script>

<svelte:head>
	<title>{dashboard.config.settings.appName}</title>
</svelte:head>

{#if data.configError}
	<div class="flex min-h-screen items-center justify-center p-6">
		<div class="max-w-md rounded-lg border border-red-500/40 bg-red-950/30 p-5 text-sm text-red-200">
			<p class="font-semibold">Failed to load configuration</p>
			<p class="mt-2 opacity-80">{data.configError}</p>
		</div>
	</div>
{:else}
	<div
		style={backgroundStyle}
		class="min-h-screen bg-[var(--gl-background)] text-[var(--gl-text)] bg-cover bg-center bg-fixed bg-no-repeat"
	>
		<Toolbar />

		<main class="mx-auto max-w-6xl px-6 py-6">
			{#if dashboard.config.categories.length > 0}
				<div
					class={`grid grid-cols-1 items-start gap-8 ${categoryGridClass}`}
					use:dndzone={{
						items: dashboard.config.categories,
						type: 'gldash-categories',
						flipDurationMs,
						dragDisabled: !dashboard.editMode,
						dropTargetStyle: {
							outline: '2px dashed rgba(148, 163, 184, 0.6)',
							outlineOffset: '2px'
						}
					}}
					onconsider={onConsiderCategory}
					onfinalize={onFinalizeCategory}
				>
					{#each dashboard.config.categories as category, categoryIndex (category.id ?? categoryIndex)}
						<div animate:flip={{ duration: flipDurationMs }} class="min-w-0">
							<CategorySection
								{categoryIndex}
								name={category.name}
								apps={category.apps}
								layout={dashboard.config.settings.layout}
								columns={dashboard.config.settings.columns}
							/>
						</div>
					{/each}
				</div>
			{:else}
				<p class="py-16 text-center text-sm text-slate-500">
					No categories yet. Open Settings to add your first one.
				</p>
			{/if}
		</main>

		<EditAppModal />
		<SettingsDrawer />
		<Spotlight />
		<ConfirmDialog />
	</div>
{/if}
