import { redirect } from "react-router";
import { getCurrentUser } from "./session";

export async function requireAuth(request: Request) {
  const user = await getCurrentUser(request);

  if (!user) {
    const url = new URL(request.url);
    const loginUrl = new URL("/auth/signin", request.url);
    loginUrl.searchParams.set("from", url.pathname);
    throw redirect(loginUrl.toString());
  }

  return user;
}

export async function requireAdmin(request: Request) {
  const user = await requireAuth(request);

  if (user.role !== "admin") {
    throw redirect("/");
  }

  return user;
}
