FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @urbanflow/shared build
RUN pnpm --filter @urbanflow/web build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app /app
WORKDIR /app/apps/web
EXPOSE 3000
CMD ["node", "server.js"]