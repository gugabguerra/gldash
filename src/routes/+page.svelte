<script lang="ts">
	import { dashboard } from '$lib/state/dashboard.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import CategorySection from '$lib/components/CategorySection.svelte';
	import EditAppModal from '$lib/components/EditAppModal.svelte';
	import SettingsDrawer from '$lib/components/SettingsDrawer.svelte';
	import Spotlight from '$lib/components/Spotlight.svelte';

	let { data } = $props();

	$effect(() => {
		if (data.config) {
			dashboard.init(data.config);
		}
	});

	const theme = $derived(dashboard.config.settings.theme);
</script>

<svelte:head>
	<title>GLdash</title>
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
		style={`--gl-background:${theme.background}; --gl-text:${theme.textColor}; --gl-card-background:${theme.cardBackground};`}
		class="min-h-screen bg-[var(--gl-background)] text-[var(--gl-text)]"
	>
		<Toolbar />

		<main class="mx-auto max-w-6xl px-6 py-6">
			{#each dashboard.config.categories as category, categoryIndex (category.name + categoryIndex)}
				<CategorySection
					{categoryIndex}
					name={category.name}
					apps={category.apps}
					layout={dashboard.config.settings.layout}
					columns={dashboard.config.settings.columns}
				/>
			{:else}
				<p class="py-16 text-center text-sm text-slate-500">
					No categories yet. Open Settings to add your first one.
				</p>
			{/each}
		</main>

		<EditAppModal />
		<SettingsDrawer />
		<Spotlight />
	</div>
{/if}
