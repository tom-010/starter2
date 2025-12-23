import { redirect } from "react-router";

// Home route redirects based on feature flag
export function loader() {
  if (__ENABLE_DASHBOARD__) {
    throw redirect("/dashboard");
  }
  throw redirect("/projects");
}

export default function Home() {
  return null;
}
