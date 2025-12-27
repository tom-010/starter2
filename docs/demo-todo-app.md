# Demo Todo App

The starter includes a fully-functional todo application demonstrating all patterns. This is intended as a reference implementation to be modified or deleted.

---

## Features Demonstrated

| Feature | Implementation |
|---------|----------------|
| CRUD operations | Projects, Todos, Users |
| Form validation | Client + server with Zod |
| File uploads | Attachments with thumbnails |
| Background jobs | Thumbnail generation |
| User assignments | Many-to-many relationships |
| Role-based access | Admin pages |
| Breadcrumb navigation | Dynamic per-route |
| Pagination | Client-side table pagination |
| Multi-action forms | Intent-based dispatch |

---

## Data Model

```
Project (1) ─────────── (*) Todo
                              │
                              ├── (*) Attachment
                              │
                              └── (*) TodoAssignment ─── User
```

### Project
- Container for todos
- Name, description, color
- Cascade delete removes all todos

### Todo
- Belongs to project and user (owner)
- Title, description, priority (low/medium/high), due date
- Completed status
- Has many attachments and assignments

### Attachment
- File uploaded to `/public/uploads/`
- Filename, filepath, mimetype, size
- Optional thumbnail (generated async)

### TodoAssignment
- Assigns a todo to a user (not owner)
- Tracks who assigned (assignedBy)
- Unique constraint: one assignment per user per todo

---

## Route Structure

### Projects List (`/projects`)

**Loader:** Fetches all projects

**Actions:**
- Default (no intent): Create project
- `deleteProject`: Delete project by ID

**Features:**
- Create form inline
- Paginated table (ProjectsTable)
- Delete with confirmation

### Project Detail (`/projects/:id`)

**Loader:** Fetches project + user's todos

**Actions:**
- `updateProject`: Edit name/description
- `deleteProject`: Delete entire project
- `createTodo`: Add todo to project
- `updateTodo`: Toggle completed/priority
- `deleteTodo`: Remove todo

**Features:**
- Inline project editing (hover to reveal pencil)
- Auto-focus input after creating todo
- Completion counter

### Todo Detail (`/todos/:id`)

**Loader:** Fetches todo with attachments, assignments, all users

**Access:** Owner OR assigned users

**Actions:**
- `uploadAttachment`: File upload (max 10MB)
- `deleteAttachment`: Remove attachment + file
- `assignUser`: Assign user to todo (owner only)
- `unassignUser`: Remove assignment (owner only)

**Features:**
- Status, priority, due date display
- Thumbnail display for images
- User assignment dialog with search
- Edit link (owner only)

### Todo Edit (`/todos/:id/edit`)

**Loader:** Fetches todo

**Action:** Updates all fields

**Features:**
- Full form with all fields
- Date picker for due date
- Checkbox for completion

---

## Multi-Action Form Pattern

Actions use `intent` field to dispatch:

```tsx
// Component
<Form method="post">
  <input type="hidden" name="intent" value="deleteProject" />
  <input type="hidden" name="id" value={project.id} />
  <Button type="submit">Delete</Button>
</Form>

// Action
export async function action({ request }) {
  const formData = await request.formData();
  const intent = getIntent(formData);  // from ~/lib/forms

  switch (intent) {
    case "deleteProject":
      const { id } = parseFormDataOrThrow(formData, deleteByIdSchema);
      await db.project.delete({ where: { id } });
      return redirect("/projects");

    default:
      // Handle create (no intent)
  }
}
```

---

## File Upload Flow

1. User submits file via `<Form encType="multipart/form-data">`
2. Action receives `File` from `formData.get("file")`
3. Validate size (max 10MB)
4. Write to `public/uploads/{timestamp}-{filename}`
5. Create `Attachment` record in database
6. If image: Queue `generateThumbnail` job
7. Worker calls Python service to generate thumbnail
8. Worker updates `thumbnailPath` in database

```tsx
// Action
const file = formData.get("file") as File;
const buffer = Buffer.from(await file.arrayBuffer());
const uniqueName = `${Date.now()}-${file.name}`;
await writeFile(join(process.cwd(), "public", "uploads", uniqueName), buffer);

const attachment = await db.attachment.create({
  data: { todoId, userId, filename: file.name, filepath: `/uploads/${uniqueName}`, ... }
});

if (file.type.startsWith("image/")) {
  await queueThumbnailJob({ attachmentId: attachment.id, filepath: `/uploads/${uniqueName}` });
}
```

