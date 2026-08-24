<script lang="ts">
	import AppIcon from './AppIcon.svelte';
	import type { App } from '$lib/types';

	interface Props {
		app: App;
		/** The app's note when it has one, otherwise its host. */
		secondary: string;
		/** Hosts render monospaced and dimmer, so they read as addresses not prose. */
		mono: boolean;
		selected: boolean;
		/** Position in the result list, used by keyboard navigation to find this row. */
		index: number;
		onopen: () => void;
	}

	let { app, secondary, mono, selected, index, onopen }: Props = $props();
</script>

<!--
	The border is always present and only changes colour, so arrowing through the
	list never shifts a row by a pixel.
-->
<a
	href={app.url}
	target="_blank"
	rel="noreferrer"
	onclick={onopen}
	data-result-index={index}
	class={`flex items-center gap-3 rounded-md border px-2 py-2 transition-colors duration-150 ${
		selected ? 'border-slate-600/50 bg-slate-700/60' : 'border-transparent hover:bg-slate-700/40'
	}`}
>
	<AppIcon icon={app.icon} url={app.url} size={20} />
	<div class="flex min-w-0 flex-1 flex-col">
		<span class="truncate text-sm font-medium">{app.title}</span>
		{#if secondary}
			<span class={`truncate ${mono ? 'font-mono text-xs opacity-60' : 'text-xs opacity-75'}`}>
				{secondary}
			</span>
		{/if}
	</div>
</a>
