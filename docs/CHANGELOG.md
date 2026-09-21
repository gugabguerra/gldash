# Changelog

All notable changes to **GLdash** are documented here. Version checkpoints are
tagged in git as `vX.Y.Z` (see `git tag -n`).

The format follows [Keep a Changelog](https://keepachangelog.com/), and this
project adheres to [Semantic Versioning](https://semver.org/).

---

## [v0.9.0] - 2026-09-21

Typefaces. v0.8.0's type stack was IBM Plex Sans with Sora for the name; both are
gone. Oxanium is now the interface face, and two alternatives can be switched on
from Settings → Appearance without a reload or a rebuild.

### Added
- **Selectable UI fonts** — `theme.fontFamily` accepts `oxanium` (default),
  `economica` or `bitcount`, chosen in Settings → Appearance. The value flows
  through the existing `--gl-font-sans` token and is applied inline on the page
  wrapper, so the first server-rendered paint is already correct — no flash of
  the default face after hydration. An unknown value falls back to Oxanium
  rather than failing the config load.
- **Self-hosted Oxanium, Economica and Bitcount Grid Double** — Oxanium and
  Bitcount Grid Double as variable woff2 (200–800, 100–900), Economica as static
  400/700, each split by `unicode-range` like the existing faces.
- The font picker previews each option in its own typeface.

### Changed
- **Oxanium replaces IBM Plex Sans and Sora.** Sora is removed outright; the
  dashboard name is pinned to Oxanium 400 and no longer follows the theme.
- **Card text is lighter.** The app title in every density is weight 200, and the
  second line (note or host) is pinned to Oxanium 200 regardless of the chosen
  family, so it stays legible next to the display-ish alternatives. Economica has
  no weight below 400, so it renders that line at 400.
- **Restore Default Styling** now resets the font as well as the colours.

### Removed
- `static/fonts/sora-*.woff2` and `static/fonts/ibm-plex-sans-*.woff2`.

---

## [v0.8.0] - 2026-08-24

Colour and typography. The dashboard had shipped white-on-navy in whatever font
the OS provided; it now has an accent token, a real type stack, and a background
that is not a photograph by default.

### Added
- **`theme.accent`** — a fourth colour token, applied to interactive state only:
  the selected structure, density and column count, the active background mode,
  card hover borders, focus rings and edit mode. Nothing static is tinted, so
  the colour reads as state rather than decoration.
- **`gradient` background mode** — the background colour plus two very
  low-opacity radials, giving a large flat area a light source without becoming
  a visible wash behind the cards. This is now the default.
- **Self-hosted typography** — IBM Plex Sans for the interface, IBM Plex Mono
  for hosts and other data, Sora for the dashboard name. 116 KB of woff2 in
  `static/fonts/`, split by `unicode-range` so latin-ext is only fetched when a
  character needs it. Self-hosted because the app's CSP sets
  `font-src 'self' data:`, and so a LAN dashboard has no internet dependency.

### Changed
- Default palette is now emerald text (`#34d399`) on navy with a teal accent
  (`#36d3d0`). Contrast measures 9.3:1 against the page and 7.6:1 against a
  card, both past AAA. Note that text and accent are now neighbouring hues, so
  the accent has less room to signal state than it did against white text.
- **Edit and Settings swap places** in the toolbar.
- `backgroundMode` parses with `.catch()`, so a config carrying a mode that no
  longer exists falls back instead of failing the entire config load.
- A custom background image no longer has the old radial overlay composited on
  top of it — an image needs no gradient underneath, and layering one only
  muddied the photo.
- README screenshots recaptured against a generic homelab config. Every previous
  image predated the structure work and contradicted the text describing it.

### Removed
- **The `default` background mode**, the shipped `config/default-bg.jpg`, and
  the `GET /api/background/default` endpoint that served it. A fresh install now
  starts on a colour rather than a photo; `custom` uploads are unchanged.
- The one-time `layout` → `structure`/`density` migration added in v0.7.0. It
  was single-use by design: migration happens on read and the converted values
  are written back on the next save. An old `layout:` key is now ignored rather
  than converted.

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