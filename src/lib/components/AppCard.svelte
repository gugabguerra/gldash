<script lang="ts">
	import { Pencil, GripVertical, Trash2, Copy } from '@lucide/svelte';
	import AppIcon from './AppIcon.svelte';
	import type { App } from '$lib/types';
	import { dashboard, type AppRef } from '$lib/state/dashboard.svelte';

	interface Props {
		app: App;
		ref: AppRef;
		dense?: boolean;
	}

	let { app, ref, dense = false }: Props = $props();

	function onEdit(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		dashboard.startEditingApp(ref);
	}

	function onClone(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		dashboard.cloneApp(ref);
	}

	function onRemove(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		dashboard.removeApp(ref);
	}
</script>

{#if dense}
	<a
		href={app.url}
		target="_blank"
		rel="noreferrer"
		class="group flex items-center gap-3 rounded-md border border-slate-700/50 bg-[var(--gl-card-background)] card px-3 py-2 transition-all duration-150 hover:border-slate-500/50"
	>
		<AppIcon icon={app.icon} url={app.url} size={20} />
		<span class="flex-1 truncate text-sm font-medium">{app.title}</span>
		{#if app.note}
			<span class="hidden truncate text-xs opacity-75 sm:inline">{app.note}</span>
		{/if}
		{#if dashboard.editMode}
			<div class="flex items-center gap-1">
				<button
					onclick={onEdit}
					class="rounded p-1 text-slate-400 hover:bg-slate-700/60 hover:text-slate-100"
					aria-label={`Edit ${app.title}`}
				>
					<Pencil size={14} />
				</button>
				<button
					onclick={onClone}
					class="rounded p-1 text-slate-400 hover:bg-slate-700/60 hover:text-slate-100"
					aria-label={`Clone ${app.title}`}
				>
					<Copy size={14} />
				</button>
				<button
					onclick={onRemove}
					class="rounded p-1 text-slate-400 hover:bg-red-900/40 hover:text-red-300"
					aria-label={`Remove ${app.title}`}
				>
					<Trash2 size={14} />
				</button>
			</div>
		{/if}
	</a>
{:else}
	<a
		href={app.url}
		target="_blank"
		rel="noreferrer"
		class="group relative flex flex-col gap-3 rounded-lg border border-slate-700/50 bg-[var(--gl-card-background)] card p-4 transition-all duration-150 hover:border-slate-500/50"
	>
		{#if dashboard.editMode}
			<div class="absolute right-2 top-2 flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
				<button
					onclick={onEdit}
					class="rounded p-1 text-slate-400 hover:bg-slate-700/60 hover:text-slate-100"
					aria-label={`Edit ${app.title}`}
				>
					<Pencil size={14} />
				</button>
				<button
					onclick={onClone}
					class="rounded p-1 text-slate-400 hover:bg-slate-700/60 hover:text-slate-100"
					aria-label={`Clone ${app.title}`}
				>
					<Copy size={14} />
				</button>
				<button
					onclick={onRemove}
					class="rounded p-1 text-slate-400 hover:bg-red-900/40 hover:text-red-300"
					aria-label={`Remove ${app.title}`}
				>
					<Trash2 size={14} />
				</button>
				<span class="dnd-handle cursor-grab rounded p-1 text-slate-400 hover:bg-slate-700/60">
					<GripVertical size={14} />
				</span>
			</div>
		{/if}
		<div class="flex items-center gap-3">
			<AppIcon icon={app.icon} url={app.url} size={28} />
			<span class="truncate font-medium">{app.title}</span>
		</div>
		{#if app.note}
			<p class="truncate text-xs opacity-75">{app.note}</p>
		{/if}
	</a>
{/if}
