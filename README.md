# GLdash

A **fast, elegant, and lightweight homelab dashboard and application launcher**. GLdash turns a single YAML file into a beautiful, installable dashboard for all your self-hosted services — with drag-and-drop organization, real-time theming, a spotlight quick-launcher, and a responsive set of views.

Built with **SvelteKit 5 (runes)**, **TypeScript (strict)**, **Tailwind CSS v4**, and **Zod**, designed to run anywhere: bare-metal Node, Docker, or a NAS box.

---

## ✨ Features

### Dashboard & Layouts
- **Three layout modes** — switchable from the toolbar:
  - **Grid** — responsive card grid with an editable column count (2–6).
  - **Fluid** — auto-fitting flex/masonry layout that fills the width.
  - **Table/List** — dense rows for fast, at-a-glance scanning.
- **Categories** organize apps into labeled sections.
- **Edit Mode** — toggle editing, then:
  - **Drag-and-drop reordering** of cards within and across categories (`svelte-dnd-action`).
  - **Per-app edit modal** — title, URL, icon, note, linked GitHub repo and Docker image.
  - Add / remove **apps and categories**.

### Theming & Background Image
- **Theme Customizer** — change background, text, and card colors **in real time**, persisted straight to `config.yaml`.
- **Background image** with three selectable modes (in Settings → Theme):
  - **Default** — ships with `config/default-bg.jpg` (edit or mount that file to change it; served via `/api/background/default`).
  - **Custom** — upload a JPEG/PNG/WebP (≤ 5 MB); stored on the server and served via `/api/background/image`, so it works in dev and the Node production build (*not* baked into the static manifest).
  - **Solid** — plain color + gradient overlay, no image.
- **Restore Default Styling** — one-click (with confirmation) reset of the theme colors and a return to the default background image; layout and column count are untouched.
- Subtle radial-gradient overlay keeps cards readable on any image.
- Clean neutral **slate/zinc** palette, discrete 1px borders, and 150 ms micro-interactions — no "AI slop" gradients or glassmorphism.

### Smart Icons
Icons resolve in priority order:
1. **Lucide** — e.g. `lucide:server` (rendered inline).
2. **Simple Icons** — e.g. `simple-icons:grafana`, served **server-side** from the `simple-icons` package via `GET /api/icons/simple-icons/[slug]` (keeps the large icon dataset out of the client bundle).
3. **Direct image URL** — any `http(s)://...` or local path.
4. **Automatic fallback** — domain favicon (`google.com/s2/favicons`).

### Productivity & PWA
- **Spotlight / Quick Search** — open with `Cmd/Ctrl + K`, keyboard-navigable, matched across title, note, and URL.
- **PWA** — installable on iOS/Android/desktop with offline app-shell caching (`@vite-pwa/sveltekit` + Workbox).

---

## 🧰 Tech Stack

| Layer       | Technology                                        |
| ----------- | ------------------------------------------------- |
| Framework   | SvelteKit 5 (runes) + Svelte 5                    |
| Language    | TypeScript (strict)                               |
| Styling     | Tailwind CSS v4 + Lucide icons (`@lucide/svelte`) |
| Icons       | `simple-icons` (server-served SVGs)               |
| Data/config | `js-yaml` (parsing/writing) + `zod` (validation)  |
| Drag & drop | `svelte-dnd-action`                               |
| Images      | `sharp` (background image processing)             |
| PWA         | `@vite-pwa/sveltekit`                             |
| Runtime     | Node.js (via `@sveltejs/adapter-node`)            |

---

## 🚀 Getting Started

### Local development

```sh
npm install
npm run dev -- --open
```

The dashboard reads/writes `./config/config.yaml` by default. Override the location with the `CONFIG_PATH` environment variable:

```sh
CONFIG_PATH=/path/to/config.yaml npm run dev
```

### Type checking & build

```sh
npm run check        # svelte-check (strict TypeScript)
npm run build        # production build (adapter-node)
npm run preview      # preview the production build
```

---

## 🐳 Docker

### Docker Compose (recommended)

```sh
docker compose up -d --build
```

This builds the **multi-stage Dockerfile** (`node:22-alpine`), exposes port `3000`, and mounts `./config` into the container so your dashboard configuration **and the default background image** (`config/default-bg.jpg`) persist across restarts. Both are read from the mounted volume at runtime, so editing them takes effect without a rebuild.

### Manual build

```sh
docker build -t gldash .
docker run -d \
  -p 3000:3000 \
  -v "$PWD/config:/app/config" \
  -e CONFIG_PATH=/app/config/config.yaml \
  gldash
```

### Environment variables

