# Tech Stack & Reasoning

Every technology choice in this stack was made deliberately. This document explains what we use and why.

---

## Motivation & Decision Framework

This stack emerged from a specific worldview about software development. Understanding that worldview helps explain the choices and guides future decisions.

### The Goal

**Ship valuable software fast.**

That's it. Everything else is in service of this goal.

We make money by delivering value to customers. The more value we ship, the more money we make. We take a share of the value created—so our incentive is to maximize that value, not to build impressive technology.

Value comes from functionality and features. Not from clean architecture. Not from test coverage. Not from using the latest framework. Customers pay for software that solves their problems. They don't pay for elegant code.

Developer velocity is the bottleneck. The faster we can turn ideas into working software, the more value we create. Every hour spent configuring build tools, debugging framework magic, or debating abstractions is an hour not spent shipping features.

This stack is optimized for one thing: **turning developer time into customer value as efficiently as possible.**

### Who This Is For

This stack is for programmers who are tired. Tired of configuration. Tired of debugging build tools. Tired of keeping up with the JavaScript ecosystem's weekly reinventions. Tired of "best practices" that add complexity without adding value.

It's for people who've built enough software to know that most of it doesn't need to scale. Most B2B applications serve dozens of users, not millions. Most features are CRUD with a nice UI. Most complexity is accidental, not essential.

It's for pragmatists who value shipping over architecture. Who would rather have a working feature today than a perfectly abstracted one next month. Who understand that code is a liability, not an asset, and that the best code is often no code at all.

It's for developers who work with AI coding assistants. Clear patterns, strong types, and compiler errors create feedback loops that help both humans and agents write correct code faster.

### The Values

**Simplicity over flexibility.** Every abstraction has a cost. Every configuration option is a decision someone has to make. We prefer constraints that eliminate choices over frameworks that enable infinite customization. When you can only do things one way, you stop debating how to do them.

**Shipping over correctness.** Perfect is the enemy of done. We'd rather have 80% of the feature in production getting real feedback than 100% of the feature in a branch getting reviewed. Users don't care about code quality. They care about whether the software solves their problem.

**Boring over exciting.** New technologies are risky. They have unknown failure modes, sparse documentation, and communities that might disappear. Old technologies are boring, but boring means predictable. PostgreSQL will exist in 20 years. That hot new database might not exist in 2.

**Ownership over convenience.** Managed services are easy until they're not. When something breaks at 3am, you need to be able to fix it. Self-hosted, open-source tools running on infrastructure you control means you're never blocked waiting for someone else's support ticket.

**Speed of development over speed of execution.** Developer time is expensive. Server time is cheap. We don't optimize queries for 10 users. We don't cache data that takes 50ms to fetch. We write the obvious code, ship it, and optimize only when we have evidence that something is slow.

### The Decision Framework

When evaluating a technology choice, ask:

1. **Does this reduce complexity or add it?** If it requires configuration, learning new concepts, or debugging new failure modes, it better provide significant value in return.

2. **Can we run this locally on a laptop?** If it requires cloud services, external APIs, or special infrastructure, it's probably not worth the dependency.

3. **Will this exist in 10 years?** Prefer technologies with long track records over recent innovations. SQL, HTTP, and HTML have survived decades. Most JavaScript frameworks haven't survived one.

4. **Does this help coding agents?** Strong types, compiler errors, and predictable patterns create feedback signals. Magic, implicit behavior, and runtime errors don't.

5. **What's the failure mode?** When this breaks—and it will—how hard is it to debug? Can you read the source code? Can you reason about what went wrong?

6. **Are we solving a problem we actually have?** Don't add caching until something is slow. Don't add microservices until the monolith is unmanageable. Don't add Kubernetes until you need more than one server.

The default answer to "should we add this?" is no. The burden of proof is on the new thing.

### What This Is Not

This is not a stack for:

- **Startups chasing scale.** If you're building for millions of users, you need different trade-offs.
- **Teams that love new technology.** If exploring the cutting edge is part of the joy for you, this stack will feel limiting.
- **Projects with complex performance requirements.** If you're building real-time systems, games, or high-frequency trading, look elsewhere.
- **Designers who want creative control.** We use defaults. If pixel-perfect custom design is important to your product, you'll fight this stack.

This is a stack for building internal tools, B2B SaaS, admin panels, and line-of-business applications. Software where the value is in the features, not the technology.

