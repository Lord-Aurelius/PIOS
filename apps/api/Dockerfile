FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/database/package.json packages/database/package.json
RUN pnpm install --filter @pios/api... --no-frozen-lockfile
COPY . .
RUN pnpm --filter @pios/database prisma:generate && pnpm --filter @pios/api build
EXPOSE 4000
CMD ["node", "apps/api/dist/main.js"]
