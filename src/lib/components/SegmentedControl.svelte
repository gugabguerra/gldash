<script lang="ts">
	let {
		value,
		options,
		onchange,
		labels = {}
	}: {
		value: string;
		options: readonly string[];
		onchange: (value: string) => void;
		labels?: Record<string, string>;
	} = $props();

	function handleChange(option: string) {
		onchange(option);
	}
</script>

<div class="flex gap-1 rounded-md border border-slate-700/50 p-1">
	{#each options as option}
		<button
			onclick={() => handleChange(option)}
			aria-pressed={value === option}
			style={value === option
				? 'color: var(--gl-accent); background-color: color-mix(in srgb, var(--gl-accent) 14%, transparent);'
				: undefined}
			class={`flex-1 rounded px-2 py-1 text-xs capitalize transition-all duration-150 ${value === option ? 'font-medium' : 'text-slate-400 hover:text-slate-200'}`}
		>
			{labels[option] ?? option}
		</button>
	{/each}
</div>
