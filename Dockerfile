FROM node:22.18-bookworm-slim AS builder

WORKDIR /app

RUN corepack enable

COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM node:22.18-bookworm-slim AS runner

WORKDIR /app

ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder --chown=node:node /app/apps/site/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/site/.next/static ./apps/site/.next/static
COPY --from=builder --chown=node:node /app/apps/site/public ./apps/site/public

USER node

EXPOSE 3000

CMD ["node", "apps/site/server.js"]
