import { Outlet, redirect } from "react-router";
import type { Route } from "./+types/_protected";
import { auth } from "~/lib/auth.server";
import { log } from "~/lib/logger.server";

// Middleware runs BEFORE child loaders - strict auth gate
export const middleware: Route.MiddlewareFunction[] = [
  async ({ request }, next) => {
    const start = Date.now();
    const url = new URL(request.url);

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      log.info({ path: url.pathname, userId: null }, "auth_redirect");
      throw redirect("/login");
    }

    const response = await next();
    const ms = Date.now() - start;

    log.info(
      {
        method: request.method,
        path: url.pathname,
        userId: session.user.id,
        ms,
      },
      "request"
    );

    return response;
  },
];

export default function ProtectedLayout() {
  return <Outlet />;
}
