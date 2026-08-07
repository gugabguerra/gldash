import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { load as loadYaml, dump as dumpYaml } from 'js-yaml';
import { ConfigSchema, type Config } from '$lib/types';

/**
 * Resolves the on-disk location of `config.yaml`.
 * Defaults to `./config/config.yaml`, overridable via `CONFIG_PATH`.
 */
export function getConfigPath(): string {
	return process.env.CONFIG_PATH ?? './config/config.yaml';
}

/**
 * Resolves the on-disk location of `config.defaults.yaml`.
 * Defaults to `./config/config.defaults.yaml`, overridable via `CONFIG_DEFAULTS_PATH`.
 */
export function getConfigDefaultsPath(): string {
	return process.env.CONFIG_DEFAULTS_PATH ?? './config/config.defaults.yaml';
}

/**
 * Reads and validates `config.defaults.yaml`.
 * Used as a fallback template when `config.yaml` is not present,
 * so a first run after deployment gets meaningful sample data.
 */
function readDefaultsConfig(): Config {
	const path = getConfigDefaultsPath();

	if (!existsSync(path)) {
		return ConfigSchema.parse({});
	}

	const raw = readFileSync(path, 'utf-8');
	const parsed = loadYaml(raw);
	const result = ConfigSchema.safeParse(parsed ?? {});
	if (!result.success) {
		throw new Error(`Config defaults validation failed for "${path}": ${result.error.message}`);
	}

	return result.data;
}

/**
 * Reads and validates `config.yaml`.
 * If the file is missing, the contents of `config.defaults.yaml` are copied
 * to `config.yaml` and returned, giving a first run after deployment meaningful
 * sample data the user can then edit.
 * If the file is malformed, an error is thrown with a descriptive message.
 */
export function readConfig(): Config {
	const path = getConfigPath();

	if (!existsSync(path)) {
		const fallback = readDefaultsConfig();
		writeConfig(fallback);
		return fallback;
	}

	let raw: string;
	try {
		raw = readFileSync(path, 'utf-8');
	} catch (err) {
		throw new Error(`Unable to read config file at "${path}": ${(err as Error).message}`);
	}

	let parsed: unknown;
	try {
		parsed = loadYaml(raw);
	} catch (err) {
		throw new Error(`Invalid YAML syntax in "${path}": ${(err as Error).message}`);
	}

	const result = ConfigSchema.safeParse(parsed ?? {});
	if (!result.success) {
		throw new Error(`Config validation failed for "${path}": ${result.error.message}`);
	}

	return result.data;
}

/**
 * Validates and writes the configuration back to `config.yaml`,
 * creating the parent directory if it does not exist yet.
 */
export function writeConfig(config: Config): Config {
	const path = getConfigPath();
	const validated = ConfigSchema.parse(config);

	const dir = dirname(path);
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}

	const content = dumpYaml(validated, {
		indent: 2,
		lineWidth: 120,
		noRefs: true
	});

	try {
		writeFileSync(path, content, 'utf-8');
	} catch (err) {
		throw new Error(`Unable to write config file at "${path}": ${(err as Error).message}`);
	}

	return validated;
}
