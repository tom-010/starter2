import { Outlet } from "react-router";
import { getCurrentUser } from "../lib/session";
import type { Route } from "./+types/layout";

export async function loader({ request }: Route.LoaderArgs) {
  // Check if this is a public route (auth pages)
  const url = new URL(request.url);
  if (url.pathname.startsWith("/auth/")) {
    return { user: null };
  }

  // For all other routes, get current user (auth check happens via navigation)
  const user = await getCurrentUser(request);
  return { user };
}

export default function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Outlet />
    </div>
  );
}
