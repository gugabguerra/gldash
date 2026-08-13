<script lang="ts">
	import { ChevronDown } from '@lucide/svelte';
	import AppIcon from './AppIcon.svelte';

	interface IconOption {
		group: 'lucide' | 'simple-icons';
		slug: string;
		value: string;
	}

	let {
		value = $bindable(''),
		label = 'Icon',
		hint = '',
		placeholder = 'lucide:name or simple-icons:slug'
	}: {
		value?: string;
		label?: string;
		hint?: string;
		placeholder?: string;
	} = $props();

	let allOptions = $state<IconOption[]>([]);
	let open = $state(false);
	let activeIndex = $state(0);
	let loading = $state(true);
	let loadError = $state(false);

	$effect(() => {
		let cancelled = false;

		fetch('/api/icons')
			.then((response) => {
				if (!response.ok) throw new Error('Failed to load icons');
				return response.json();
			})
			.then((data: { lucide: string[]; 'simple-icons': string[] }) => {
				if (cancelled) return;
				allOptions = [
					...data.lucide.map(
						(slug): IconOption => ({ group: 'lucide', slug, value: `lucide:${slug}` })
					),
					...data['simple-icons'].map(
						(slug): IconOption => ({ group: 'simple-icons', slug, value: `simple-icons:${slug}` })
					)
				];
			})
			.catch(() => {
				if (!cancelled) loadError = true;
			})
			.finally(() => {
				if (!cancelled) loading = false;
			});

		return () => {
			cancelled = true;
		};
	});

	const query = $derived(
		value.trim().replace(/^(lucide|simple-icons):/, '').toLowerCase()
	);
	const isUrlQuery = $derived(/^(https?:\/\/|\/)/i.test(value.trim()));

	const suggestions = $derived.by<IconOption[]>(() => {
		if (!query) return allOptions;
		if (isUrlQuery) return [];
		return allOptions
			.map((option) => ({
				option,
				rank: option.slug.startsWith(query) ? 0 : option.slug.includes(query) ? 1 : -1
			}))
			.filter((entry) => entry.rank >= 0)
			.sort((a, b) => a.rank - b.rank || a.option.slug.localeCompare(b.option.slug))
			.map((entry) => entry.option);
	});

	$effect(() => {
		if (activeIndex >= suggestions.length) {
			activeIndex = Math.max(0, suggestions.length - 1);
		}
	});

	const showDropdown = $derived(open && suggestions.length > 0);

	function select(option: IconOption) {
		value = option.value;
		open = false;
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			open = true;
			activeIndex = Math.min(activeIndex + 1, suggestions.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			activeIndex = Math.max(activeIndex - 1, 0);
		} else if (e.key === 'Enter') {
			if (showDropdown && suggestions[activeIndex]) {
				e.preventDefault();
				select(suggestions[activeIndex]);
			}
		} else if (e.key === 'Escape') {
			open = false;
		} else if (e.key === 'Tab') {
			open = false;
		}
	}
</script>

<label class="flex flex-col gap-1 text-xs text-slate-400">
	{label} {#if hint}<span class="opacity-60">({hint})</span>{/if}
	<div class="relative">
		<input
			bind:value
			{placeholder}
			onfocus={() => (open = true)}
			onclick={() => (open = true)}
			onblur={() => (open = false)}
			onkeydown={onKeydown}
			role="combobox"
			aria-expanded={showDropdown}
			aria-autocomplete="list"
			aria-controls="icon-dropdown"
			class="w-full rounded-md border border-slate-700/50 bg-transparent px-3 py-1.5 pr-16 text-sm text-slate-100 outline-none focus:border-slate-500/50"
		/>
		<span class="pointer-events-none absolute inset-y-0 right-8 flex items-center">
			<AppIcon icon={value} url="" size={16} />
		</span>
		<span class="pointer-events-none absolute inset-y-0 right-2 flex items-center text-slate-500">
			<ChevronDown size={14} />
		</span>

		{#if showDropdown}
			<ul
				id="icon-dropdown"
				role="listbox"
				class="absolute inset-x-0 top-full z-10 mt-1 max-h-96 overflow-y-auto rounded-md border border-slate-700/50 bg-[var(--gl-card-background)] shadow-lg"
				onmousedown={(e) => e.preventDefault()}
			>
				{#each suggestions as option, index (option.value)}
					<li role="option" aria-selected={index === activeIndex}>
						<button
							type="button"
							onclick={() => select(option)}
							onmousemove={() => (activeIndex = index)}
							class={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors duration-150 ${
								index === activeIndex ? 'bg-slate-700/40 text-slate-100' : 'text-slate-300'
							}`}
						>
							<AppIcon icon={option.value} url="" size={16} />
							<span class="flex-1 truncate">{option.slug}</span>
							<span class="text-[10px] uppercase tracking-wide text-slate-500">{option.group}</span>
						</button>
					</li>
				{/each}
			</ul>
		{:else if open && loading}
			<p class="absolute top-full mt-1 text-xs text-slate-500">Loading icons…</p>
		{:else if open && loadError}
			<p class="absolute top-full mt-1 text-xs text-amber-400/80">Couldn't load icons — check the server.</p>
		{/if}
	</div>
</label>