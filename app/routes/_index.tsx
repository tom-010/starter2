import type { Route } from "./+types/_index";
import { useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form } from "react-router";
import { Plus, Folder } from "lucide-react";
import { Button } from "~/components/ui/button";
import { ProjectsTable } from "~/components/projects-table";
import type { Project } from "~/db/schema";
import { db } from "~/db/client";
import { CreateProjectSchema } from "~/lib/schemas";
import { routes } from "~/lib/routes";

export async function loader({ request }: Route.LoaderArgs) {
  const allProjects = await db.query.projects.findMany();
  return { allProjects };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Projects" },
    { name: "description", content: "Manage your projects" },
  ];
}

export default function ProjectsPage({ loaderData }: Route.ComponentProps) {

  const [form, fields] = useForm({
    constraint: getZodConstraint(CreateProjectSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: CreateProjectSchema });
    },
    shouldValidate: "onBlur",
  });

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Projects</h1>
          <p className="text-muted-foreground">Organize your todos into projects</p>
        </div>

        <Form method="post" action={routes.createProject.path} className="mb-8">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                key={fields.name.key}
                name={fields.name.name}
                placeholder="Create a new project..."
                className="flex-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input type="hidden" name="color" value="blue" />
              <Button type="submit" className="px-6">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>
            {fields.name.errors && (
              <p className="text-destructive text-sm">{fields.name.errors[0]}</p>
            )}
          </div>
        </Form>

        {loaderData.allProjects.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No projects yet. Create one to get started!</p>
          </div>
        ) : (
          <ProjectsTable projects={loaderData.allProjects} />
        )}
      </div>
    </div>
  );
}
