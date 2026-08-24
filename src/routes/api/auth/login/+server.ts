import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	createSessionToken,
	SESSION_COOKIE,
	sessionCookieOptions,
	setAdminPassword,
	verifyPassword
} from '$lib/server/auth';
import { readAuth } from '$lib/server/yaml';
import { rateLimit } from '$lib/server/rateLimit';

/**
 * How many attempts must remain before the count is named in the error message.
 * Disclosing it on every failure would let an attacker pace their requests to
 * sit just under the lockout threshold indefinitely, so the warning is held
 * back until a lockout is actually imminent.
 */
const ATTEMPTS_WARNING_THRESHOLD = 2;

/**
 * POST /api/auth/login
 * Body: `{ "password": "...", (optional) "confirm": "..." }`
 *
 * - If no admin password is set yet, the supplied password becomes the
 *   initial admin password (first-run setup / recovery after a manual reset).
 * - Otherwise, the password is verified against the stored bcrypt hash.
 * On success a 72-hour session cookie is issued.
 */
export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
	const clientIp = getClientAddress();
	const rateLimitStatus = rateLimit('login', clientIp);
	if (!rateLimitStatus.allowed) {
		return json({ message: 'Too many attempts. Please wait and try again.' }, { status: 429 });
	}

	let body: { password?: string };
	try {
		body = await request.json();
	} catch {
		return json({ message: 'Request body must be valid JSON.' }, { status: 400 });
	}

	const password = body?.password ?? '';
	if (!password) {
		return json({ message: 'Password is required.' }, { status: 400 });
	}

	const auth = readAuth();
	const configured = (auth.adminPasswordHash ?? '') !== '';

	if (!configured) {
		if (password.length < 8) {
			return json({ message: 'Password must be at least 8 characters long.' }, { status: 400 });
		}
		await setAdminPassword(password);
	} else {
		const valid = await verifyPassword(password, auth.adminPasswordHash);
		if (!valid) {
			const { remaining } = rateLimitStatus;
			let message = 'Incorrect password.';
			if (remaining === 0) {
				message = 'Incorrect password. Further attempts are temporarily blocked.';
			} else if (remaining <= ATTEMPTS_WARNING_THRESHOLD) {
				const attempts = remaining === 1 ? 'attempt' : 'attempts';
				message = `Incorrect password. ${remaining} ${attempts} left before a temporary lockout.`;
			}
			return json({ message }, { status: 401 });
		}
	}

	cookies.set(SESSION_COOKIE, createSessionToken(), sessionCookieOptions());

	return json({ ok: true });
};