<script lang="ts">
	import { dashboard } from '$lib/state/dashboard.svelte';

	function onThemeChange() {
		dashboard.save();
	}

	function formatHex(hex: string): string {
		return hex.toUpperCase();
	}
</script>

<div class="flex flex-col gap-2">
	<div class="flex items-center justify-between gap-2 text-xs text-slate-400">
		<label for="bg-color">Background</label>
		<div class="flex items-center gap-2">
			<input
				id="bg-color"
				type="color"
				bind:value={dashboard.config.settings.theme.background}
				onchange={onThemeChange}
				class="h-7 w-10 cursor-pointer rounded border border-slate-700/50 bg-transparent"
			/>
			<span class="w-16 font-mono text-xs text-slate-300">{formatHex(dashboard.config.settings.theme.background)}</span>
		</div>
	</div>
	<div class="flex items-center justify-between gap-2 text-xs text-slate-400">
		<label for="text-color">Text Color</label>
		<div class="flex items-center gap-2">
			<input
				id="text-color"
				type="color"
				bind:value={dashboard.config.settings.theme.textColor}
				onchange={onThemeChange}
				class="h-7 w-10 cursor-pointer rounded border border-slate-700/50 bg-transparent"
			/>
			<span class="w-16 font-mono text-xs text-slate-300">{formatHex(dashboard.config.settings.theme.textColor)}</span>
		</div>
	</div>
	<div class="flex items-center justify-between gap-2 text-xs text-slate-400">
		<label for="card-bg-color">Card Background</label>
		<div class="flex items-center gap-2">
			<input
				id="card-bg-color"
				type="color"
				bind:value={dashboard.config.settings.theme.cardBackground}
				onchange={onThemeChange}
				class="h-7 w-10 cursor-pointer rounded border border-slate-700/50 bg-transparent"
			/>
			<span class="w-16 font-mono text-xs text-slate-300">{formatHex(dashboard.config.settings.theme.cardBackground)}</span>
		</div>
	</div>
</div>
