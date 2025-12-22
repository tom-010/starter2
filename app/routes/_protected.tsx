import { Outlet, redirect } from "react-router";
import type { Route } from "./+types/_protected";
import { auth } from "~/lib/auth.server";

// Middleware runs BEFORE child loaders - strict auth gate
export const middleware: Route.MiddlewareFunction[] = [
  async ({ request }, next) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      throw redirect("/login");
    }

    return next();
  },
];

export default function ProtectedLayout() {
  return <Outlet />;
}
