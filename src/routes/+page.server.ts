import type { PageServerLoad } from './$types';
import { readConfig } from '$lib/server/yaml';

export const load: PageServerLoad = async () => {
	try {
		const config = readConfig();
		return { config, configError: null };
	} catch (err) {
		return { config: null, configError: (err as Error).message };
	}
};
