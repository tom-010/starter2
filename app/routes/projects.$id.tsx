import type { Route } from "./+types/projects.$id";
import { useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Link, Form } from "react-router";
import { Plus, ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { TodosTable } from "~/components/todos-table";
import type { Project, Todo } from "~/db/schema";
import { db } from "~/db/client";
import { CreateTodoSchema } from "~/lib/schemas";
import { routes } from "~/lib/routes";

export async function loader({ params, request }: Route.LoaderArgs) {

  if (!params.id) {
    throw new Response("Not Found", { status: 404 });
  }

  const projectId = parseInt(params.id);
  const project = await db.query.projects.findFirst({
    where: (p, { eq }) => eq(p.id, projectId),
  });

  if (!project) {
    throw new Response("Not Found", { status: 404 });
  }

  const projectTodos = await db.query.todos.findMany({
    where: (t, { eq }) => eq(t.projectId, projectId),
  });

  return { project, todos: projectTodos };
}

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Project` },
    { name: "description", content: "View and manage project todos" },
  ];
}

export default function ProjectDetailPage({
  loaderData,
}: Route.ComponentProps) {
  const project = loaderData.project;


  const [form, fields] = useForm({
    constraint: getZodConstraint(CreateTodoSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: CreateTodoSchema });
    },
    shouldValidate: "onBlur",
  });

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Link to={routes.home} className="inline-block mb-6">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
        </div>

        <Form
          method="post"
          action={routes.createTodo.path}
          className="mb-8"
        >
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                key={fields.title.key}
                name={fields.title.name}
                placeholder="Add a new todo..."
                className="flex-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input type="hidden" name="projectId" value={project.id} />
              <input type="hidden" name="priority" value="medium" />
              <Button type="submit">
                <Plus className="h-4 w-4 mr-2" />
                Add Todo
              </Button>
            </div>
            {fields.title.errors && (
              <p className="text-destructive text-sm">{fields.title.errors[0]}</p>
            )}
          </div>
        </Form>

        {loaderData.todos.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <p className="text-lg">No todos yet. Create one to get started!</p>
          </div>
        ) : (
          <TodosTable todos={loaderData.todos} />
        )}

        <div className="mt-8 pt-6 border-t text-sm text-muted-foreground">
          <p>
            {loaderData.todos.filter((t) => !t.completed).length} of {loaderData.todos.length} tasks
            completed
          </p>
        </div>
      </div>
    </div>
  );
}
