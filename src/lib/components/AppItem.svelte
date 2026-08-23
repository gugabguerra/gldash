<script lang="ts">
	import AppIcon from './AppIcon.svelte';
	import AppItemActions from './AppItemActions.svelte';
	import type { App, Density } from '$lib/types';
	import type { AppRef } from '$lib/state/dashboard.svelte';
	import { dashboard } from '$lib/state/dashboard.svelte';
	import { extractHost } from '$lib/utils/url';

	interface Props {
		app: App;
		ref: AppRef;
		density: Density;
	}

	let { app, ref, density }: Props = $props();

	// Most apps carry no note, so the second line falls back to the host. That
	// also reads as useful information rather than filler: it shows at a glance
	// whether a service is reached on the LAN or through the reverse proxy.
	const host = $derived(extractHost(app.url));
	const secondary = $derived(app.note || host);
	const secondaryClass = $derived(
		app.note ? 'text-xs opacity-75' : 'font-mono text-xs opacity-60'
	);

	const iconSize = $derived(density === 'rows' ? 16 : density === 'cards' ? 18 : 22);

	const shell =
		'group relative border border-slate-700/50 bg-[var(--gl-card-background)] card transition-all duration-150 hover:border-slate-500/50';
</script>

{#if density === 'rows'}
	<a
		href={app.url}
		target="_blank"
		rel="noreferrer"
		class={`${shell} flex items-center gap-3 rounded-md px-3 py-2`}
	>
		<AppIcon icon={app.icon} url={app.url} size={iconSize} />
		<span class="flex-1 truncate text-sm font-medium">{app.title}</span>
		{#if secondary}
			<span class={`hidden truncate sm:inline ${secondaryClass}`}>{secondary}</span>
		{/if}
		{#if dashboard.editMode}
			<AppItemActions title={app.title} {ref} />
		{/if}
	</a>
{:else if density === 'cards'}
	<a
		href={app.url}
		target="_blank"
		rel="noreferrer"
		class={`${shell} flex flex-col gap-1 rounded-lg px-3 py-2.5`}
	>
		{#if dashboard.editMode}
			<div
				class="absolute right-2 top-2 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
			>
				<AppItemActions title={app.title} {ref} />
			</div>
		{/if}
		<div class="flex min-w-0 items-center gap-2.5">
			<AppIcon icon={app.icon} url={app.url} size={iconSize} />
			<span class="truncate text-sm font-semibold">{app.title}</span>
		</div>
		{#if secondary}
			<!-- Indented to sit under the title rather than under the icon. -->
			<p class={`truncate pl-[26px] ${secondaryClass}`}>{secondary}</p>
		{/if}
	</a>
{:else}
	<a
		href={app.url}
		target="_blank"
		rel="noreferrer"
		class={`${shell} flex h-[78px] flex-col items-center justify-center gap-2 rounded-lg p-3`}
	>
		{#if dashboard.editMode}
			<div
				class="absolute right-1 top-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
			>
				<AppItemActions title={app.title} {ref} />
			</div>
		{/if}
		<AppIcon icon={app.icon} url={app.url} size={iconSize} />
		<span class="max-w-full truncate text-center text-xs font-medium">{app.title}</span>
	</a>
{/if}
