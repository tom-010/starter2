# Feature Flags

Compile-time flags that enable/disable features. Disabled code is removed from the bundle (dead code elimination).

## Available Flags

| Flag | Default | Description |
|------|---------|-------------|
| `ENABLE_DASHBOARD` | `true` | Dashboard page at `/dashboard` |

## Usage

**Dev (all enabled by default):**
```bash
npm run dev
```

**Build with flag disabled:**
```bash
ENABLE_DASHBOARD=false npm run build
```

**Build with all defaults (enabled):**
```bash
npm run build
```

## Adding New Flags

1. Add to `vite.config.ts`:
   ```typescript
   const featureFlags = {
     __ENABLE_DASHBOARD__: JSON.stringify(process.env.ENABLE_DASHBOARD !== "false"),
     __ENABLE_NEW_FEATURE__: JSON.stringify(process.env.ENABLE_NEW_FEATURE !== "false"),
   };
   ```

2. Add type to `env.d.ts`:
   ```typescript
   declare const __ENABLE_NEW_FEATURE__: boolean;
   ```

3. Use in code:
   ```tsx
   // In components
   {__ENABLE_NEW_FEATURE__ && <NewFeature />}

   // In routes - redirect if disabled (makes route inaccessible)
   export async function loader() {
     if (!__ENABLE_NEW_FEATURE__) {
       throw redirect("/fallback");
     }
     // ... feature code
   }
   ```
