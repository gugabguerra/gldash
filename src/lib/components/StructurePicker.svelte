<script lang="ts">
	import type { Structure } from '$lib/types';

	let {
		value,
		onchange
	}: {
		value: Structure;
		onchange: (value: Structure) => void;
	} = $props();

	const structureOptions: Array<{ id: Structure; label: string; description: string }> = [
		{ id: 'board', label: 'Board', description: 'Columns of categories' },
		{ id: 'panel', label: 'Panel', description: 'Stacked card sections' },
		{ id: 'wall', label: 'Wall', description: 'Full-width rows' }
	];
</script>

<div class="flex gap-2">
	{#each structureOptions as option}
		<button
			onclick={() => onchange(option.id)}
			aria-pressed={value === option.id}
			class={`flex flex-col items-center gap-1.5 rounded-md border-2 p-2 transition-all duration-150 ${value === option.id ? 'border-[var(--gl-accent)] bg-[color-mix(in_srgb,var(--gl-accent)_12%,transparent)]' : 'border-slate-700/50 hover:border-slate-600/50'}`}
		>
			<!-- Wireframe thumbnails (54×36) -->
			<div class="flex h-9 w-14 gap-0.5 rounded border border-slate-600/40 bg-slate-800/20 p-0.5">
				{#if option.id === 'board'}
					<!-- Two columns, each with header bar + thin content bars -->
					<div class="flex flex-1 flex-col gap-0.5">
						<div class="h-1.5 rounded bg-slate-500/40"></div>
						<div class="h-0.5 rounded bg-slate-600/30"></div>
						<div class="h-0.5 rounded bg-slate-600/30"></div>
					</div>
					<div class="flex flex-1 flex-col gap-0.5">
						<div class="h-1.5 rounded bg-slate-500/40"></div>
						<div class="h-0.5 rounded bg-slate-600/30"></div>
						<div class="h-0.5 rounded bg-slate-600/30"></div>
					</div>
				{:else if option.id === 'panel'}
					<!-- Two columns of bordered boxes -->
					<div class="flex flex-1 flex-col gap-0.5">
						<div class="h-5 rounded border border-slate-600/30 bg-slate-700/20 p-0.5">
							<div class="h-1 rounded bg-slate-500/30"></div>
						</div>
						<div class="h-5 rounded border border-slate-600/30 bg-slate-700/20 p-0.5">
							<div class="h-1 rounded bg-slate-500/30"></div>
						</div>
					</div>
					<div class="flex flex-1 flex-col gap-0.5">
						<div class="h-5 rounded border border-slate-600/30 bg-slate-700/20 p-0.5">
							<div class="h-1 rounded bg-slate-500/30"></div>
						</div>
						<div class="h-5 rounded border border-slate-600/30 bg-slate-700/20 p-0.5">
							<div class="h-1 rounded bg-slate-500/30"></div>
						</div>
					</div>
				{:else if option.id === 'wall'}
					<!-- Full-width rows of small squares -->
					<div class="flex flex-1 flex-col gap-0.5">
						<div class="h-1.5 rounded bg-slate-500/40"></div>
						<div class="flex gap-0.5">
							<div class="h-2 w-2 rounded bg-slate-600/40"></div>
							<div class="h-2 w-2 rounded bg-slate-600/40"></div>
							<div class="h-2 w-2 rounded bg-slate-600/40"></div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Label -->
			<div class="flex flex-col items-center gap-0">
				<span class="text-xs font-medium text-slate-200">{option.label}</span>
				<span class="text-xs text-slate-500">{option.description}</span>
			</div>
		</button>
	{/each}
</div>