| Variable      | Description                                  | Default                 |
| ------------- | -------------------------------------------- | ----------------------- |
| `CONFIG_PATH` | Path to the dashboard's `config.yaml`.        | `./config/config.yaml`  |
| `PORT`        | HTTP port for the Node server.                | `3000`                  |

---

## 📄 Configuration Schema

All data is validated with **Zod** on every read and write. A minimal `config.yaml`:

```yaml
settings:
  layout: "grid"          # "grid" | "fluid" | "table"
  columns: 4              # integer, 2 to 6 (grid layout)
  theme:
    background: "#0f172a"
    textColor: "#f8fafc"
    cardBackground: "#1e293b"
    backgroundMode: "default"        # "default" | "custom" | "solid"
    backgroundImage: ""              # uploaded image URL, only used when custom

categories:
  - id: "infra-01"                # optional, auto-generated if omitted
    name: "Infraestrutura"
    apps:
      - id: "pihole-01"
        title: "Pi-hole"
        url: "http://192.168.1.10/admin"
        icon: "simple-icons:pihole"    # lucide:* | simple-icons:* | URL | fallback
        note: "DNS Primário da Rede"
        githubRepo: "pi-hole/pi-hole"  # reserved for Phase 3 (update badges)
        dockerImage: "pihole/pihole"   # reserved for Phase 3
```

The **default background** lives at `config/default-bg.jpg` — the same directory as `config.yaml` — and is served from there at request time, so replacing the file (or mounting a new one) updates the dashboard without a rebuild. When `backgroundMode` is `solid`, the image is ignored and the solid color + gradient overlay is used.

### Icon resolution

| Format                   | Example                              | Renders as                          |
| ------------------------ | ------------------------------------ | ----------------------------------- |
| Lucide                   | `lucide:server`                      | Inline Lucide icon                  |
| Simple Icons (brand)     | `simple-icons:grafana`                | Server-side SVG (`/api/icons/...`)  |
| Direct URL / local path  | `https://…/icon.png` or `/icons/x`    | Rendered `<img>`                    |
| *(none / unknown)*       | *(auto)*                             | Domain favicon (`google.com/s2/favicons`) |

---

## 🔌 API Reference

| Method   | Route                              | Description                                            |
| -------- | ---------------------------------- | ------------------------------------------------------ |
| `GET`    | `/api/config`                      | Returns the validated config as JSON.                  |
| `POST`   | `/api/config`                      | Validates with Zod and writes the config back to YAML. |
| `POST`   | `/api/background`                  | Uploads a background image (multipart field `image`).  |
| `GET`    | `/api/background/default`          | Serves the shipped default image (`config/default-bg.jpg`). |
| `GET`    | `/api/background/image`            | Serves the current custom (uploaded) background image. |
| `DELETE` | `/api/background`                  | Removes the uploaded background image.                |
| `GET`    | `/api/icons/simple-icons/<slug>`   | Serves a brand SVG by Simple Icons slug.               |

---

## 🧱 Project Structure

```
src/
├── lib/
│   ├── assets/            # favicon.svg
│   ├── components/        # Toolbar, CategorySection, AppCard, AppIcon,
│   │                      # EditAppModal, SettingsDrawer, Spotlight, ConfirmDialog
│   ├── server/            # yaml.ts (config read/write), background.ts (image helpers)
│   ├── state/             # dashboard.svelte.ts (reactive global state)
│   ├── utils/             # icons.ts (icon resolution)
│   ├── types.ts           # Zod schemas + exported TS types
│   └── index.ts           # barrel export for the $lib alias
└── routes/
    ├── +layout.svelte     # root layout (loads Tailwind + favicon)
    ├── +page.server.ts    # server load: reads config
    ├── +page.svelte       # dashboard shell (background styling)
    ├── layout.css         # Tailwind v4 import + CSS custom properties
    └── api/
        ├── config/        # GET/POST config
        ├── background/    # POST upload, DELETE
        │   ├── default/   # GET serve config/default-bg.jpg
        │   └── image/     # GET serve uploaded image
        └── icons/simple-icons/[slug]/   # server-side brand SVGs
```

---

## 🗺️ Roadmap

- **Phase 2 — Traefik / Docker auto-discovery** — optional read access to `/var/run/docker.sock` or the Traefik REST API, with a "Discovered Services" drawer inside Edit Mode to one-click populate the config.
- **Phase 3 — Update tracker** — background checks for GitHub Releases and Docker Hub tags; discrete **"Update Available"** badges on cards using the `githubRepo` / `dockerImage` fields.

---

## 📚 Documentation

- [`docs/CHANGELOG.md`](docs/CHANGELOG.md) — versioned release notes.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system design, data flow, and module map.