import { redirect, type Handle } from '@sveltejs/kit';
import { SESSION_COOKIE, verifySessionToken } from '$lib/server/auth';
import { applySecurityHeaders } from '$lib/server/headers';

/**
 * Public endpoints (login page + its API) reachable without a session.
 */
const PUBLIC_PATHS = ['/login', '/api/auth/'];

/** Global authentication gate for every request. */
export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(SESSION_COOKIE);
	const authenticated = verifySessionToken(token);
	event.locals.user = authenticated;

	const { pathname } = event.url;

	if (!authenticated) {
		if (!PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p))) {
			if (pathname.startsWith('/api/')) {
				return applySecurityHeaders(
					new Response(JSON.stringify({ message: 'Unauthorized' }), {
						status: 401,
						headers: { 'Content-Type': 'application/json' }
					})
				);
			}
			throw redirect(303, '/login');
		}
	} else if (pathname === '/login') {
		throw redirect(303, '/');
	}

	return applySecurityHeaders(await resolve(event));
};