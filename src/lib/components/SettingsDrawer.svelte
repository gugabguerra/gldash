<script lang="ts">
	import { X, Upload, Trash2, RotateCcw, KeyRound } from '@lucide/svelte';
	import { dashboard } from '$lib/state/dashboard.svelte';
	import { BACKGROUND_DEFAULT_URL, backgroundModes, type BackgroundMode } from '$lib/types';
	import PasswordResetDialog from '$lib/components/PasswordResetDialog.svelte';

	let newCategoryName = $state('');
	let bgFileInput = $state<HTMLInputElement | null>(null);
	let passwordResetOpen = $state(false);

	const bgMode = $derived(dashboard.config.settings.theme.backgroundMode);
	const bgPreview = $derived(
		bgMode === 'custom'
			? dashboard.config.settings.theme.backgroundImage ?? null
			: bgMode === 'default'
				? BACKGROUND_DEFAULT_URL
				: null
	);

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

	async function onUploadBackground(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const formData = new FormData();
		formData.append('image', file);

		const response = await fetch('/api/background', {
			method: 'POST',
			body: formData
		});

		if (!response.ok) {
			const body = await response.json().catch(() => ({ message: 'Upload failed' }));
			dashboard.error = body.message ?? 'Failed to upload background image.';
			return;
		}

		const result = await response.json();
		if (result.url) {
			const theme = dashboard.config.settings.theme;
			theme.backgroundImage = result.url;
			theme.backgroundMode = 'custom';
			await dashboard.save();
		}
		input.value = '';
	}

	async function setBackgroundMode(mode: BackgroundMode) {
		if (mode === 'custom') {
			bgFileInput?.click();
			return;
		}

		const theme = dashboard.config.settings.theme;
		if (theme.backgroundImage) {
			// Clean up any previously uploaded image on the server.
			await fetch('/api/background', { method: 'DELETE' }).catch(() => {});
		}
		theme.backgroundImage = undefined;
		theme.backgroundMode = mode;
		await dashboard.save();
	}

	function onRestoreDefaults() {
		dashboard.confirm({
			title: 'Restore Default Styling?',
			message:
				'Reset theme colors and revert to the default background (config/default-bg.jpg). Layout and columns stay unchanged.',
			confirmLabel: 'Restore',
			cancelLabel: 'Cancel',
			destructive: true,
			onConfirm: () => {
				dashboard.resetTheme();
			}
		});
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

						<div>
							<span class="mb-2 block text-xs text-slate-400">Background Image</span>
							<input
								type="file"
								bind:this={bgFileInput}
								accept="image/*"
								class="hidden"
								onchange={onUploadBackground}
							/>
							<div class="flex gap-1 rounded-md border border-slate-700/50 p-1">
								{#each backgroundModes as mode}
									<button
										onclick={() => setBackgroundMode(mode)}
										class={`flex-1 rounded px-2 py-1 text-xs capitalize transition-all duration-150 ${bgMode === mode ? 'bg-slate-700/60 text-slate-100' : 'text-slate-400 hover:text-slate-200'}`}
									>
										{mode}
									</button>
								{/each}
							</div>

							{#if bgPreview}
								<div class="mt-2 flex items-center gap-2">
									<img
										src={bgPreview}
										alt="Background preview"
										class="h-12 w-12 rounded border border-slate-700/50 object-cover"
										onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
									/>
									<span class="text-xs opacity-75">
										{bgMode === 'default'
											? 'Using config/default-bg.jpg'
											: 'Custom upload'}
									</span>
									{#if bgMode === 'custom'}
										<button
											onclick={() => setBackgroundMode('solid')}
											class="flex items-center gap-1 rounded-md border border-red-500/50 px-2 py-1 text-xs text-red-300 transition-all duration-150 hover:bg-red-900/30"
										>
											<Trash2 size={12} /> Remove
										</button>
									{/if}
								</div>
							{:else}
								<p class="mt-2 text-xs opacity-75">
									{bgMode === 'solid' ? 'Using solid color + gradient overlay' : 'No image set'}
								</p>
							{/if}

							{#if bgMode === 'custom'}
								<button
									onclick={() => bgFileInput?.click()}
									class="mt-2 flex w-full items-center justify-center gap-1 rounded-md border border-slate-700/50 px-3 py-1.5 text-sm text-slate-300 transition-all duration-150 hover:border-slate-500/50"
								>
									<Upload size={12} /> Upload Image
								</button>
								<p class="mt-1 text-xs opacity-75">Max 5 MB • JPEG, PNG, WebP</p>
							{/if}
						</div>

						<div class="mt-1">
							<button
								onclick={onRestoreDefaults}
								class="flex w-full items-center justify-center gap-1 rounded-md border border-slate-700/50 px-3 py-1.5 text-xs text-slate-400 transition-all duration-150 hover:border-slate-500/50 hover:text-slate-200"
							>
								<RotateCcw size={12} /> Restore Default Styling
							</button>
						</div>
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

				<div class="mt-auto border-t border-slate-700/50 pt-4">
					<h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Account</h3>
					<button
						onclick={() => (passwordResetOpen = true)}
						class="flex w-full items-center justify-center gap-1.5 rounded-md border border-slate-700/50 px-3 py-2 text-sm text-slate-300 transition-all duration-150 hover:border-slate-500/50 hover:text-slate-200"
					>
						<KeyRound size={13} /> Change Password
					</button>
				</div>
			</div>

			<PasswordResetDialog open={passwordResetOpen} onclose={() => (passwordResetOpen = false)} />
		</div>
	</div>
{/if}
