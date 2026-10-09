// Type-only import: erased at build, so this file stays dependency-free and
// safe to call during SSR.
import type { Density, Structure } from '$lib/types';

/**
 * Number of items each column receives when `itemCount` items are distributed
 * sequentially: the first `itemCount % columns` columns take one extra item, so
 * earlier columns are never shorter than later ones. Shared by `splitEvenly`
 * and `reorderForDrop` so the layout and the drop math can never disagree.
 */
function columnSizes(itemCount: number, columns: number): number[] {
	const numColumns = Math.max(1, Math.floor(columns));
	const base = Math.floor(itemCount / numColumns);
	const remainder = itemCount % numColumns;

	return Array.from({ length: numColumns }, (_, col) => base + (col < remainder ? 1 : 0));
}

/**
 * Splits items into `columns` sequential chunks of near-equal COUNT.
 *
 * @param items Read-only array of items to split.
 * @param columns Number of columns; clamped to a minimum of 1.
 * @returns An array of exactly `columns` arrays, even if trailing ones are empty.
 *          Remainder is distributed to the earliest columns, so earlier columns
 *          are never shorter than later ones (e.g. 9 items into 4 columns -> 3,2,2,2).
 */
export function splitEvenly<T>(items: readonly T[], columns: number): T[][] {
	const result: T[][] = [];
	let start = 0;

	for (const size of columnSizes(items.length, columns)) {
		result.push(items.slice(start, start + size));
		start += size;
	}

	return result;
}

/**
 * Reorders `items` after one of them was dropped into `targetColumn` at
 * `targetIndex` (its position within that column's visible list).
 *
 * Columns are sequential chunks of the flat list, so where an item ends up is
 * decided entirely by its index. A drop that leaves the columns unequal cannot
 * be represented as-is — re-splitting would snap the item to a different
 * column. Mapping the drop back to the flat index inside the target column's
 * share keeps the item exactly where it was dropped; neighbouring items absorb
 * the rebalance.
 *
 * @param items Flat list in its pre-drop order.
 * @param draggedId Id of the item that was dragged.
 * @param targetColumn Zero-based column the item was dropped into.
 * @param targetIndex Zero-based position the item was dropped at within that column.
 * @param columns Number of columns; clamped to a minimum of 1.
 * @param getId Reads an item's id.
 * @returns A new flat list; the input is not mutated.
 */
export function reorderForDrop<T>(
	items: readonly T[],
	draggedId: string,
	targetColumn: number,
	targetIndex: number,
	columns: number,
	getId: (item: T) => string
): T[] {
	const dragged = items.find((item) => getId(item) === draggedId);
	if (!dragged) return [...items];

	const sizes = columnSizes(items.length, columns);
	const col = Math.min(Math.max(0, Math.floor(targetColumn)), sizes.length - 1);
	const start = sizes.slice(0, col).reduce((sum, size) => sum + size, 0);

	// Clamp to the target column's share (0 for an empty trailing column) so a
	// drop near a boundary cannot spill into a neighbour once the list re-splits.
	const offset = Math.min(Math.max(0, Math.floor(targetIndex)), Math.max(0, sizes[col] - 1));

	const rest = items.filter((item) => item !== dragged);
	rest.splice(Math.min(start + offset, rest.length), 0, dragged);

	return rest;
}

/**
 * Returns how many apps sit side by side *within one category*, given structure,
 * density, and the user's columns setting.
 *
 * A category's effective width depends on structure:
 * - board / panel: occupies 1/columns of the page width.
 * - wall: occupies full page width.
 *
 * Rules per structure:
 * - board / panel (narrow):
 *   - rows: 1
 *   - cards: 2 when columns <= 2, else 1
 *   - tiles: 4 when columns <= 2, else 2 when columns <= 4, else 1
 * - wall (full width):
 *   - rows: 1
 *   - cards: columns
 *   - tiles: columns * 2
 *
 * All results are clamped to at least 1.
 *
 * @param structure The dashboard structure: board, panel, or wall.
 * @param density The app rendering density: rows, cards, or tiles.
 * @param columns The user's global columns setting (2-6).
 * @returns Number of apps per row; never less than 1.
 */
export function innerColumns(structure: Structure, density: Density, columns: number): number {
	const numColumns = Math.max(1, Math.floor(columns));

	if (structure === 'wall') {
		// Full-width categories: scale with global columns
		if (density === 'rows') return 1;
		if (density === 'tiles') return numColumns * 2;
		return numColumns; // cards
	}

	// board / panel: categories occupy 1/columns of the page
	if (density === 'rows') return 1;
	if (density === 'tiles') {
		if (numColumns <= 2) return 4;
		if (numColumns <= 4) return 2;
		return 1;
	}
	// cards
	if (numColumns <= 2) return 2;
	return 1;
}
