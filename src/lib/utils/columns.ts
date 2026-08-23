// Type-only import: erased at build, so this file stays dependency-free and
// safe to call during SSR.
import type { Density } from '$lib/types';

/**
 * Distributes items into `columns` buckets, always appending to the shortest
 * bucket so the columns end up close to equal height. Input order is preserved
 * within each bucket. Used in view mode.
 *
 * @param items Read-only array of items to distribute.
 * @param columns Number of columns; clamped to a minimum of 1.
 * @param estimate Function that returns the height of an item.
 * @returns An array of exactly `columns` arrays, even if trailing ones are empty.
 *          On ties (multiple columns with the same minimum height), picks the
 *          leftmost column, ensuring deterministic left-to-right fill.
 */
export function packColumns<T>(
	items: readonly T[],
	columns: number,
	estimate: (item: T) => number
): T[][] {
	const numColumns = Math.max(1, Math.floor(columns));

	// Initialize empty columns and track their heights.
	const result: T[][] = Array.from({ length: numColumns }, () => []);
	const heights: number[] = Array(numColumns).fill(0);

	// Greedily pack each item into the shortest column.
	for (const item of items) {
		const itemHeight = estimate(item);

		// Find the column with the minimum height (leftmost on tie).
		let minIdx = 0;
		for (let i = 1; i < numColumns; i++) {
			if (heights[i] < heights[minIdx]) {
				minIdx = i;
			}
		}

		result[minIdx].push(item);
		heights[minIdx] += itemHeight;
	}

	return result;
}

/**
 * Splits items into `columns` sequential chunks of near-equal COUNT.
 * Geometry stays put while the user drags, so this is used in edit mode.
 *
 * @param items Read-only array of items to split.
 * @param columns Number of columns; clamped to a minimum of 1.
 * @returns An array of exactly `columns` arrays, even if trailing ones are empty.
 *          Remainder is distributed to the earliest columns, so earlier columns
 *          are never shorter than later ones (e.g. 9 items into 4 columns -> 3,2,2,2).
 */
export function splitEvenly<T>(items: readonly T[], columns: number): T[][] {
	const numColumns = Math.max(1, Math.floor(columns));

	// Initialize empty columns.
	const result: T[][] = Array.from({ length: numColumns }, () => []);

	// Calculate base size and remainder.
	const base = Math.floor(items.length / numColumns);
	const remainder = items.length % numColumns;

	// Distribute items sequentially, giving first `remainder` columns an extra item.
	let itemIndex = 0;
	for (let col = 0; col < numColumns; col++) {
		const size = col < remainder ? base + 1 : base;
		for (let i = 0; i < size; i++) {
			if (itemIndex < items.length) {
				result[col].push(items[itemIndex++]);
			}
		}
	}

	return result;
}

/**
 * Returns how many apps sit side by side *within one category*, given a density
 * and the user's columns setting.
 *
 * Rules:
 * - `rows`: always 1 — a row is a full-width line by definition.
 * - `cards`: up to 2, so a card keeps enough width for its title and host.
 * - `tiles`: up to 4, since a tile is roughly a quarter the width of a card.
 *
 * NOTE: this is currently tuned for the category grid in `+page.svelte`, where
 * a category occupies half the page. Once `structure` drives the arrangement,
 * a category's width becomes 1/columns (board, panel) or full width (wall), and
 * this needs `structure` as a third input to stay correct.
 *
 * @param density The app rendering density: rows, cards, or tiles.
 * @param columns The user's global columns setting (2-6).
 * @returns Number of apps per row; never less than 1.
 */
export function innerColumns(density: Density, columns: number): number {
	const available = Math.max(1, Math.floor(columns));
	if (density === 'rows') return 1;
	if (density === 'tiles') return Math.min(available, 4);
	return Math.min(available, 2);
}
