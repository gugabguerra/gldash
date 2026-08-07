import { json, type RequestHandler } from '@sveltejs/kit';
import { writeFile, mkdir, unlink, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { ALLOWED, MAX_SIZE, getBackgroundsDir } from '$lib/server/background';

/**
 * POST /api/background
 *
 * Accepts a single image file (multipart/form-data field name: `image`),
 * stores it under /static/backgrounds/ (overwriting any previous background),
 * and returns the URL that can be used in CSS.
 */
export const POST: RequestHandler = async ({ request }) => {
	const contentType = request.headers.get('content-type') ?? '';
	if (!contentType.includes('multipart/form-data')) {
		return json({ message: 'Request must be multipart/form-data.' }, { status: 400 });
	}

	const formData = await request.formData();
	const file = formData.get('image');

	if (!file || !(file instanceof File) || !file.size) {
		return json({ message: 'No image file provided.' }, { status: 400 });
	}

	if (file.size > MAX_SIZE) {
		return json({ message: `Image must be smaller than ${MAX_SIZE / 1024 / 1024} MB.` }, { status: 400 });
	}

	const ext = ALLOWED[file.type];
	if (!ext) {
		return json({ message: 'Unsupported image type. Use JPEG, PNG, or WebP.' }, { status: 400 });
	}

	const dir = getBackgroundsDir();

	try {
		if (!existsSync(dir)) {
			await mkdir(dir, { recursive: true });
		}
	} catch (err) {
		return json({ message: `Could not create backgrounds directory: ${(err as Error).message}` }, { status: 500 });
	}

	// Remove any existing background file(s) so only the latest remains.
	try {
		const existing = await readdir(dir);
		await Promise.all(
			existing
				.filter((f) => f.startsWith('bg-'))
				.map((f) => unlink(path.join(dir, f)).catch(() => {}))
		);
	} catch {
		/* directory was just created; ignore */
	}

	const buffer = Buffer.from(await file.arrayBuffer());
	const filename = `bg-${Date.now()}${ext}`;
	const filepath = path.join(dir, filename);

	try {
		await writeFile(filepath, buffer);
	} catch (err) {
		return json({ message: `Failed to write background image: ${(err as Error).message}` }, { status: 500 });
	}

	// Return the API URL so the browser always fetches via the server,
	// ensuring it works in both dev and production (adapter-node).
	return json({ url: '/api/background/image' });
};

/**
 * DELETE /api/background
 *
 * Removes the currently stored background image file (if any).
 */
export const DELETE: RequestHandler = async () => {
	const dir = getBackgroundsDir();
	if (!existsSync(dir)) {
		return json({ url: null });
	}

	try {
		const files = await readdir(dir);
		await Promise.all(
			files
				.filter((f) => f.startsWith('bg-'))
				.map((f) => unlink(path.join(dir, f)).catch(() => {}))
		);
	} catch (err) {
		return json({ message: `Failed to clean background images: ${(err as Error).message}` }, { status: 500 });
	}

	return json({ url: null });
};
