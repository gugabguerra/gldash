<script lang="ts">
	import { X } from '@lucide/svelte';
	import { dashboard } from '$lib/state/dashboard.svelte';

	let newCategoryName = $state('');

	function onClose() {
		dashboard.closeSettings();
	}

	function onThemeChange() {
		dashboard.save();
	}

	function onColumnsChange(e: Event) {
		const value = Number((e.target as HTMLInputElement).value);
		dashboard.config.settings.columns = value;
		dashboard.save();
	}

	async function onAddCategory() {
		const name = newCategoryName.trim();
		if (!name) return;
		await dashboard.addCategory(name);
		newCategoryName = '';
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
			class="h-full w-full max-w-sm border-l border-slate-700/50 bg-[var(--gl-card-background)] p-5"
			role="dialog"
			aria-modal="true"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<div class="mb-5 flex items-center justify-between">
				<h2 class="text-sm font-semibold">Settings</h2>
				<button onclick={onClose} class="rounded p-1 text-slate-400 hover:bg-slate-700/60" aria-label="Close">
					<X size={16} />
				</button>
			</div>

			<div class="flex flex-col gap-6">
				<div>
					<h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Grid Columns</h3>
					<input
						type="range"
						min="2"
						max="6"
						value={dashboard.config.settings.columns}
						oninput={onColumnsChange}
						class="w-full"
					/>
					<p class="mt-1 text-xs opacity-75">{dashboard.config.settings.columns} columns</p>
				</div>

				<div>
					<h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Theme</h3>
					<div class="flex flex-col gap-3">
						<label class="flex items-center justify-between text-xs text-slate-400">
							Background
							<input
								type="color"
								bind:value={dashboard.config.settings.theme.background}
								onchange={onThemeChange}
								class="h-7 w-14 cursor-pointer rounded border border-slate-700/50 bg-transparent"
							/>
						</label>
						<label class="flex items-center justify-between text-xs text-slate-400">
							Text Color
							<input
								type="color"
								bind:value={dashboard.config.settings.theme.textColor}
								onchange={onThemeChange}
								class="h-7 w-14 cursor-pointer rounded border border-slate-700/50 bg-transparent"
							/>
						</label>
						<label class="flex items-center justify-between text-xs text-slate-400">
							Card Background
							<input
								type="color"
								bind:value={dashboard.config.settings.theme.cardBackground}
								onchange={onThemeChange}
								class="h-7 w-14 cursor-pointer rounded border border-slate-700/50 bg-transparent"
							/>
						</label>
					</div>
				</div>

				<div>
					<h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Add Category</h3>
					<form class="flex gap-2" onsubmit={(e) => { e.preventDefault(); onAddCategory(); }}>
						<input
							bind:value={newCategoryName}
							placeholder="Category name"
							class="flex-1 rounded-md border border-slate-700/50 bg-transparent px-3 py-1.5 text-sm text-slate-100 outline-none focus:border-slate-500/50"
						/>
						<button
							type="submit"
							class="rounded-md border border-slate-700/50 px-3 py-1.5 text-sm text-slate-300 transition-all duration-150 hover:border-slate-500/50"
						>
							Add
						</button>
					</form>
				</div>
			</div>
		</div>
	</div>
{/if}
