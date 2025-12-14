import { auth } from "../lib/auth";
import type { Route } from "./+types/api.auth";

export const action = async ({ request }: Route.ActionArgs) => {
  return await auth.handler(request);
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  return await auth.handler(request);
};
