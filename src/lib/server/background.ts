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

/**
 * Validates that `buffer` begins with the magic bytes of an allowed image
 * format. The browser-supplied `Content-Type` is untrusted, so we sniff the
 * actual file signature before storing anything.
 * Returns the matching MIME type, or `null` when the data is not a supported
 * image (or too short to inspect).
 */
export function sniffImageMime(buffer: Buffer): string | null {
	if (buffer.length < 12) return null;

	if (
		buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
	) {
		return 'image/jpeg';
	}

	if (
		buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e &&
		buffer[3] === 0x47 && buffer[4] === 0x0d && buffer[5] === 0x0a &&
		buffer[6] === 0x1a && buffer[7] === 0x0a
	) {
		return 'image/png';
	}

	if (
		buffer.toString('ascii', 0, 4) === 'RIFF' &&
		buffer.toString('ascii', 8, 12) === 'WEBP'
	) {
		return 'image/webp';
	}

	return null;
}

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