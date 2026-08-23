<script lang="ts">
	import { Pencil, GripVertical, Trash2, Copy } from '@lucide/svelte';
	import { dashboard, type AppRef } from '$lib/state/dashboard.svelte';

	interface Props {
		/** App title, used to label each control for screen readers. */
		title: string;
		ref: AppRef;
	}

	let { title, ref }: Props = $props();

	/** Controls sit inside the app's anchor, so every click must be swallowed. */
	function intercept(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
	}

	function onEdit(e: MouseEvent) {
		intercept(e);
		dashboard.startEditingApp(ref);
	}

	function onClone(e: MouseEvent) {
		intercept(e);
		dashboard.cloneApp(ref);
	}

	function onRemove(e: MouseEvent) {
		intercept(e);
		dashboard.removeApp(ref);
	}
</script>

<div class="flex items-center gap-1">
	<button
		onclick={onEdit}
		class="rounded p-1 text-slate-400 hover:bg-slate-700/60 hover:text-slate-100"
		aria-label={`Edit ${title}`}
	>
		<Pencil size={14} />
	</button>
	<button
		onclick={onClone}
		class="rounded p-1 text-slate-400 hover:bg-slate-700/60 hover:text-slate-100"
		aria-label={`Clone ${title}`}
	>
		<Copy size={14} />
	</button>
	<button
		onclick={onRemove}
		class="rounded p-1 text-slate-400 hover:bg-red-900/40 hover:text-red-300"
		aria-label={`Remove ${title}`}
	>
		<Trash2 size={14} />
	</button>
	<span class="dnd-handle cursor-grab rounded p-1 text-slate-400 hover:bg-slate-700/60">
		<GripVertical size={14} />
	</span>
</div>
