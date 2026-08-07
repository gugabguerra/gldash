# Architecture

This document describes how **GLdash** is put together: the data flow, the key
modules, and the reasoning behind a few non-obvious decisions.

GLdash is a **SvelteKit 5** app (rune-based, TypeScript strict) with a
single-page, server-rendered dashboard shell and a small set of JSON/file API
endpoints. It uses `@sveltejs/adapter-node` at runtime.

---

## 1. Runtime & module overview

```
                 ┌──────────────────────────────────────────────┐
                 │                    Browser                   │
                 │  +page.svelte  (dashboard shell)            │
                 │  dashboard.svelte.ts (reactive root state)  │
                 │  Toolbar / CategorySection / AppCard ...    │
                 └───────────────┬────────────────────────────┘
                                 │ fetch()  (GET/POST/DELETE)
                 ┌───────────────▼────────────────────────────┐
                 │               API layer                    │
                 │  /api/config        read/write config.yaml │
                 │  /api/background    upload / delete image  │
                 │  /api/background/image    serve uploaded   │
                 │  /api/background/default   serve default   │
                 │  /api/icons/simple-icons/[slug]  brand SVG │
                 └───────────────┬────────────────────────────┘
                                 │ filesystem / packages
                 ┌───────────────▼────────────────────────────┐
                 │  $lib/server (yaml.ts, background.ts)      │
                 │  config/config.yaml, config/default-bg.jpg │
                 │  static/backgrounds/bg-*.jpg (uploads)     │
                 └────────────────────────────────────────────┘
```

### Module map

| Path | Responsibility |
| --- | --- |
| `src/routes/+page.server.ts` | Runs `readConfig()` on the server and passes it to the page. |
| `src/routes/+page.svelte` | Shell: applies theme CSS variables + background, renders sections and overlays. |
| `src/lib/state/dashboard.svelte.ts` | Module-level reactive store; the single source of truth for the live config and UI mode. |
| `src/lib/server/yaml.ts` | Reads/validates and writes `config.yaml` (Zod). Owns `getConfigPath()`. |
| `src/lib/server/background.ts` | File-system helpers for stored/default backgrounds. |
| `src/lib/types.ts` | Zod schemas, default constants, and exported TypeScript types. |
| `src/lib/utils/icons.ts` | Resolves an app's `icon` field into a renderable Lucide / SVG / image. |
| `src/lib/components/*` | Presentational components (Toolbar, cards, modals, overlays). |

---

## 2. State management

All mutable state lives in a single module-level instance,
`src/lib/state/dashboard.svelte.ts`:

```ts
class DashboardState {
    config = $state<Config>(...);
    editMode = $state(false);
    settingsOpen = $state(false);
    editingApp = $state<AppRef | null>(null);
    confirmDialog = $state<ConfirmDialogState | null>(null);
    ...
}
export const dashboard = new DashboardState();
```

Why a plain class with `$state` instead of a `writable` store?

- The UI reads deep properties (e.g. `dashboard.config.settings.theme.background`)
  directly; Svelte runes track even nested mutations, so components re-render
  automatically without `$store` subscriptions.
- Methods (`save`, `resetTheme`, `addApp`, …) encapsulate side effects.

A few methods matter:

- `init(config)` — hydrates the store with data from `+page.server.ts`.
- `save()` — posts a `$state.snapshot(config)` to `POST /api/config` and surfaces
  errors via `dashboard.error`.
- `resetTheme()` — best-effort delete of any uploaded image, resets theme colors
  to `DEFAULT_THEME`, sets `backgroundMode: 'default'`, then `save()`.

---

## 3. Configuration: schema, validation, persistence

Everything is validated with **Zod** (`src/lib/types.ts`) on both read and
write:

- `AppSchema`, `CategorySchema` — leaf entities.
- `ThemeSchema` — colors plus `backgroundImage?` and `backgroundMode`.

`ThemeSchema` uses a **`.transform()`** so the parsed value *always* has a
`backgroundMode`. Because `backgroundMode` is optional on input, existing
(legacy) configs migrate automatically:

```ts
export const ThemeSchema = z.object({ ... backgroundMode: z.enum([...]).optional() })
  .transform((theme) => ({
    ...theme,
    backgroundMode: theme.backgroundMode ?? (theme.backgroundImage ? 'custom' : 'default')
  }));
```

`src/lib/server/yaml.ts` handles the file side:

| Function | Behavior |
| --- | --- |
| `getConfigPath()` | `process.env.CONFIG_PATH ?? './config/config.yaml'`. |
| `readConfig()` | Reads + parses the file; if missing, creates it with defaults. |
| `writeConfig(config)` | Zod-parses, then dumps YAML back to disk (creating the dir if needed). |

Any broken YAML or validation failure surfaces as a clear error rather than a
silent crash.

---

## 4. Backgrounds: three modes

The background is a single logical layer combined with a fixed radial-gradient
overlay for readability:

