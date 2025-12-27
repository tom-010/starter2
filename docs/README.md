# Documentation Index

## Overview

- **[Project Overview](./overview.md)** - Comprehensive narrative description (presentation-ready, ~3000 words)
- **[Tech Stack & Reasoning](./tech-stack.md)** - Every technology choice explained

## Getting Started

- **[Quick Start](./quick-start.md)** - Get running in 5 minutes

## Reference

- **[Project Architecture](./project-architecture.md)** - Complete reference for reproducing the entire project
- **[Demo Todo App](./demo-todo-app.md)** - Walkthrough of the example application

## Subsystems

- **[Async Tasks](./async-tasks.md)** - Background job processing with Graphile Worker
- **[Python Bridge](./python-bridge.md)** - Type-safe RPC between TypeScript and Python
- **[Configuration](./config.md)** - Environment variables and config layer
- **[Feature Flags](./feature-flags.md)** - Compile-time feature flags

---

## Quick Links

| Task | Command |
|------|---------|
| Start dev | `npm run dev` |
| Build | `npm run build` |
| Type check | `npm run typecheck` |
| Migrate DB | `npm run db:migrate` |
| View DB | `npm run db:studio` |
| Add user | `npx tsx scripts/manage-users.ts create email@example.com password` |
| Add component | `npx shadcn@latest add button` |
| Regen Python SDK | `./scripts/sync-py.sh` |

## File Locations

| What | Where |
|------|-------|
| Routes | `app/routes.ts` + `app/routes/` |
| Database schema | `prisma/schema.prisma` |
| Zod schemas | `app/lib/schemas.ts` |
| Auth config | `app/lib/auth.server.ts` |
| Python endpoints | `py/main.py` |
| Background jobs | `scripts/worker.ts` |
| UI components | `app/components/ui/` |
