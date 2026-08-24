/**
 * Extracts the host (hostname + optional port) from a URL string.
 *
 * Returns empty string for:
 * - Relative URLs starting with `/`
 * - Malformed URLs
 *
 * Examples:
 * - `http://example.com/admin` → `example.com`
 * - `https://10.73.0.4:8443/dashboard` → `10.73.0.4:8443`
 * - `http://hass.gugalab.pt:8123` → `hass.gugalab.pt:8123`
 * - `/relative/path` → `` (empty)
 *
 * @param url The URL string to parse. Must start with http://, https://, or /.
 * @returns The hostname and port (if non-standard), or empty string if relative or malformed.
 */
export function extractHost(url: string): string {
	// Return empty for relative URLs
	if (url.startsWith('/')) {
		return '';
	}

	try {
		const parsed = new URL(url);
		// Return hostname + port if present and non-standard
		return parsed.port
			? `${parsed.hostname}:${parsed.port}`
			: parsed.hostname || '';
	} catch {
		// Malformed URL; return empty string
		return '';
	}
}
