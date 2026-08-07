## Project Configuration

- **Language**: TypeScript
- **Package Manager**: npm
- **Add-ons**: none

---

# AGENT INSTRUCTIONS: GLdash Development

You are an expert Senior Full-Stack Engineer and UI/UX Designer specialized in SvelteKit, TypeScript, Tailwind CSS, and Docker infrastructure. Your task is to build **GLdash**, a fast, elegant, and lightweight homelab dashboard and application launcher.

---

## 🛠️ Tech Stack & Constraints

- **Framework:** SvelteKit (Svelte 5 / Runes) with TypeScript (Strict Mode).
- **Styling:** Tailwind CSS (v4) + Lucide Icons (`lucide-svelte`) + Simple Icons integration.
- **State & IO:** `js-yaml` for parsing/writing `config.yaml`, `zod` for strict schema validation.
- **Drag & Drop:** `svelte-dnd-action` (or native Svelte 5 dnd handlers).
- **PWA:** `@vite-pwa/sveltekit` (Manifest, Web App installable, Service Worker).
- **Containerization:** Docker multi-stage build (`node:22-alpine`).

---

## 🧱 Data Schema (`config/config.yaml`)

All data must be strictly validated using **Zod** on both server read/write operations.

```yaml
settings:
  layout: "grid" # Options: "grid" | "fluid" | "table"
  columns: 4 # Dynamic: 2 to 6
  theme:
    background: "#0f172a"
    textColor: "#f8fafc"
    cardBackground: "#1e293b"

categories:
  - name: "Infraestrutura"
    apps:
      - id: "pihole-01"
        title: "Pi-hole"
        url: "[http://192.168.1.10/admin](http://192.168.1.10/admin)"
        icon: "simple-icons:pihole" # Lucide, Simple-Icons, URL ou fallback
        note: "DNS Primário da Rede"
        githubRepo: "pi-hole/pi-hole" # Para Fase 3
        dockerImage: "pihole/pihole" # Para Fase 3
```

## 🎨 Design System & Anti-AI Slop Safeguards

To avoid generic "AI slop" visual patterns, strictly follow these visual UI/UX rules:

1. **Colors & Contrast:**
   - NO heavy neon gradients, glassmorphism overuse, or glowing multi-color drop shadows.
   - Use clean, dark-mode neutral tones (`slate` or `zinc`).
   - Cards must use discrete `1px` borders with low opacity (`border-slate-700/50`) and subtle hover state elevation (`hover:border-slate-500/50 transition-all duration-150`).
2. **Typography & Spacing:**
   - Hierarchy: Title (medium/bold, standard font size), Note (muted gray, smaller text `text-xs opacity-75`), URLs (hidden or truncated).
   - Consistent padding: Spacing units based on a 4px grid (`p-4`, `gap-4`).
3. **Animations:**
   - Micro-interactions only (smooth 150ms transitions).
   - Drag-and-drop placeholder states must be clean and dashed, avoiding harsh layout jumps.

---

## 🐳 Dockerization Standard

Multi-stage `Dockerfile` (`node:22-alpine`) and a working `docker-compose.yml` example exposing port `3000` and mounting the `./config:/app/config` volume.

---

## 🚨 Implementation Rules

- Do NOT write bloated monolithic components. Keep logic in separate TS utility files (`src/lib/server/yaml.ts`, `src/lib/utils/icons.ts`) and components under 150 lines of code.
- Ensure 100% strict TypeScript types for all Svelte props and API payloads.
- Always include error handling for broken YAML files or missing paths.
