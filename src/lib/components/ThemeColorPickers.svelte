<script lang="ts">
	import { dashboard } from '$lib/state/dashboard.svelte';

	/** Theme keys that hold a colour, in the order they are shown. */
	type ColorKey = 'background' | 'textColor' | 'cardBackground' | 'accent';

	const fields: { key: ColorKey; label: string; hint?: string }[] = [
		{ key: 'background', label: 'Background' },
		{ key: 'textColor', label: 'Text' },
		{ key: 'cardBackground', label: 'Cards' },
		{ key: 'accent', label: 'Accent', hint: 'Selection, focus and edit mode' }
	];

	const theme = $derived(dashboard.config.settings.theme);

	// Bound with value + oninput rather than bind:, because the key is dynamic.
	function onPick(key: ColorKey, e: Event) {
		theme[key] = (e.currentTarget as HTMLInputElement).value;
	}
</script>

<div class="flex flex-col gap-2">
	{#each fields as field (field.key)}
		<div class="flex items-center justify-between gap-2 text-xs text-slate-400">
			<label for={`color-${field.key}`} class="flex flex-col">
				<span>{field.label}</span>
				{#if field.hint}
					<span class="text-[10px] text-slate-500">{field.hint}</span>
				{/if}
			</label>
			<div class="flex items-center gap-2">
				<input
					id={`color-${field.key}`}
					type="color"
					value={theme[field.key]}
					oninput={(e) => onPick(field.key, e)}
					onchange={() => dashboard.save()}
					class="h-7 w-10 cursor-pointer rounded border border-slate-700/50 bg-transparent"
				/>
				<span class="w-16 font-mono text-xs text-slate-300">
					{theme[field.key].toUpperCase()}
				</span>
			</div>
		</div>
	{/each}
</div>
