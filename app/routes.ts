import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  layout("routes/layout.tsx", [
    index("routes/projects.tsx"),
    route("projects/:id", "routes/project-detail.tsx"),
    route("auth/signin", "routes/auth.signin.tsx"),
    route("auth/signup", "routes/auth.signup.tsx"),
    route("admin", "routes/admin.tsx"),
  ]),
  route("api/projects", "routes/api.projects.tsx"),
  route("api/todos", "routes/api.todos.tsx"),
  route("api/auth/*", "routes/api.auth.tsx"),
] satisfies RouteConfig;
