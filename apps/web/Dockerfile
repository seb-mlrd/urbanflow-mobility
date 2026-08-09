FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @urbanflow/shared build
RUN pnpm --filter @urbanflow/web build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app /app
RUN mkdir -p /app/apps/web/.next/standalone/apps/web/.next \
 && cp -r /app/apps/web/public /app/apps/web/.next/standalone/apps/web/public \
 && cp -r /app/apps/web/.next/static /app/apps/web/.next/standalone/apps/web/.next/static
WORKDIR /app/apps/web/.next/standalone/apps/web
EXPOSE 3000
CMD ["node", "server.js"]