import { readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

/** Allowed image MIME types mapped to their file extensions. */
export const ALLOWED: Record<string, string> = {
	'image/jpeg': '.jpg',
	'image/png': '.png',
	'image/webp': '.webp'
};

/** Maximum accepted image size — 5 MB. */
export const MAX_SIZE = 5 * 1024 * 1024;

/** Directory where background images are stored (relative to the project root). */
export function getBackgroundsDir(): string {
	return path.join(process.cwd(), 'static', 'backgrounds');
}

/** Returns the path to the single stored background file, or `null` if none exists. */
export async function getBackgroundFile(): Promise<string | null> {
	const dir = getBackgroundsDir();
	if (!existsSync(dir)) return null;
	const files = await readdir(dir);
	const bgFile = files.find((f) => f.startsWith('bg-'));
	return bgFile ? path.join(dir, bgFile) : null;
}

/** Maps a file extension (without the leading dot) to its image MIME type. */
export function mimeForExtension(ext: string): string {
	const mime: Record<string, string> = {
		jpg: 'image/jpeg',
		jpeg: 'image/jpeg',
		png: 'image/png',
		webp: 'image/webp'
	};
	return mime[ext.toLowerCase()] ?? 'application/octet-stream';
}