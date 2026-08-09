<script lang="ts">
	import { X } from '@lucide/svelte';
	import { dashboard } from '$lib/state/dashboard.svelte';

	let {
		open,
		onclose
	}: {
		open: boolean;
		onclose: () => void;
	} = $props();

	let draft = $state('');

	$effect(() => {
		if (open) {
			draft = dashboard.config.settings.appName;
		}
	});

	const canApply = $derived(draft.trim().length > 0);

	function requestApply() {
		if (!canApply) return;
		const nextName = draft.trim();
		onclose();

		dashboard.confirm({
			title: 'Change App Name?',
			message: `Apply "${nextName}" as the app name shown in the topbar?`,
			confirmLabel: 'Apply',
			cancelLabel: 'Cancel',
			destructive: false,
			onConfirm: () => {
				dashboard.config.settings.appName = nextName;
				dashboard.save();
			}
		});
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
		role="presentation"
		onclick={onclose}
		onkeydown={(e) => e.key === 'Escape' && onclose()}
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
				<h2 class="text-sm font-semibold">Change App Name</h2>
				<button onclick={onclose} class="rounded p-1 text-slate-400 hover:bg-slate-700/60" aria-label="Close">
					<X size={16} />
				</button>
			</div>

			<label class="flex flex-col gap-1 text-xs text-slate-400">
				App Name
				<input
					bind:value={draft}
					placeholder="GLdash"
					onkeydown={(e) => e.key === 'Enter' && requestApply()}
					class="rounded-md border border-slate-700/50 bg-transparent px-3 py-1.5 text-sm text-slate-100 outline-none focus:border-slate-500/50"
				/>
			</label>

			<div class="mt-5 flex justify-end gap-2">
				<button
					onclick={onclose}
					class="rounded-md border border-slate-700/50 px-3 py-1.5 text-sm text-slate-300 transition-all duration-150 hover:border-slate-500/50"
				>
					Cancel
				</button>
				<button
					onclick={requestApply}
					disabled={!canApply}
					class="rounded-md border border-emerald-500/50 px-3 py-1.5 text-sm text-emerald-300 transition-all duration-150 enabled:hover:bg-emerald-500/10 disabled:opacity-40"
				>
					Apply
				</button>
			</div>
		</div>
	</div>
{/if}