```ts
const image =
    theme.backgroundMode === 'solid'
        ? null
        : theme.backgroundImage ?? BACKGROUND_DEFAULT_URL;
```

| Mode | `backgroundImage` | Rendered |
| --- | --- | --- |
| `default` | (unset) | `config/default-bg.jpg` via `GET /api/background/default` |
| `custom` | `/api/background/image` | the uploaded file |
| `solid` | ignored | solid color + gradient overlay only |

- Uploads (`POST /api/background`) are written to `static/backgrounds/bg-<ts>.<ext>`
  and served by `GET /api/background/image`.
- The **default** image is read live from the config directory (`config/default-bg.jpg`)
  on every request. Because it's served from disk rather than baked into the
  static manifest, editing/remounting it takes effect without a rebuild — that's
  also why `GET /api/background/default` exists.
- If either image is missing, the endpoint returns `404` and the page simply
  keeps the underlying `background-color` (graceful degradation).

Shared server helpers live in `src/lib/server/background.ts`
(`getBackgroundsDir`, `getBackgroundFile`, `mimeForExtension`).

---

## 5. Icon resolution

`src/lib/utils/icons.ts` `resolveIcon(icon, appUrl)` runs in priority order
(see `ResolvedIcon` discriminated union):

1. `lucide:<name>` → dynamically imports a Lucide component from
   `/node_modules/@lucide/svelte/dist/icons/*.svelte`. Only requested icons are
   ever fetched.
2. `simple-icons:<slug>` → fetches an SVG string from the server-side
   `GET /api/icons/simple-icons/[slug]`, keeping the large icon dataset out of
   the client bundle.
3. `http(s)://…` or `/…` → rendered as an `<img>`.
4. Fallback → a Google favicon URL derived from the app URL.

`AppIcon.svelte` consumes the promise via `{#await}` and shows a pulsing
placeholder while loading.

---

## 6. Layouts & drag-and-drop

`CategorySection.svelte` renders the same app list in one of three layouts
selected by `settings.layout`:

- **grid** — a CSS grid whose column count comes from `settings.columns`
  (mapped to responsive Tailwind classes).
- **fluid** — `flex flex-wrap` with fixed-width cards.
- **table** — dense vertical list of rows.

Reordering is handled entirely by `svelte-dnd-action`:

- Each list is a `dndzone` with `type: 'gldash-apps'`, so items drag across
  lists within the same category type.
- `onconsider` writes the provisional reorder into the reactive config (live
  visual feedback).
- `onfinalize` commits it to the config and calls `dashboard.save()`.
- `dragDisabled` is bound to `dashboard.editMode`, so dragging only happens in
  Edit Mode.

---

## 7. Overlays

All overlays are conditional renders within `+page.svelte`, driven by
`dashboard` flags:

| Component | Triggered by | Purpose |
| --- | --- | --- |
| `Toolbar` | always visible | layout switcher, Spotlight, Settings, Edit toggle |
| `SettingsDrawer` | `settingsOpen` | columns, theme colors, background modes, categories |
| `EditAppModal` | `editingApp !== null` | per-app fields |
| `Spotlight` | `spotlightOpen` | `Cmd/Ctrl+K` quick launcher |
| `ConfirmDialog` | `confirmDialog !== null` | destructive-action confirmation |

The confirmation dialog is a generic, singleton overlay configured via
`dashboard.confirm({ ... })` — actions (e.g. "Restore Default Styling",
"Delete Category") supply their own `onConfirm` callback.

---

## 8. API reference

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/config` | Return the validated config. |
| `POST` | `/api/config` | Validate (Zod) and write config back to YAML. |
| `POST` | `/api/background` | Upload a background image (multipart `image`). |
| `GET` | `/api/background/image` | Serve the uploaded background image. |
| `GET` | `/api/background/default` | Serve the shipped `config/default-bg.jpg`. |
| `DELETE` | `/api/background` | Remove the uploaded background image. |
| `GET` | `/api/icons/simple-icons/[slug]` | Serve a brand SVG from `simple-icons`. |

---

## 9. Docker & environment

- `Dockerfile` — multi-stage, `node:22-alpine`; builds then runs `node build/index.js`.
- `docker-compose.yml` — maps `:3000`, mounts `./config` and
  `./static/backgrounds` for persistence.

| Variable | Description | Default |
| --- | --- | --- |
| `CONFIG_PATH` | Path to `config.yaml`. | `./config/config.yaml` |
| `PORT` | HTTP port for the Node server. | `3000` |

The mounted `./config` volume makes both `config.yaml` and `default-bg.jpg`
editable at runtime without rebuilding the image.

---

## 10. Extension points / roadmap hooks

Phase 2 (Traefik/Docker discovery) and Phase 3 (update badges) were scoped
ahead of time; the YAML schema already carries reserved `githubRepo` and
`dockerImage` fields per app for the Phase 3 update tracker.