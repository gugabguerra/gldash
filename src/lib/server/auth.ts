import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { getConfigPath, readAuth, writeAuth } from '$lib/server/yaml';

/** Session cookie name. */
export const SESSION_COOKIE = 'gldash_session';

/** Session lifetime: 72 hours, in seconds. */
export const SESSION_DURATION_SECONDS = 72 * 60 * 60;

const SECRET_FILE = '.session-secret';

/** JWT issuer claim used at sign and verify time. */
const TOKEN_ISSUER = 'gldash';

/** Minimum acceptable length for an externally supplied JWT secret. */
const MIN_JWT_SECRET_LENGTH = 32;

let cachedSecret: string | null = null;

/**
 * Standard cookie options used to persist the session token.
 * `secure` is only enabled via `COOKIE_SECURE=true` (e.g. when serving
 * behind TLS) — a homelab is commonly reached over plain HTTP on a LAN,
 * where Secure cookies would silently never be stored.
 */
export function sessionCookieOptions() {
	return {
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.COOKIE_SECURE === 'true',
		path: '/',
		maxAge: SESSION_DURATION_SECONDS
	} as const;
}

/**
 * Resolves the JWT signing secret.
 * Prefers `JWT_SECRET` env var; otherwise reads (or generates) a
 * persistent random secret stored next to the config file so that
 * sessions survive server restarts.
 */
function getSecret(): string {
	if (cachedSecret) return cachedSecret;

	if (process.env.JWT_SECRET) {
		if (process.env.JWT_SECRET.length < MIN_JWT_SECRET_LENGTH) {
			throw new Error(
				`JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters long. ` +
					'Generate one, e.g. `openssl rand -hex 32`.'
			);
		}
		cachedSecret = process.env.JWT_SECRET;
		return cachedSecret;
	}

	const secretPath = join(dirname(getConfigPath()), SECRET_FILE);
	if (existsSync(secretPath)) {
		const existing = readFileSync(secretPath, 'utf-8').trim();
		if (existing) {
			cachedSecret = existing;
			return cachedSecret;
		}
	}

	const generated = randomBytes(32).toString('hex');
	writeFileSync(secretPath, generated, { mode: 0o600 });
	cachedSecret = generated;
	return cachedSecret;
}

/** Hashes a plain-text password with bcrypt (cost 12). */
export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 12);
}

/** Verifies a plain-text password against a stored bcrypt hash. */
export async function verifyPassword(password: string, hash?: string): Promise<boolean> {
	if (!hash) return false;
	try {
		return await bcrypt.compare(password, hash);
	} catch {
		return false;
	}
}

/** Returns `true` when an admin password is currently configured. */
export function isAdminConfigured(): boolean {
	return (readAuth().adminPasswordHash ?? '') !== '';
}

/** Signs a JWT session token valid for 72 hours. */
export function createSessionToken(): string {
	return jwt.sign({ role: 'admin' }, getSecret(), {
		expiresIn: SESSION_DURATION_SECONDS,
		issuer: TOKEN_ISSUER
	});
}

/**
 * Validates a session token.
 * Returns a boolean; deliberately does not throw on invalid input.
 */
export function verifySessionToken(token: string | undefined): boolean {
	if (!token) return false;
	try {
		const payload = jwt.verify(token, getSecret(), { issuer: TOKEN_ISSUER });
		return typeof payload !== 'string' && payload.role === 'admin';
	} catch {
		return false;
	}
}

/** Sets the admin password, persisting its bcrypt hash to the config. */
export async function setAdminPassword(password: string): Promise<void> {
	if (password.length < 8) {
		throw new Error('Password must be at least 8 characters long.');
	}
	writeAuth({ adminPasswordHash: await hashPassword(password) });
}

/** Resets the admin password by emptying the config variable. */
export function resetAdminPassword(): void {
	writeAuth({ adminPasswordHash: '' });
}