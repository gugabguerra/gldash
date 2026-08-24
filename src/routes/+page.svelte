<script lang="ts">
	import { dashboard } from '$lib/state/dashboard.svelte';
	import { BACKGROUND_DEFAULT_URL } from '$lib/constants';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import AddCategoryForm from '$lib/components/AddCategoryForm.svelte';
	import ColumnLayout from '$lib/components/ColumnLayout.svelte';
	import WallLayout from '$lib/components/WallLayout.svelte';
	import EditAppModal from '$lib/components/EditAppModal.svelte';
	import SettingsDrawer from '$lib/components/SettingsDrawer.svelte';
	import Spotlight from '$lib/components/Spotlight.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';

	let { data } = $props();

	// Seed the store during setup, not in an $effect. Effects run only after
	// hydration, which made every visit server-render "No categories yet" and
	// fill in a beat later. A one-time read of `data` is exactly what's wanted
	// here, so the reactivity warning is expected.
	// svelte-ignore state_referenced_locally
	if (data.config) dashboard.init(data.config);

	const theme = $derived(dashboard.config.settings.theme);
	const structure = $derived(dashboard.config.settings.structure);
	const columns = $derived(dashboard.config.settings.columns);
	const density = $derived(dashboard.config.settings.density);
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

		<!--
			Wider than the old max-w-6xl, since fitting everything on one screen is
			the point — but still capped, so the board does not stretch to absurd
			line lengths on an ultrawide display.
		-->
		<main class="mx-auto w-full max-w-[1920px] px-6 py-6">
			{#if dashboard.config.categories.length > 0}
				{#if structure === 'wall'}
					<WallLayout {columns} {density} />
				{:else}
					<ColumnLayout {structure} {columns} {density} />
				{/if}

				{#if dashboard.editMode}
					<AddCategoryForm />
				{/if}
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
