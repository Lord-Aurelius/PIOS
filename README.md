# PIOS

Political Intelligence Operating System: an enterprise-grade multi-tenant campaign command platform.

## Quick Start

```bash
pnpm install
pnpm db:generate
pnpm dev
```

Or run the local infrastructure:

```bash
docker compose up --build
```

## Apps

- `apps/web`: Next.js command center UI.
- `apps/api`: NestJS REST and realtime API.
- `services/ai`: FastAPI AI intelligence service.
- `packages/database`: Prisma schema and seed data.

## Core MVP

- tenant-aware command metrics
- field intelligence intake
- GIS GeoJSON regions
- social narrative monitoring
- AI recommendations
- alert center
- executive dashboard
