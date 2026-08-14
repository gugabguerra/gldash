/**
 * Hardening headers applied to every server response.
 *
 * `Content-Security-Policy` is intentionally NOT set here: SvelteKit emits it
 * via its built-in `csp` config (see `vite.config.ts`), which hashes its own
 * inline bootstrap script. This helper covers the remainder, which Kit does not
 * manage and which also applies to API/non-page responses.
 */
export const SECURITY_HEADERS: Record<string, string> = {
	'X-Content-Type-Options': 'nosniff',
	'X-Frame-Options': 'DENY',
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

/** Applies the hardening headers to any outgoing Response, best-effort. */
export function applySecurityHeaders(response: Response): Response {
	try {
		for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
			response.headers.set(name, value);
		}
	} catch {
		// Headers may be immutable for some constructed responses; ignore.
	}
	return response;
}
