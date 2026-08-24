<script lang="ts">
	import { dashboard } from '$lib/state/dashboard.svelte';
	import { densityOptions, structureOptions, type Structure, type Density } from '$lib/constants';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';
	import StructurePicker from '$lib/components/StructurePicker.svelte';

	function onStructureChange(value: Structure) {
		dashboard.config.settings.structure = value;
		dashboard.save();
	}

	function onDensityChange(value: Density) {
		dashboard.config.settings.density = value;
		dashboard.save();
	}

	function onColumnsChange(value: string) {
		const col = Number(value);
		dashboard.config.settings.columns = col;
		dashboard.save();
	}
</script>

<div class="flex flex-col gap-4">
	<!-- Structure -->
	<div>
		<div id="structure-label" class="mb-2 block text-xs text-slate-400">Structure</div>
		<div aria-labelledby="structure-label">
			<StructurePicker value={dashboard.config.settings.structure} onchange={onStructureChange} />
		</div>
	</div>

	<!-- Density -->
	<div>
		<div id="density-label" class="mb-2 block text-xs text-slate-400">Density</div>
		<div aria-labelledby="density-label">
			<SegmentedControl
				value={dashboard.config.settings.density}
				options={densityOptions}
				onchange={(value) => onDensityChange(value as Density)}
				labels={{ rows: 'Rows', cards: 'Cards', tiles: 'Tiles' }}
			/>
		</div>
	</div>

	<!-- Columns -->
	<div>
		<div id="columns-label" class="mb-2 block text-xs text-slate-400">Columns</div>
		<div aria-labelledby="columns-label">
			<SegmentedControl
				value={String(dashboard.config.settings.columns)}
				options={['2', '3', '4', '5', '6']}
				onchange={onColumnsChange}
				labels={{}}
			/>
		</div>
	</div>
</div>
