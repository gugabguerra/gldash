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
