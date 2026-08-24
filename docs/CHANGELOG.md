# Changelog

All notable changes to **GLdash** are documented here. Version checkpoints are
tagged in git as `vX.Y.Z` (see `git tag -n`).

The format follows [Keep a Changelog](https://keepachangelog.com/), and this
project adheres to [Semantic Versioning](https://semver.org/).

---

## [v0.7.0] - 2026-08-24

Layout becomes two independent axes, and the icon set stops shipping to the
browser.

### Added
- **Structures** — `settings.structure` decides how categories are arranged:
  **Board** (categories packed into balanced columns), **Panel** (the same, each
  category in a bordered container), **Wall** (full-width stacked sections).
  Selected from Settings → Layout, with wireframe thumbnails.
- **Densities** — `settings.density` decides how each app is drawn: **Rows**
  (~46px), **Cards** (~62px), **Tiles** (icon-forward). Still switchable from
  the toolbar.
- **Host fallback** — apps with no `note` show their host instead, so the second
  line distinguishes LAN addresses from proxied subdomains.
- **Spotlight keyboard navigation** — arrow keys move a highlight, Enter opens;
  search now matches hosts as well as titles and notes.
- **Add Category on the board** — moved out of Settings, next to the categories
  it creates.
- **Per-machine Compose overrides** — `${GLDASH_IMAGE}` plus a gitignored
  `docker-compose.override.yml`, so a deployment can point at a private registry
  without editing tracked files.

### Changed
- `settings.layout` is split into `structure` + `density`. Existing configs
  migrate automatically on read (`grid`→`cards`, `fluid`→`tiles`,
  `table`→`rows`); the old key is dropped on the next write.
- Categories are distributed into real flex columns in JS rather than a CSS
  `column-count` flow, which drag-and-drop cannot measure. Edit mode switches to
  sequential chunks so a drop can be reconstructed by concatenation.
- The dashboard is server-rendered again — state is seeded during setup instead
  of an `$effect`, which had been server-rendering an empty board.
- Settings drawer regrouped into Layout / Appearance / Dashboard / Account.

### Fixed
- **Rate limiting on password reset never fired.** `rateLimit()` gained a
  richer return type and that call site still read it as a boolean; an object is
  always truthy, so the guard was silently disabled and TypeScript could not see
  it.
- **`columns` was ignored.** Grid mode capped the app grid at 2 regardless of
  the configured value.
- Recovery instructions are no longer printed to unauthenticated visitors.
- `autocomplete` is `new-password` during first-run setup.
- Rows and tiles no longer collapse to a single full-width column.

### Performance
- **Lucide icons are served from `/api/icons/lucide/[slug]`** instead of an
  `import.meta.glob`, which inlined a lazy-import entry for all 1760 icons into
  the main chunk. Mirrors what Simple Icons already did.
- **Zod no longer ships to the browser.** It was pulled in by a single
  `ConfigSchema.parse({})` used to build an empty placeholder object, and its
  eval-based parser was being blocked by the CSP on every load.
- Largest client chunk: **490K → 91K**.
- Removed the unused `sharp` dependency.

---

## [v0.6.0] - 2026-08-14

### Added
- Brand favicon set and improved icon fallback.
- Scrollable icon picker showing all matches.

### Changed
- Hardened app security for homelab deployments.
- Removed the unused `githubRepo` and `dockerImage` app fields.

### Fixed
- Separator in the settings menu.

---

## [v0.5.0] - 2026-08-13

### Added
- Icon autocomplete dropdown in the app editor.
- App clone action.
- Customizable app name.

### Fixed
- Icon autocomplete failing silently when `simple-icons` was missing.
- Production asset 404s.
- UUID generation without a secure-context requirement.

---

## [v0.4.0] - 2026-08-09

Single-admin authentication.

### Added
- **Password-protected dashboard** — a `/login` page gates the app; first-run
  visits double as a setup screen to create the admin password (min 8 chars).
- **bcrypt password hashing** (cost 12), stored in the `auth` block of
  `config.yaml` (`AuthConfigSchema`), kept out of the client-facing config
  schema so the hash never reaches the browser.
- **JWT sessions** — a 72-hour `httpOnly` session cookie
  (`gldash_session`, `SameSite=Lax`) signed with a server secret; a persistent
  random secret is generated next to `config.yaml` unless `JWT_SECRET` is set.
- **Global auth gate** (`src/hooks.server.ts`) — API requests without a session
  get `401`; page requests redirect to `/login`.
- **Logout** (`POST /api/auth/logout`) and **change password** from Settings
  (`POST /api/auth/reset-password`, session + current password required, session
  rotated on success).
- **Recovery** — empty `auth.adminPasswordHash` in `config.yaml` and restart to
  reset the password; the next visit prompts for a new one.
- `COOKIE_SECURE=true` env flag for TLS deployments.

---

## [v0.3.0] - 2026-08-07

Default background image and one-click reset of the theme.

### Added
- **Default background image** — `config/default-bg.jpg` is now the dashboard
  default, read from the config directory at request time via the new
  `GET /api/background/default` endpoint. Editing or remounting the file takes
  effect without rebuilding.
- **Background modes** (`backgroundMode: default | custom | solid` in
  `config.yaml`, Zod-validated):
  - `default` — the shipped `config/default-bg.jpg`.
  - `custom` — a user-uploaded image.
  - `solid` — plain color + gradient overlay, no image.
- **Restore Default Styling** action — a confirmable button in Settings that
  resets theme colors and reverts to the default background, leaving layout and
  column count untouched.

### Changed
- Settings → Theme now exposes a background-mode selector in place of the old
  single upload/remove control.
- `backgroundMode` is inferred automatically for existing configs (an image URL
  implies `custom`); no manual migration is required.

---

## [v0.2.0] - 2026-08-07

Background image upload, server-side icons, and richer editing.

### Added
- **Background image upload** — upload a JPEG/PNG/WebP (≤ 5 MB) from Settings;
  stored server-side and served through `GET /api/background/image`, working in
  both dev and the `adapter-node` production build.
- **Server-side Simple Icons** — served from the `simple-icons` package via
  `GET /api/icons/simple-icons/[slug]`, keeping the large icon dataset out of the
  client bundle.
- **Drag-and-drop reordering** across categories (`svelte-dnd-action`).
- Per-app **edit modal** (title, URL, icon, note, GitHub repo, Docker image) and
  add/remove actions for apps and categories.
- Comprehensive README.

### Fixed
- `/api/background/image` 404 on load — split the image-serving route into a
  dedicated subroute and shared the file helpers in `src/lib/server/background.ts`.

---

## [v0.1] - 2026-08-07

Initial usable version (Phase 1).

### Added
- Zod-validated `config.yaml` read/write (`GET`/`POST /api/config`), with
  automatic config creation when the file is missing.
- Three layouts: **Grid** (2–6 columns), **Fluid**, and **Table/List**.
- Real-time **Theme Customizer** persisted to `config.yaml`.
- **Edit Mode** with drag-and-drop and per-app editing.
- **Smart icon resolution** (`lucide:`, `simple-icons:`, image URLs, favicon fallback).
- **Spotlight / quick search** (`Cmd/Ctrl + K`).
- **PWA** (installable, offline app-shell caching via `@vite-pwa/sveltekit`).
- Multi-stage `Dockerfile` (`node:22-alpine`) and `docker-compose.yml`.