import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	createSessionToken,
	SESSION_COOKIE,
	sessionCookieOptions,
	setAdminPassword,
	verifyPassword,
	verifySessionToken
} from '$lib/server/auth';
import { readAuth } from '$lib/server/yaml';
import { rateLimit } from '$lib/server/rateLimit';

/**
 * POST /api/auth/reset-password
 * Body: `{ "currentPassword": "...", "newPassword": "...", "confirm": "..." }`
 *
 * Requires a valid session AND the current password. On success the new
 * bcrypt hash is written to the config and the session is refreshed.
 */
export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
	const token = cookies.get(SESSION_COOKIE);
	if (!verifySessionToken(token)) {
		return json({ message: 'Unauthorized.' }, { status: 401 });
	}

	if (!rateLimit('login', getClientAddress())) {
		return json({ message: 'Too many attempts. Please wait and try again.' }, { status: 429 });
	}

	let body: { currentPassword?: string; newPassword?: string; confirm?: string };
	try {
		body = await request.json();
	} catch {
		return json({ message: 'Request body must be valid JSON.' }, { status: 400 });
	}

	const auth = readAuth();
	if ((auth.adminPasswordHash ?? '') === '') {
		return json({ message: 'No password is currently set.' }, { status: 400 });
	}

	const { currentPassword = '', newPassword = '', confirm = '' } = body;

	const valid = await verifyPassword(currentPassword, auth.adminPasswordHash);
	if (!valid) {
		return json({ message: 'Current password is incorrect.' }, { status: 401 });
	}

	if (newPassword.length < 8) {
		return json({ message: 'New password must be at least 8 characters long.' }, { status: 400 });
	}

	if (newPassword !== confirm) {
		return json({ message: 'New passwords do not match.' }, { status: 400 });
	}

	await setAdminPassword(newPassword);

	cookies.set(SESSION_COOKIE, createSessionToken(), sessionCookieOptions());

	return json({ ok: true });
};