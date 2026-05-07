FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --filter @pios/web... --no-frozen-lockfile
COPY . .
RUN pnpm --filter @pios/web build
EXPOSE 3000
CMD ["pnpm", "--filter", "@pios/web", "start"]
