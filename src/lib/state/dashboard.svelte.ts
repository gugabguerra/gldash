import type { App, Config } from '$lib/types';
import { ConfigSchema } from '$lib/types';

/** Identifies a single app's position within the categories tree. */
export interface AppRef {
	categoryIndex: number;
	appIndex: number;
}

/** Describes the state of the confirmation dialog used for destructive actions. */
export interface ConfirmDialogState {
	title: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	destructive?: boolean;
	onConfirm: () => void;
}

/**
 * Central, module-level reactive store for the dashboard.
 * Holds the live configuration, UI mode flags, and persistence logic.
 */
class DashboardState {
	config = $state<Config>(ConfigSchema.parse({}));
	editMode = $state(false);
	saving = $state(false);
	error = $state<string | null>(null);
	spotlightOpen = $state(false);
	settingsOpen = $state(false);
	editingApp = $state<AppRef | null>(null);
	confirmDialog = $state<ConfirmDialogState | null>(null);

	/** Hydrates the store with server-loaded configuration. */
	init(config: Config) {
		this.config = config;
	}

	toggleEditMode() {
		this.editMode = !this.editMode;
		if (!this.editMode) {
			this.editingApp = null;
		}
	}

	openSpotlight() {
		this.spotlightOpen = true;
	}

	closeSpotlight() {
		this.spotlightOpen = false;
	}

	openSettings() {
		this.settingsOpen = true;
	}

	closeSettings() {
		this.settingsOpen = false;
	}

	/** Shows the global confirmation dialog. */
	confirm(dialog: ConfirmDialogState) {
		this.confirmDialog = dialog;
	}

	/** Dismisses the global confirmation dialog. */
	closeConfirm() {
		this.confirmDialog = null;
	}

	startEditingApp(ref: AppRef) {
		this.editingApp = ref;
	}

	stopEditingApp() {
		this.editingApp = null;
	}

	/** Persists the current configuration to the server, validating first. */
	async save(): Promise<boolean> {
		this.saving = true;
		this.error = null;
		try {
			const response = await fetch('/api/config', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify($state.snapshot(this.config))
			});

			if (!response.ok) {
				const body = await response.json().catch(() => ({ message: 'Unknown error' }));
				this.error = body.message ?? `Failed to save (status ${response.status}).`;
				return false;
			}

			return true;
		} catch (err) {
			this.error = (err as Error).message;
			return false;
		} finally {
			this.saving = false;
		}
	}

	/** Updates a single app in place, then persists the change. */
	async updateApp(ref: AppRef, patch: Partial<App>) {
		const category = this.config.categories[ref.categoryIndex];
		if (!category) return;
		const app = category.apps[ref.appIndex];
		if (!app) return;
		Object.assign(app, patch);
		await this.save();
	}

	/** Removes an app from a category, then persists the change. */
	async removeApp(ref: AppRef) {
		const category = this.config.categories[ref.categoryIndex];
		if (!category) return;
		category.apps.splice(ref.appIndex, 1);
		await this.save();
	}

	/** Adds a new blank app to a category and opens it for editing. */
	addApp(categoryIndex: number) {
		const category = this.config.categories[categoryIndex];
		if (!category) return;
		const newApp: App = {
			id: crypto.randomUUID(),
			title: 'New App',
			url: 'https://',
			icon: '',
			note: ''
		};
		category.apps.push(newApp);
		this.startEditingApp({ categoryIndex, appIndex: category.apps.length - 1 });
	}

	/** Adds a new empty category. */
	async addCategory(name: string) {
		this.config.categories.push({ id: crypto.randomUUID(), name, apps: [] });
		await this.save();
	}

	/** Removes a category entirely (after confirmation). */
	async removeCategory(categoryIndex: number) {
		const category = this.config.categories[categoryIndex];
		if (!category) return;

		// Safety: never delete a category that still has apps.
		if (category.apps.length > 0) {
			this.confirm({
				title: 'Cannot Delete Category',
				message: `Move or delete the ${category.apps.length} app(s) in "${category.name}" before removing it.`,
				confirmLabel: 'OK',
				destructive: false,
				onConfirm: () => {}
			});
			return;
		}

		// Confirmation dialog for the actual deletion.
		this.confirm({
			title: 'Delete Category?',
			message: `Permanently remove the category "${category.name}"? This action cannot be undone.`,
			confirmLabel: 'Delete',
			cancelLabel: 'Cancel',
			destructive: true,
			onConfirm: () => {
				this.config.categories.splice(categoryIndex, 1);
				this.save();
			}
		});
	}
}

export const dashboard = new DashboardState();
