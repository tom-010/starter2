# Notes on rr7

## 1. The Architecture of Subtraction

To adhere to your "Code is Liability" axiom, we must eliminate entire categories of code commonly found in React apps.

* **Delete your API Layer:** You do not need a REST or GraphQL API for your own frontend. You do not need `axios`, `fetch` wrappers, or `useEffect`.
* **Delete Client State:** You do not need Redux, Zustand, or Context for data.
* **Delete Loading Spinners:** You mostly don't need manual loading states if you use Optimistic UI correctly.

**The Golden Rule:**

> **The URL is the Source of Truth. The Database is the State. The Client is just a View.**

## 2. The Implementation (The "Boring" Stack)

### A. Co-location is King (Entropy Reduction)

Do not split your code into `controllers`, `services`, and `views`. That introduces context switching. In v7, a single file defines the Route, the Data (Loader), and the Mutation (Action).

**The Pattern:**

1. **Loader (Server):** Runs *only* on the server. Connects directly to DB (Prisma/Drizzle). Returns strictly what the UI needs.
2. **Component (View):** Receives data via props. Renders.
3. **Action (Server):** Handle form POSTs. Mutates DB. Returns errors or redirects.
4. **Form (Client):** Standard HTML `<Form>`. No `useState` for inputs.

### B. The "God Mode" Route Module

Here is what a "Maximum Utility / Minimum Syntax" route looks like in v7. This file handles *everything* for a specific feature (e.g., `/settings`).

```tsx
import type { Route } from "./+types/settings"; // v7 Auto-generated types
import { Form, useNavigation } from "react-router";
import { db } from "~/db.server"; // Direct DB access
import { redirect } from "react-router";

// 1. READ (Server-side only)
export async function loader({ request }: Route.LoaderArgs) {
  // Authentication check (centralized function, keep it dry)
  const user = await requireUser(request);
  const settings = await db.settings.findUnique({ where: { userId: user.id } });
  return { settings };
}

// 2. WRITE (Server-side only)
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  // Validations: Use Zod here if you want, or plain checks.
  // Fail fast.
  const theme = formData.get("theme");

  await db.settings.update({
    where: { /* ... */ },
    data: { theme: String(theme) }
  });

  return { ok: true };
}

// 3. RENDER (Client/Server Hybrid)
export default function SettingsPage({ loaderData }: Route.ComponentProps) {
  const { settings } = loaderData;
  const navigation = useNavigation();

  // Optimistic UI: The "Trick" to feeling snappy without client state
  // If we are submitting, pretend it's already done.
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="p-4">
      <h1>Settings</h1>
      <Form method="post">
        <label>
          Theme
          <select name="theme" defaultValue={settings.theme} disabled={isSubmitting}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <button type="submit">
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </Form>
    </div>
  );
}

```

## 3. "Seasoned" Tricks for Velocity

* **Use `routes.ts` over File-System Routing:**
File-system routing (Next.js style) is implicit magic. Magic is debt.
Use the `routes.ts` config file. It is explicit. You can look at one file and see exactly which URL maps to which file on disk. It allows you to reshape URLs without moving files (refactoring safety).
* **The `intent` Pattern:**
Don't write 5 different actions for one page. Use a hidden input `<input type="hidden" name="intent" value="delete" />` in your forms. In your `action`, switch on `intent`. This keeps related logic co-located.
* **Cookie Session Auth:**
Don't use JWTs in local storage. It’s insecure and requires client JS. Use `createCookieSessionStorage`. It works with SSR out of the box and is "Lindy" (standard HTTP cookies).
* **Type Safety without TypeScript Gymnastics:**
RR v7 has a new type generator. As seen in the snippet `import type { Route } ...`. Use this. It infers the return type of your loader automatically. If you change the DB call, the Component red-lines immediately.

### 4. What to Ignore (Distractions)

* **`clientLoader`:** You mentioned "state in the database." Good. Avoid `clientLoader` unless you are building a pure offline-first app (rare for B2B). Stick to standard `loader`.
* **Library Mode:** You are building an app, not migrating an old one. Use **Framework Mode** (`ssr: true`).
* **Complex Caching:** React Router v7 revalidates data automatically after every Action. Trust it. Don't add a caching layer until you can prove with a profiler that you need it.

### 5. Final Advice on "Imperfect Shipping"

Since you value speed and "good enough," lean heavily on **HTML Standards**.
If your JS bundle fails to load or crashes, a React Router app built with `<Form>` and `loader` often *still works* because it falls back to standard browser navigation and form posting. That is the ultimate reliability mechanism.

---

### Recommended Next Step

Run `npx create-react-router@latest` and select the **Framework** option. Then, immediately go into `react-router.config.ts` and verify `ssr: true`. Create one route using the pattern above to prove the database connection.

... [React Router v7 Tutorial - Routing, Nested Routes, Data Loading, Layouts...](https://www.youtube.com/watch?v=h7MTWLv3xvw)

This video is a practical, no-fluff walkthrough of the v7 fundamentals (Loaders, Actions, Forms) that replaces the need for complex state management, aligning with your "subtraction" philosophy.