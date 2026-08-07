<script lang="ts">
	import { X } from '@lucide/svelte';
	import { dashboard } from '$lib/state/dashboard.svelte';

	function onClose() {
		dashboard.closeConfirm();
	}

	const dialog = $derived(dashboard.confirmDialog);
	const title = $derived(dialog?.title ?? '');
	const message = $derived(dialog?.message ?? '');
	const confirmLabel = $derived(dialog?.confirmLabel ?? 'Yes');
	const cancelLabel = $derived(dialog?.cancelLabel ?? 'Cancel');
	const destructive = $derived(dialog?.destructive ?? false);
</script>

{#if dialog}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
		role="presentation"
		onclick={onClose}
		onkeydown={(e) => e.key === 'Escape' && onClose()}
	>
		<div
			class="w-full max-w-sm rounded-lg border border-slate-700/50 bg-[var(--gl-card-background)] p-5"
			role="dialog"
			aria-modal="true"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-sm font-semibold">{title}</h2>
				<button onclick={onClose} class="rounded p-1 text-slate-400 hover:bg-slate-700/60" aria-label="Close">
					<X size={16} />
				</button>
			</div>

			<p class="text-xs text-slate-300/80">{message}</p>

			<div class="mt-5 flex gap-2 justify-end">
				<button
					onclick={onClose}
					class="rounded-md border border-slate-700/50 px-3 py-1.5 text-sm text-slate-300 transition-all duration-150 hover:border-slate-500/50"
				>
					{cancelLabel}
				</button>
				<button
					onclick={() => {
						dialog?.onConfirm?.();
						onClose();
					}}
					class={`rounded-md border px-3 py-1.5 text-sm transition-all duration-150 ${
						destructive
							? 'border-red-500/50 text-red-300 hover:bg-red-900/30'
							: 'border-slate-700/50 text-slate-300 hover:border-slate-500/50'
					}`}
				>
					{confirmLabel}
				</button>
			</div>
		</div>
	</div>
{/if}