# Configuration Layer

Centralized configuration via `app/lib/config.server.ts`.

## How it works

- Uses Zod to validate environment variables at startup
- Fails fast if required variables are missing
- Exports a typed `config` object

## Usage

```ts
import { config } from "~/lib/config.server";

// Access configuration
config.db.url        // Database connection string
config.auth.secret   // Auth secret
config.auth.url      // Auth base URL
config.isDev         // true in development
config.isProd        // true in production
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Yes | Secret for session encryption |
| `BETTER_AUTH_URL` | Yes | Base URL for auth callbacks |
| `NODE_ENV` | No | development (default), production, test |

## Adding New Variables

1. Add to schema in `config.server.ts`:
```ts
const envSchema = z.object({
  // existing...
  MY_NEW_VAR: z.string().min(1),
});
```

2. Export in the config object:
```ts
return {
  // existing...
  myNewVar: result.data.MY_NEW_VAR,
};
```
