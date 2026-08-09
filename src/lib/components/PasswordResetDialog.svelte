<script lang="ts">
	import { KeyRound, X } from '@lucide/svelte';
	import { goto } from '$app/navigation';

	let {
		open,
		onclose
	}: { open: boolean; onclose: () => void } = $props();

	let current = $state('');
	let next = $state('');
	let confirm = $state('');
	let error = $state<string | null>(null);
	let submitting = $state(false);

	async function onSubmit() {
		error = null;

		if (!current) {
			error = 'Enter your current password.';
			return;
		}
		if (next.length < 8) {
			error = 'New password must be at least 8 characters long.';
			return;
		}
		if (next !== confirm) {
			error = 'New passwords do not match.';
			return;
		}

		submitting = true;
		try {
			const res = await fetch('/api/auth/reset-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ currentPassword: current, newPassword: next, confirm })
			});

			if (res.ok) {
				onclose();
				goto('/');
				return;
			}

			const body = await res.json().catch(() => ({}));
			error = body.message ?? 'Could not change the password.';
		} catch {
			error = 'Could not reach the server.';
		} finally {
			submitting = false;
		}
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
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
				<h2 class="text-sm font-semibold">Change Password</h2>
				<button onclick={onclose} class="rounded p-1 text-slate-400 hover:bg-slate-700/60" aria-label="Close">
					<X size={16} />
				</button>
			</div>

			<form
				class="flex flex-col gap-3"
				onsubmit={(e) => {
					e.preventDefault();
					onSubmit();
				}}
			>
				<label class="block">
					<span class="mb-1 block text-xs text-slate-400">Current password</span>
					<input
						type="password"
						bind:value={current}
						autocomplete="current-password"
						class="w-full rounded-md border border-slate-700/50 bg-transparent px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500/50"
					/>
				</label>
				<label class="block">
					<span class="mb-1 block text-xs text-slate-400">New password</span>
					<input
						type="password"
						bind:value={next}
						autocomplete="new-password"
						class="w-full rounded-md border border-slate-700/50 bg-transparent px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500/50"
					/>
				</label>
				<label class="block">
					<span class="mb-1 block text-xs text-slate-400">Confirm new password</span>
					<input
						type="password"
						bind:value={confirm}
						autocomplete="new-password"
						class="w-full rounded-md border border-slate-700/50 bg-transparent px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500/50"
					/>
				</label>

				{#if error}
					<p class="rounded-md border border-red-500/40 bg-red-950/30 px-3 py-2 text-xs text-red-200">{error}</p>
				{/if}

				<div class="mt-2 flex justify-end gap-2">
					<button
						type="button"
						onclick={onclose}
						class="rounded-md border border-slate-700/50 px-3 py-1.5 text-sm text-slate-300 transition-all duration-150 hover:border-slate-500/50"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={submitting}
						class="flex items-center gap-1.5 rounded-md border border-slate-700/50 px-3 py-1.5 text-sm text-slate-200 transition-all duration-150 hover:border-slate-500/50 disabled:cursor-not-allowed disabled:opacity-60"
					>
						<KeyRound size={13} />
						{submitting ? 'Updating…' : 'Update'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}