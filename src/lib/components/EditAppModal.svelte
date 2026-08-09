<script lang="ts">
	import { X } from '@lucide/svelte';
	import { dashboard } from '$lib/state/dashboard.svelte';
	import type { App } from '$lib/types';
	import IconCombobox from './IconCombobox.svelte';

	const ref = $derived(dashboard.editingApp);
	const app = $derived.by<App | null>(() => {
		if (!ref) return null;
		return dashboard.config.categories[ref.categoryIndex]?.apps[ref.appIndex] ?? null;
	});

	let form = $state({ title: '', url: '', icon: '', note: '', githubRepo: '', dockerImage: '' });

	$effect(() => {
		if (app) {
			form = {
				title: app.title,
				url: app.url,
				icon: app.icon ?? '',
				note: app.note ?? '',
				githubRepo: app.githubRepo ?? '',
				dockerImage: app.dockerImage ?? ''
			};
		}
	});

	function onClose() {
		dashboard.stopEditingApp();
	}

	async function onSave() {
		if (!ref) return;
		await dashboard.updateApp(ref, {
			title: form.title,
			url: form.url,
			icon: form.icon,
			note: form.note,
			githubRepo: form.githubRepo || undefined,
			dockerImage: form.dockerImage || undefined
		});
		onClose();
	}

	function onDelete() {
		if (!ref) return;
		dashboard.removeApp(ref);
		onClose();
	}
</script>

{#if ref && app}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
		role="presentation"
		onclick={onClose}
		onkeydown={(e) => e.key === 'Escape' && onClose()}
	>
		<div
			class="w-full max-w-md rounded-lg border border-slate-700/50 bg-[var(--gl-card-background)] p-5"
			role="dialog"
			aria-modal="true"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-sm font-semibold">Edit App</h2>
				<button onclick={onClose} class="rounded p-1 text-slate-400 hover:bg-slate-700/60" aria-label="Close">
					<X size={16} />
				</button>
			</div>

			<div class="flex flex-col gap-3">
				<label class="flex flex-col gap-1 text-xs text-slate-400">
					Title
					<input
						bind:value={form.title}
						class="rounded-md border border-slate-700/50 bg-transparent px-3 py-1.5 text-sm text-slate-100 outline-none focus:border-slate-500/50"
					/>
				</label>
				<label class="flex flex-col gap-1 text-xs text-slate-400">
					URL
					<input
						bind:value={form.url}
						class="rounded-md border border-slate-700/50 bg-transparent px-3 py-1.5 text-sm text-slate-100 outline-none focus:border-slate-500/50"
					/>
				</label>
				<IconCombobox
					bind:value={form.icon}
					label="Icon"
					hint="lucide:name, simple-icons:slug, or image URL"
					placeholder="simple-icons:pihole"
				/>
				<label class="flex flex-col gap-1 text-xs text-slate-400">
					Note
					<input
						bind:value={form.note}
						class="rounded-md border border-slate-700/50 bg-transparent px-3 py-1.5 text-sm text-slate-100 outline-none focus:border-slate-500/50"
					/>
				</label>
				<label class="flex flex-col gap-1 text-xs text-slate-400">
					GitHub Repo <span class="opacity-60">(owner/repo)</span>
					<input
						bind:value={form.githubRepo}
						placeholder="pi-hole/pi-hole"
						class="rounded-md border border-slate-700/50 bg-transparent px-3 py-1.5 text-sm text-slate-100 outline-none focus:border-slate-500/50"
					/>
				</label>
				<label class="flex flex-col gap-1 text-xs text-slate-400">
					Docker Image
					<input
						bind:value={form.dockerImage}
						placeholder="pihole/pihole"
						class="rounded-md border border-slate-700/50 bg-transparent px-3 py-1.5 text-sm text-slate-100 outline-none focus:border-slate-500/50"
					/>
				</label>
			</div>

			<div class="mt-5 flex items-center justify-between">
				<button onclick={onDelete} class="text-xs text-red-400/80 hover:text-red-300">Delete app</button>
				<div class="flex gap-2">
					<button
						onclick={onClose}
						class="rounded-md border border-slate-700/50 px-3 py-1.5 text-sm text-slate-300 transition-all duration-150 hover:border-slate-500/50"
					>
						Cancel
					</button>
					<button
						onclick={onSave}
						class="rounded-md border border-emerald-500/50 px-3 py-1.5 text-sm text-emerald-300 transition-all duration-150 hover:bg-emerald-500/10"
					>
						Save
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
