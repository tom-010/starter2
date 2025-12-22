import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Auth routes
  route("api/auth/*", "routes/api.auth.$.ts"),
  route("login", "routes/login.tsx"),

  // App routes
  index("routes/projects-list.tsx"),
  route("projects/:id", "routes/project-detail.tsx"),
  route("todos/:id", "routes/todo-detail.tsx"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