---

## Core Principles

**Boring is better.** We optimize for:
- **Simplicity** — fewer moving parts, less cognitive load
- **Stability** — web standards over framework magic
- **Speed of development** — ship features, not infrastructure
- **Agentic coding** — clear signals for AI assistants (type errors, compiler feedback)
- **Low resource requirements** — runs on cheap VPS and developer laptops

We design for **10 concurrent users**. Scale is not a concern.

---

## Framework: React Router v7

**What:** Full-stack React framework with SSR and built-in data loading.

**Why SSR:**
- Avoids shipping a massive JavaScript bundle to the browser
- Scales to large applications and big teams
- Relies on web fundamentals (HTTP, HTML, forms) — proven stable for decades
- Progressive enhancement: works without JavaScript, enhanced with it

**Why React Router v7:**
- **Simple mental model.** Like Django or a PHP file. Request comes in, you fetch data, render HTML, done. No magic.
- **No magic.** Explicit routing via `routes.ts`. You can see what maps where. This matters for humans and coding agents alike.
- **Not tied to a vendor.** Next.js is increasingly coupled to Vercel and uses non-standard patterns (Server Components, edge runtime quirks). We don't want our framework choice to dictate our hosting.
- **Web standards.** Forms work like forms. Requests work like requests. The browser back button works.
- **Agent-friendly.** Simple patterns mean coding agents can understand and modify the codebase reliably.

Next.js has too much magic. It's hard to reason about, hard to debug, and the constant innovation creates churn. We want boring.

---

## Styling: Tailwind CSS v4

**What:** Utility-first CSS framework.

**Why Tailwind:**
- **Avoid writing CSS.** CSS is another language with its own rules, specificity wars, and naming debates. We don't want to think about it.
- **No design system to maintain.** We're not designers. We build UX and ship features fast.
- **Constraint:** Everything through Tailwind utilities. No custom CSS files. This eliminates decisions.

We don't differentiate through design. We differentiate through customer value.

---

## UI Components: Shadcn UI

**What:** Copy-paste component library built on Radix primitives.

**Why Shadcn:**
- **Good enough and consistent.** Professional-looking components that handle accessibility.
- **We own the code.** Components live in our repo. No fighting library opinions or upgrade hell.
- **No design decisions.** Just use the defaults. They're fine.

We don't differentiate through design. We differentiate through customer value. Shadcn gives us a consistent, accessible UI without thinking about it.

---

## Database: PostgreSQL

**What:** Reliable relational database.

**Why PostgreSQL:**
- **One database for everything.** Application data, sessions, background jobs. Reduces complexity.
- **We would use SQLite, but can't.** Graphile Worker requires PostgreSQL features (LISTEN/NOTIFY, advisory locks). Also, Postgres scales if the software grows.
- **Proven.** Decades of production use. Known failure modes. Runs everywhere.

Simplicity means fewer moving parts. One database, not database + Redis + message queue.

---

## ORM: Prisma v7

**What:** Type-safe database client with declarative schema.

**Why Prisma:**
- **Not thinking about SQL makes us fast.** Most B2B operations are simple CRUD. Read a row, update a field, save it back. Prisma makes this trivial.
- **Active Record pattern.** We valued this in Django projects. Fetch an object, modify it, save. No ceremony.
- **Types everywhere.** Query results are typed. The compiler catches schema mismatches. Good signal for coding agents.
- **Prisma Studio.** Visual database browser for debugging.

We don't need query optimization for 10 users. We need to ship features. Prisma makes us fast.

---

## Authentication: BetterAuth

**What:** Auth library with email/password and extensibility.

**Why BetterAuth:**
- **Simple login to start.** Email and password works. Ship it.
- **Extensible for enterprise.** When customers need SSO, OAuth, or SAML, BetterAuth can grow with us.
- **Self-hosted.** No third-party dependency. No per-user pricing. Works offline in development.
- **Prisma integration.** User tables live in our schema. One source of truth.

B2B apps provision users — self-registration is disabled. Admins create accounts via CLI or admin UI.

---

## Background Jobs: Graphile Worker

**What:** PostgreSQL-backed job queue.

