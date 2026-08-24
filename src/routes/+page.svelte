<script lang="ts">
	import { dashboard } from '$lib/state/dashboard.svelte';
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
		const color = theme.background;
		const vars =
			`--gl-background:${color}; --gl-text:${theme.textColor};` +
			` --gl-card-background:${theme.cardBackground}; --gl-accent:${theme.accent};`;

		// A custom upload wins outright — an image needs no help from a gradient
		// underneath it, and layering one only muddies the photo.
		if (theme.backgroundMode === 'custom' && theme.backgroundImage) {
			return `${vars} background-image: url('${theme.backgroundImage}'); background-color: ${color};`;
		}

		if (theme.backgroundMode === 'gradient') {
			// Two low-opacity radials over the chosen colour: enough to give the
			// page a light source and stop a large flat area reading as dead,
			// without becoming a visible colour wash behind the cards.
			const gradient =
				'radial-gradient(ellipse 90% 70% at 20% 0%, rgba(148, 163, 184, 0.10), transparent 60%),' +
				' radial-gradient(ellipse 80% 60% at 85% 100%, rgba(148, 163, 184, 0.06), transparent 55%)';
			return `${vars} background-image: ${gradient}; background-color: ${color};`;
		}

		return `${vars} background-color: ${color};`;
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
