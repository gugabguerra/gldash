<script lang="ts">
	import { dashboard } from '$lib/state/dashboard.svelte';

	let newCategoryName = $state('');

	async function onAddCategory() {
		const name = newCategoryName.trim();
		if (!name) return;
		await dashboard.addCategory(name);
		newCategoryName = '';
	}
</script>

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
