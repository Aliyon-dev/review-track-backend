FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./

# ── deps stage: production dependencies only ──────────────────────────────────
FROM base AS deps
RUN npm ci --omit=dev

# ── build stage: compile TypeScript ───────────────────────────────────────────
FROM base AS build
RUN npm ci
COPY tsconfig.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY src ./src
RUN npm run build && npx prisma generate

# ── runtime stage ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/generated ./src/generated
COPY package.json ./

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/server.js"]
