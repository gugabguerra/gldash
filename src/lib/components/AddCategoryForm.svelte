<script lang="ts">
	import { Plus } from '@lucide/svelte';
	import { dashboard } from '$lib/state/dashboard.svelte';

	let newCategoryName = $state('');
	let submitting = $state(false);

	const canSubmit = $derived(newCategoryName.trim().length > 0 && !submitting);

	async function onAddCategory() {
		const name = newCategoryName.trim();
		if (!name || submitting) return;

		submitting = true;
		try {
			await dashboard.addCategory(name);
			newCategoryName = '';
		} finally {
			submitting = false;
		}
	}
</script>

<!--
	Lives on the board rather than in Settings, next to the categories it creates
	and alongside the per-category Add App / Remove controls. Only rendered in
	edit mode, by +page.svelte, so it appears once regardless of structure.
-->
<form
	class="mt-8 flex max-w-md items-center gap-2 rounded-lg border border-dashed border-slate-700/50 p-2 transition-all duration-150 focus-within:border-slate-500/50"
	onsubmit={(e) => {
		e.preventDefault();
		onAddCategory();
	}}
>
	<label class="sr-only" for="new-category">New category name</label>
	<input
		id="new-category"
		bind:value={newCategoryName}
		placeholder="New category name"
		disabled={submitting}
		class="flex-1 bg-transparent px-2 py-1.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 disabled:opacity-60"
	/>
	<button
		type="submit"
		disabled={!canSubmit}
		class="flex items-center gap-1.5 rounded-md border border-slate-700/50 px-3 py-1.5 text-sm text-slate-300 transition-all duration-150 hover:border-slate-500/50 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-700/50"
	>
		<Plus size={14} />
		{submitting ? 'Adding…' : 'Add category'}
	</button>
</form>