---

## User Assignment Flow

1. Owner opens "Assign User" dialog
2. Dialog shows searchable list of all users (excluding owner)
3. Owner clicks user → form submits with `intent=assignUser`
4. Action creates `TodoAssignment` record
5. Assigned user can now access the todo
6. Owner can unassign via X button

Access control in loader:
```typescript
const todo = await db.todo.findFirst({
  where: {
    id: todoId,
    OR: [
      { userId },                           // Owner
      { assignments: { some: { userId } } } // Assigned
    ],
  },
});
```

---

## Admin User Management

### Users List (`/admin/users`)

**Access:** Admin role required (`requireAdmin`)

**Loader:** All users with parsed roles

**Action:** Delete user (prevents self-deletion)

### New User (`/admin/users/new`)

**Action:**
1. Validate form with `createUserSchema`
2. Check email uniqueness
3. Hash password via BetterAuth
4. Create User + Account records

### Edit User (`/admin/users/:id/edit`)

**Action:**
1. Validate with `updateUserSchema`
2. Prevent admin removing own admin role
3. Update password only if provided
4. Serialize roles to JSON

---

## Table Components

Shared table components with pagination:

### ProjectsTable (`app/components/projects-table.tsx`)
- Columns: #, Name, Description, Created, Actions
- Client-side pagination (10 per page)
- Delete button with confirmation

### TodosTable (`app/components/todos-table.tsx`)
- Columns: Checkbox, Title, Description, Priority, Due Date, Actions
- Checkbox toggles completion (inline form)
- Priority cycles on click (low → medium → high → low)
- High priority rows highlighted

### UsersTable (`app/components/users-table.tsx`)
- Columns: #, Name, Email, Roles, Created, Actions
- Role badges
- Edit + Delete actions

---

## Breadcrumb System

Routes export `handle.breadcrumb`:

```typescript
// Static
export const handle: RouteHandle = {
  breadcrumb: { label: "Projects", href: "/projects" },
};

// Dynamic (uses loader data)
export const handle: RouteHandle = {
  breadcrumb: (data): BreadcrumbItem[] => {
    const { project, todo } = data as { project: Project; todo: Todo };
    return [
      { label: "Projects", href: "/" },
      { label: project.name, href: `/projects/${project.id}` },
      { label: todo.title },
    ];
  },
};
```

PageHeader collects breadcrumbs from matched routes:
```typescript
const matches = useMatches();
for (const match of matches) {
  const handle = match.handle as RouteHandle;
  if (handle?.breadcrumb) {
    const crumb = typeof handle.breadcrumb === "function"
      ? handle.breadcrumb(match.data)
      : handle.breadcrumb;
    breadcrumbs.push(...(Array.isArray(crumb) ? crumb : [crumb]));
  }
}
```

---

## Debug Page (`/debug/py`)

Test page for Python bridge:

- GET /hi → Health check
- POST /greet → Typed RPC call

Demonstrates calling Python from actions:
```typescript
import { helloHiGet, greetPersonGreetPost } from "~/lib/py/client";

export async function action({ request }) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "hi") {
    return { result: await helloHiGet() };
  }

  if (intent === "greet") {
    return {
      result: await greetPersonGreetPost({
        body: {
          first_name: formData.get("firstName"),
          last_name: formData.get("lastName"),
        },
      }),
    };
  }
}
```

---

## Deleting the Demo

To remove the demo and start fresh:

1. Delete models from `prisma/schema.prisma`:
   - `Project`, `Todo`, `Attachment`, `TodoAssignment`
   - Keep: `User`, `Session`, `Account`, `Verification`

2. Delete route files:
   ```bash
   rm app/routes/projects-list.tsx
   rm app/routes/project-detail.tsx
   rm app/routes/todo-detail.tsx
   rm app/routes/todo-edit.tsx
   rm app/routes/debug-py.tsx
   ```

3. Delete components:
   ```bash
   rm app/components/projects-table.tsx
   rm app/components/todos-table.tsx
   ```

4. Update `app/routes.ts` to remove deleted routes

5. Update `app/lib/schemas.ts` to remove demo schemas

6. Run `npm run db:migrate` to update database

7. Update sidebar in `app/components/app-sidebar.tsx`
