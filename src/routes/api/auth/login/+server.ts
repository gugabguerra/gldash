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

/**
 * POST /api/auth/login
 * Body: `{ "password": "...", (optional) "confirm": "..." }`
 *
 * - If no admin password is set yet, the supplied password becomes the
 *   initial admin password (first-run setup / recovery after a manual reset).
 * - Otherwise, the password is verified against the stored bcrypt hash.
 * On success a 72-hour session cookie is issued.
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
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
			return json({ message: 'Incorrect password.' }, { status: 401 });
		}
	}

	cookies.set(SESSION_COOKIE, createSessionToken(), sessionCookieOptions());

	return json({ ok: true });
};