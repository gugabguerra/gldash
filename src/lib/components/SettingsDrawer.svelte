<script lang="ts">
	import { X, KeyRound } from '@lucide/svelte';
	import { dashboard } from '$lib/state/dashboard.svelte';
	import PasswordResetDialog from '$lib/components/PasswordResetDialog.svelte';
	import AppNameDialog from '$lib/components/AppNameDialog.svelte';
	import AddCategoryForm from '$lib/components/AddCategoryForm.svelte';
	import LayoutSettings from '$lib/components/LayoutSettings.svelte';
	import AppearanceSettings from '$lib/components/AppearanceSettings.svelte';

	let passwordResetOpen = $state(false);
	let appNameOpen = $state(false);

	function onClose() {
		dashboard.closeSettings();
	}
</script>

{#if dashboard.settingsOpen}
	<div
		class="fixed inset-0 z-50 flex justify-end bg-black/60"
		role="presentation"
		onclick={onClose}
		onkeydown={(e) => e.key === 'Escape' && onClose()}
	>
		<div
			class="flex h-full w-full max-w-sm flex-col border-l border-slate-700/50 bg-[var(--gl-card-background)] p-5"
			role="dialog"
			aria-modal="true"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<div class="mb-5 flex shrink-0 items-center justify-between">
				<h2 class="text-sm font-semibold">Settings</h2>
				<button onclick={onClose} class="rounded p-1 text-slate-400 hover:bg-slate-700/60" aria-label="Close">
					<X size={16} />
				</button>
			</div>

			<!--
				`-mr-3 pr-3` carves a gutter for the scrollbar out of the drawer's own
				padding. Without it the scrollbar overlays the content once the panel
				overflows, clipping the colour hex values and the Change button.
			-->
			<div
				class="-mr-3 flex min-h-0 flex-1 flex-col divide-y divide-slate-700/50 overflow-y-auto pr-3"
			>
				<!-- Add Category -->
				<div class="border-b border-slate-700/50 pb-5">
					<h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Add Category</h3>
					<AddCategoryForm />
				</div>

				<!-- Layout -->
				<div class="py-5">
					<h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Layout</h3>
					<LayoutSettings />
				</div>

				<!-- Appearance -->
				<div class="py-5">
					<h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Appearance</h3>
					<AppearanceSettings />
				</div>

				<!-- Dashboard -->
				<div class="py-5">
					<h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Dashboard</h3>
					<div class="flex items-center justify-between gap-2">
						<span class="truncate text-sm text-slate-200">{dashboard.config.settings.appName}</span>
						<button
							onclick={() => (appNameOpen = true)}
							class="rounded-md border border-slate-700/50 px-3 py-1.5 text-sm text-slate-300 transition-all duration-150 hover:border-slate-500/50 hover:text-slate-200"
						>
							Change
						</button>
					</div>
				</div>

				<!-- Account -->
				<div class="py-5">
					<h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Account</h3>
					<button
						onclick={() => (passwordResetOpen = true)}
						class="flex w-full items-center justify-center gap-1.5 rounded-md border border-slate-700/50 px-3 py-2 text-sm text-slate-300 transition-all duration-150 hover:border-slate-500/50 hover:text-slate-200"
					>
						<KeyRound size={13} /> Change Password
					</button>
				</div>
			</div>

			<PasswordResetDialog open={passwordResetOpen} onclose={() => (passwordResetOpen = false)} />
			<AppNameDialog open={appNameOpen} onclose={() => (appNameOpen = false)} />
		</div>
	</div>
{/if}
