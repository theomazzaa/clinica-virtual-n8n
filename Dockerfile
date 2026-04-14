FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY prisma ./prisma

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npx prisma generate
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Variables de entorno con defaults — sobreescribir en Easypanel con los valores reales
ENV AUTH_SECRET="docagent-secret-k3y-c1inica-v1rtual-2024"
ENV NEXTAUTH_SECRET="docagent-secret-k3y-c1inica-v1rtual-2024"
ENV NEXTAUTH_URL="https://n8n-medipanel.htkfef.easypanel.host"
ENV DATABASE_URL="postgresql://postgres:fc952adf1733c9d91d4b@n8n_postgres:5432/clinica_virtual?sslmode=disable"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
