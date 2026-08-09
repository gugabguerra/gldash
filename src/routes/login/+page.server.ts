import type { PageServerLoad } from './$types';
import { isAdminConfigured } from '$lib/server/auth';

export const load: PageServerLoad = async () => {
	return { needsSetup: !isAdminConfigured() };
};