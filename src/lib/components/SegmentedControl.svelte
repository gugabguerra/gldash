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
			class={`flex-1 rounded px-2 py-1 text-xs capitalize transition-all duration-150 ${value === option ? 'bg-slate-700/60 text-slate-100' : 'text-slate-400 hover:text-slate-200'}`}
		>
			{labels[option] ?? option}
		</button>
	{/each}
</div>
