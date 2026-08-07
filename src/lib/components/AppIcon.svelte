<script lang="ts">
	import { resolveIcon } from '$lib/utils/icons';

	interface Props {
		icon: string | undefined;
		url: string;
		size?: number;
	}

	let { icon, url, size = 28 }: Props = $props();
</script>

{#await resolveIcon(icon, url)}
	<div class="animate-pulse rounded bg-slate-700/50" style={`width:${size}px;height:${size}px;`}></div>
{:then resolved}
	{#if resolved.kind === 'lucide'}
		{@const LucideIcon = resolved.component}
		<LucideIcon width={size} height={size} class="text-slate-200" />
	{:else if resolved.kind === 'simple-icon'}
		<div
			class="text-slate-200 [&_svg]:h-full [&_svg]:w-full [&_svg]:fill-current"
			style={`width:${size}px;height:${size}px;`}
		>
			{@html resolved.svg}
		</div>
	{:else}
		<img
			src={resolved.src}
			alt=""
			width={size}
			height={size}
			loading="lazy"
			class="rounded-sm object-contain"
		/>
	{/if}
{:catch}
	<div class="rounded bg-slate-700/50" style={`width:${size}px;height:${size}px;`}></div>
{/await}
