# syntax=docker/dockerfile:1

# ---- Base ----------------------------------------------------------------
FROM node:22-alpine AS base
WORKDIR /app

# ---- Dependencies ---------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- Build -----------------------------------------------------------------
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build && npm prune --omit=dev

# ---- Runtime -----------------------------------------------------------------
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV CONFIG_PATH=/app/config/config.yaml
ENV BODY_SIZE_LIMIT=6M

COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/config/default-bg.jpg ./default-bg.jpg

RUN mkdir -p /app/config /app/static/backgrounds
COPY --from=build /app/config/config.defaults.yaml /app/config/config.defaults.yaml

# Run as an unprivileged user. The config and backgrounds dirs are writable by
# the node user so uploads and config saves work; mounted volumes should be
# owned accordingly (chown -R 1000:1000 on the host for bind mounts).
RUN chown -R node:node /app/config /app/static/backgrounds
USER node

EXPOSE 3000

CMD ["node", "build/index.js"]
