import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readConfig, writeConfig } from '$lib/server/yaml';
import { ConfigSchema } from '$lib/types';

/** GET /api/config — returns the validated dashboard configuration. */
export const GET: RequestHandler = async () => {
	try {
		const config = readConfig();
		return json(config);
	} catch (err) {
		return json({ message: (err as Error).message }, { status: 500 });
	}
};

/** POST /api/config — validates and persists the dashboard configuration. */
export const POST: RequestHandler = async ({ request }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ message: 'Request body must be valid JSON.' }, { status: 400 });
	}

	const result = ConfigSchema.safeParse(body);
	if (!result.success) {
		return json({ message: 'Config validation failed.', issues: result.error.issues }, { status: 400 });
	}

	try {
		const saved = writeConfig(result.data);
		return json(saved);
	} catch (err) {
		return json({ message: (err as Error).message }, { status: 500 });
	}
};
