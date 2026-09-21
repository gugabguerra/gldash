<script lang="ts">
	import { Upload, Trash2, RotateCcw } from '@lucide/svelte';
	import { dashboard } from '$lib/state/dashboard.svelte';
	import { backgroundModes, fontFamilies, type BackgroundMode, type FontFamily } from '$lib/constants';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';
	import ThemeColorPickers from '$lib/components/ThemeColorPickers.svelte';

	let bgFileInput = $state<HTMLInputElement | null>(null);

	const bgMode = $derived(dashboard.config.settings.theme.backgroundMode);
	const fontFamily = $derived(dashboard.config.settings.theme.fontFamily);
	// Only a custom upload has anything to preview; solid and gradient are
	// rendered from the chosen colour.
	const bgPreview = $derived(
		bgMode === 'custom' ? dashboard.config.settings.theme.backgroundImage ?? null : null
	);

	// Each option renders its label in its own typeface — the picker doubles
	// as a live preview of the choice.
	const fontLabels: Record<FontFamily, string> = {
		oxanium: 'Oxanium',
		economica: 'Economica',
		bitcount: 'Bitcount'
	};
	const fontOptionStyles: Record<FontFamily, string> = {
		oxanium: "font-family: 'Oxanium', sans-serif;",
		economica: "font-family: 'Economica', sans-serif;",
		bitcount: "font-family: 'Bitcount Grid Double', monospace;"
	};

	async function setFontFamily(family: FontFamily) {
		dashboard.config.settings.theme.fontFamily = family;
		await dashboard.save();
	}

	async function onUploadBackground(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const formData = new FormData();
		formData.append('image', file);

		const response = await fetch('/api/background', {
			method: 'POST',
			body: formData
		});

		if (!response.ok) {
			const body = await response.json().catch(() => ({ message: 'Upload failed' }));
			dashboard.error = body.message ?? 'Failed to upload background image.';
			return;
		}

		const result = await response.json();
		if (result.url) {
			const theme = dashboard.config.settings.theme;
			theme.backgroundImage = result.url;
			theme.backgroundMode = 'custom';
			await dashboard.save();
		}
		input.value = '';
	}

	async function setBackgroundMode(mode: BackgroundMode) {
		if (mode === 'custom') {
			bgFileInput?.click();
			return;
		}

		const theme = dashboard.config.settings.theme;
		if (theme.backgroundImage) {
			// Clean up any previously uploaded image on the server.
			await fetch('/api/background', { method: 'DELETE' }).catch(() => {});
		}
		theme.backgroundImage = undefined;
		theme.backgroundMode = mode;
		await dashboard.save();
	}

	function onRestoreDefaults() {
		dashboard.confirm({
			title: 'Restore Default Styling?',
			message:
				'Reset the theme colors, accent and font, and return to a solid background. Layout and columns stay unchanged.',
			confirmLabel: 'Restore',
			cancelLabel: 'Cancel',
			destructive: true,
			onConfirm: () => {
				dashboard.resetTheme();
			}
		});
	}

</script>

<div class="flex flex-col gap-4">
	<!-- Font Family -->
	<div>
		<div id="font-family-label" class="mb-2 block text-xs text-slate-400">Font</div>
		<div aria-labelledby="font-family-label">
			<SegmentedControl
				value={fontFamily}
				options={fontFamilies}
				onchange={(family) => setFontFamily(family as FontFamily)}
				labels={fontLabels}
				optionStyles={fontOptionStyles}
			/>
		</div>
		<p class="mt-2 text-xs opacity-75">Applies to the dashboard. The title and notes stay in Oxanium.</p>
	</div>

	<!-- Background Mode -->
	<div>
		<div id="bg-image-label" class="mb-2 block text-xs text-slate-400">Background Image</div>
		<input
			type="file"
			bind:this={bgFileInput}
			accept="image/*"
			class="hidden"
			onchange={onUploadBackground}
		/>
		<div aria-labelledby="bg-image-label">
			<SegmentedControl
				value={bgMode}
				options={backgroundModes}
				onchange={(mode) => setBackgroundMode(mode as BackgroundMode)}
				labels={{ solid: 'Solid', gradient: 'Gradient', custom: 'Custom' }}
			/>
		</div>

		{#if bgPreview}
			<div class="mt-3 flex items-center gap-2">
				<img
					src={bgPreview}
					alt="Background preview"
					class="h-12 w-12 rounded border border-slate-700/50 object-cover"
					onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
				/>
				<span class="text-xs opacity-75">Custom upload</span>
				{#if bgMode === 'custom'}
					<button
						onclick={() => setBackgroundMode('solid')}
						class="flex items-center gap-1 rounded-md border border-red-500/50 px-2 py-1 text-xs text-red-300 transition-all duration-150 hover:bg-red-900/30"
					>
						<Trash2 size={12} /> Remove
					</button>
				{/if}
			</div>
		{:else}
			<p class="mt-2 text-xs opacity-75">
				{bgMode === 'gradient'
					? 'Background color with a soft light source'
					: bgMode === 'solid'
						? 'Flat background color'
						: 'No image uploaded yet'}
			</p>
		{/if}

		{#if bgMode === 'custom'}
			<button
				onclick={() => bgFileInput?.click()}
				class="mt-3 flex w-full items-center justify-center gap-1 rounded-md border border-slate-700/50 px-3 py-1.5 text-sm text-slate-300 transition-all duration-150 hover:border-slate-500/50"
			>
				<Upload size={12} /> Upload Image
			</button>
			<p class="mt-1 text-xs opacity-75">Max 5 MB • JPEG, PNG, WebP</p>
		{/if}
	</div>

	<!-- Theme Colors -->
	<ThemeColorPickers />

	<!-- Restore Defaults -->
	<button
		onclick={onRestoreDefaults}
		class="flex w-full items-center justify-center gap-1 rounded-md border border-slate-700/50 px-3 py-1.5 text-xs text-slate-400 transition-all duration-150 hover:border-slate-500/50 hover:text-slate-200"
	>
		<RotateCcw size={12} /> Restore Default Styling
	</button>
</div>
