# GLdash

A fast, elegant, and lightweight homelab dashboard and application launcher, built with SvelteKit 5, TypeScript, and Tailwind CSS 4.

## Features (Phase 1)

- **YAML-backed configuration** — validated end-to-end with Zod, read/written via `GET`/`POST /api/config`.
- **Multiple layouts** — Grid (2–6 columns), Fluid, and Table/List views.
- **Theme customizer** — background, text, and card colors persisted to `config.yaml`.
- **Edit Mode** — drag-and-drop reordering (within and across categories), per-app edit modal, add/remove apps and categories.
- **Smart icon resolution** — `lucide:<name>`, `simple-icons:<slug>`, direct image URLs, or an automatic favicon fallback.
- **Spotlight search** — `Cmd/Ctrl + K` quick launcher.
- **PWA** — installable, offline app-shell caching via `@vite-pwa/sveltekit`.

## Development

```sh
npm install
npm run dev -- --open
```

The dashboard reads/writes `./config/config.yaml` by default. Override the location with `CONFIG_PATH`:

```sh
CONFIG_PATH=/path/to/config.yaml npm run dev
```

## Configuration Schema

```yaml
settings:
  layout: "grid" # "grid" | "fluid" | "table"
  columns: 4 # 2 to 6
  theme:
    background: "#0f172a"
    textColor: "#f8fafc"
    cardBackground: "#1e293b"

categories:
  - name: "Infraestrutura"
    apps:
      - id: "pihole-01"
        title: "Pi-hole"
        url: "http://192.168.1.10/admin"
        icon: "simple-icons:pihole"
        note: "DNS Primário da Rede"
        githubRepo: "pi-hole/pi-hole" # reserved for Phase 3
        dockerImage: "pihole/pihole" # reserved for Phase 3
```

## Building & Type Checking

```sh
npm run build
npm run check
```

## Docker

```sh
docker compose up -d --build
```

This builds the multi-stage `Dockerfile` (Node 22 Alpine), exposes port `3000`, and mounts `./config` into the container so your dashboard configuration persists across restarts.

## Roadmap

- **Phase 2** — Traefik / Docker auto-discovery staging area inside Edit Mode.
- **Phase 3** — GitHub Releases & Docker Hub update-availability badges.
