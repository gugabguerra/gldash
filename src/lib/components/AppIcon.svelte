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
	{#if resolved.kind === 'image'}
		<img
			src={resolved.src}
			alt=""
			width={size}
			height={size}
			loading="lazy"
			class="rounded-sm object-contain"
		/>
	{:else}
		<!--
			Simple Icons are solid shapes and take `fill`; Lucide icons are strokes
			and already carry stroke="currentColor". Both scale to the wrapper.
		-->
		<div
			class={`text-slate-200 [&_svg]:h-full [&_svg]:w-full ${
				resolved.kind === 'simple-icon' ? '[&_svg]:fill-current' : ''
			}`}
			style={`width:${size}px;height:${size}px;`}
		>
			{@html resolved.svg}
		</div>
	{/if}
{:catch}
	<div class="rounded bg-slate-700/50" style={`width:${size}px;height:${size}px;`}></div>
{/await}
