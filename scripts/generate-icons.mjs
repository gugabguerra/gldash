import sharp from 'sharp';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pngToIco from 'png-to-ico';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC_SVG = join(ROOT, 'static', 'logo.svg');
const OUT_DIR = join(ROOT, 'static');

const SIZES = [16, 32, 48, 192, 512];
const APPLE_SIZE = 180;

async function main() {
	if (!existsSync(SRC_SVG)) {
		console.error(`Source SVG not found: ${SRC_SVG}`);
		process.exit(1);
	}
	if (!existsSync(OUT_DIR)) {
		mkdirSync(OUT_DIR, { recursive: true });
	}

	const svgRaw = readFileSync(SRC_SVG);

	// Generate all PNG sizes
	for (const size of SIZES) {
		const pngPath = join(OUT_DIR, `android-chrome-${size}x${size}.png`);
		await sharp(svgRaw, { density: size * 4 })
			.resize(size, size, { fit: 'contain' })
			.png()
			.toFile(pngPath);
		console.log(`Generated ${pngPath}`);
	}

	// Generate favicon variants
	const fav32Buf = await sharp(svgRaw, { density: 120 })
		.resize(32, 32, { fit: 'contain' })
		.png()
		.toBuffer();
	writeFileSync(join(OUT_DIR, 'favicon-32x32.png'), fav32Buf);
	console.log(`Generated ${join(OUT_DIR, 'favicon-32x32.png')}`);

	const fav16Buf = await sharp(svgRaw, { density: 60 })
		.resize(16, 16, { fit: 'contain' })
		.png()
		.toBuffer();
	writeFileSync(join(OUT_DIR, 'favicon-16x16.png'), fav16Buf);
	console.log(`Generated ${join(OUT_DIR, 'favicon-16x16.png')}`);

	// Generate multi-resolution favicon.ico
	const png16 = await sharp(svgRaw, { density: 60 }).resize(16, 16, { fit: 'contain' }).png().toBuffer();
	const png32 = await sharp(svgRaw, { density: 120 }).resize(32, 32, { fit: 'contain' }).png().toBuffer();
	const icoBuffer = Buffer.from(await pngToIco([png16, png32]));
	writeFileSync(join(OUT_DIR, 'favicon.ico'), icoBuffer);
	console.log(`Generated ${join(OUT_DIR, 'favicon.ico')}`);

	// Generate Apple Touch Icon
	await sharp(svgRaw, { density: APPLE_SIZE * 4 })
		.resize(APPLE_SIZE, APPLE_SIZE, { fit: 'contain' })
		.png()
		.toFile(join(OUT_DIR, 'apple-touch-icon.png'));
	console.log(`Generated ${join(OUT_DIR, 'apple-touch-icon.png')}`);

	// Generate 48x48 for legacy support
	await sharp(svgRaw, { density: 192 })
		.resize(48, 48, { fit: 'contain' })
		.png()
		.toFile(join(OUT_DIR, 'favicon-48x48.png'));
	console.log(`Generated ${join(OUT_DIR, 'favicon-48x48.png')}`);

	console.log('\nAll favicon variants generated successfully.');
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