**Why Graphile Worker:**
- **No additional service.** Uses the same Postgres database. One thing to run, not two.
- **Celery replacement.** We came from Python/Django where Celery + Redis was standard. Graphile gives us the same pattern without Redis.
- **Must run locally.** Our stack runs on low-powered VPS and developer laptops. No external providers, no cloud queues.
- **Transactional.** Jobs are created inside database transactions. If the transaction rolls back, the job never existed.

Simple. One database. No infrastructure to manage.

---

## Python Bridge: FastAPI (RPC, not REST)

**What:** Python service for compute-heavy tasks, accessed via typed RPC.

**Why Python:**
- **Language of AI.** ML libraries, LLM tooling, embeddings — all Python-first.
- **Some things are just easier.** Image processing with Pillow. Data manipulation with pandas. We don't rewrite working Python code in TypeScript.

**Why FastAPI:**
- **OpenAPI schema from types.** Define a Pydantic model, FastAPI generates OpenAPI spec automatically.
- **Type codegen.** We generate TypeScript types and SDK from OpenAPI using `@hey-api/openapi-ts`. If the Python API changes, the TypeScript types change, the compiler errors, the coding agent gets a signal.
- **Boring web requests.** Inter-process communication via HTTP. Works everywhere. Easy to debug with curl.

**This is RPC, not REST:**
- Endpoints are **verbs** (`/resize`, `/generate-thumbnail`), not resources
- This is **internal function calling**, not a public API
- Think of it as TypeScript calling Python functions with type safety across the boundary
- Server-side only — never called from the browser

The Python service is 100% coupled to this app. Same container in production. Not a microservice.

---

## Build & Package Management

**Vite** — The default for modern React. Fast, works with React Router. We don't think about it.

**npm** — The default Node.js package manager. No configuration, works everywhere.

**uv** — Fast Python package installer. Drop-in pip replacement with proper lockfiles.

We optimize for agentic coding. Defaults are good. Less configuration means fewer things for agents (and humans) to get wrong.

---

## Testing: Playwright + Vitest

**What:** E2E testing (Playwright) and unit testing (Vitest).

**Why we test:**
- **Agentic feedback signal.** Tests give coding agents a way to verify their changes work.
- **Critical paths only.** We don't aim for coverage. We test what matters.

**Why Playwright:** Multi-browser, reliable, good API.

**Why Vitest:** Native Vite integration, fast, same config as build.

Tests are code. Code is liability. Test sparingly but strategically.

---

## Logging: Pino

**What:** Structured JSON logger.

**Why structured logging:**
- **Debugging for agents and humans.** Parseable logs help both coding agents and developers understand what happened.
- **Context fields.** Attach userId, requestId, action to every log. Filter and search later.
- **Pretty in dev, JSON in prod.** Human-readable during development, machine-parseable in production.

Speed is not a concern. We have 10 users.

---

## Forms & Validation: Zod

**What:** Schema validation library used for forms.

**Why Zod:**
- **Typed data from forms.** Parse FormData through a Zod schema, get typed objects out. The type system knows what you have.
- **Client and server.** Same schema validates on both sides. Progressive enhancement.
- **Fast feedback for agents.** Type errors from schema mismatches are immediate compiler signals.

Boring web forms for almost everything. `<Form method="post">`, parse with Zod, get typed data. No state management, no API calls, no complexity.

---

## What We Don't Use (And Why)

| Technology | Why Not |
|------------|---------|
| Redux/Zustand | URL is state, database is truth |
| GraphQL | Overkill. Loaders fetch exactly what we need |
| tRPC | React Router actions give us typed mutations already |
| Microservices | Monolith is fine. One deploy, one thing to monitor |
| Redis | Postgres handles sessions and jobs |
| CDN | Not needed at our scale |
| Kubernetes | Overkill. Single container on a VPS is fine |
| External auth (Clerk, Auth0) | Self-hosted, no vendor dependency |
| External queues (SQS, etc.) | Must run locally on cheap hardware |

---

## Summary

This stack optimizes for:

1. **Developer velocity** — ship features, not infrastructure
2. **Simplicity** — one database, one framework, no magic
3. **Agentic coding** — types, compiler errors, clear patterns
4. **Low requirements** — runs on $5 VPS and developer laptops
5. **Stability** — web standards, proven tech, no churn

It explicitly does not optimize for:

1. **Scale** — we design for 10 users
2. **Novelty** — we don't adopt new tech for its own sake
3. **Flexibility** — constraints are features
4. **Design** — we differentiate through value, not aesthetics
