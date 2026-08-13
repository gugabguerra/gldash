<script lang="ts">
	import { goto } from '$app/navigation';
	import { Eye, EyeOff, Lock } from '@lucide/svelte';

	let { data } = $props();

	const needsSetup = $derived(data.needsSetup);

	let password = $state('');
	let confirm = $state('');
	let show = $state(false);
	let error = $state<string | null>(null);
	let submitting = $state(false);

	async function onSubmit() {
		error = null;

		if (!password) {
			error = needsSetup ? 'Enter an admin password.' : 'Enter your password.';
			return;
		}
		if (needsSetup) {
			if (password.length < 8) {
				error = 'Password must be at least 8 characters long.';
				return;
			}
			if (password !== confirm) {
				error = 'Passwords do not match.';
				return;
			}
		}

		submitting = true;
		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password })
			});

			if (res.ok) {
				goto('/');
				return;
			}

			const body = await res.json().catch(() => ({}));
			error = body.message ?? 'Something went wrong. Please try again.';
		} catch {
			error = 'Could not reach the server. Please try again.';
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>{needsSetup ? 'Set Password' : 'Sign In'} — GLdash</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-slate-950 p-4">
	<div class="w-full max-w-sm">
		<div class="mb-8 text-center">
			<div
				class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-slate-700/50 bg-slate-900"
			>
				<img src="/android-chrome-192x192.png" alt="GLdash logo" class="h-9 w-9 rounded-lg" />
			</div>
			<h1 class="text-xl font-bold tracking-tight">GLdash</h1>
			<p class="mt-1 text-sm text-slate-400">{needsSetup ? 'Create your admin password' : 'Sign in to your dashboard'}</p>
		</div>

		<form
			onsubmit={(e) => {
				e.preventDefault();
				onSubmit();
			}}
			class="space-y-4"
		>
			<label class="block">
				<span class="mb-1.5 block text-xs font-medium text-slate-400">
					{needsSetup ? 'New password' : 'Password'}
				</span>
				<span class="relative block">
					<Lock size={15} class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
					<input
						type={show ? 'text' : 'password'}
						bind:value={password}
						autocomplete="current-password"
						placeholder="••••••••"
						class="w-full rounded-lg border border-slate-700/50 bg-slate-900 py-2.5 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all duration-150 focus:border-slate-500/60"
					/>
					<button
						type="button"
						onclick={() => (show = !show)}
						class="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 transition-colors duration-150 hover:text-slate-300"
						aria-label="Toggle password visibility"
					>
						{#if show}
							<EyeOff size={15} />
						{:else}
							<Eye size={15} />
						{/if}
					</button>
				</span>
			</label>

			{#if needsSetup}
				<label class="block">
					<span class="mb-1.5 block text-xs font-medium text-slate-400">Confirm password</span>
					<span class="relative block">
						<Lock size={15} class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
						<input
							type={show ? 'text' : 'password'}
							bind:value={confirm}
							autocomplete="new-password"
							placeholder="••••••••"
							class="w-full rounded-lg border border-slate-700/50 bg-slate-900 py-2.5 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all duration-150 focus:border-slate-500/60"
						/>
					</span>
				</label>
			{/if}

			{#if error}
				<p class="rounded-md border border-red-500/40 bg-red-950/30 px-3 py-2 text-xs text-red-200">{error}</p>
			{/if}

			<button
				type="submit"
				disabled={submitting}
				class="w-full rounded-lg bg-slate-100 py-2.5 text-sm font-semibold text-slate-900 transition-all duration-150 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
			>
				{submitting ? 'Please wait…' : needsSetup ? 'Set Password' : 'Sign In'}
			</button>
		</form>

		{#if !needsSetup}
			<p class="mt-6 text-center text-xs opacity-60">
				Forgot it? Empty <code class="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-[11px]">auth.adminPasswordHash</code> in config.yaml.
			</p>
		{/if}
	</div>
</div>