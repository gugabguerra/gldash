/** Generates a UUID v4 string, falling back to Math.random when `crypto.randomUUID` is unavailable (non-secure contexts like plain HTTP). */
export function createId(): string {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}

	const hex = '0123456789abcdef';
	let result = '';
	for (let i = 0; i < 36; i++) {
		if (i === 8 || i === 13 || i === 18 || i === 23) {
			result += '-';
		} else if (i === 14) {
			result += '4';
		} else if (i === 19) {
			result += hex[(Math.floor(Math.random() * 16) & 0x3) | 0x8];
		} else {
			result += hex[Math.floor(Math.random() * 16)];
		}
	}
	return result;
}