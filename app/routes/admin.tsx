import { useLoaderData, useFetcher } from "react-router";
import { getCurrentUser, getAllUsers, updateUserRole, deleteUser } from "../lib/session";
import type { Route } from "./+types/admin";
import { Button } from "../components/ui/button";
import { Trash2, Shield, User } from "lucide-react";

export async function loader({ request }: Route.LoaderArgs) {
  const currentUser = await getCurrentUser(request);

  if (!currentUser || currentUser.role !== "admin") {
    return { error: "Unauthorized", users: null, currentUser: null };
  }

  const users = await getAllUsers();
  return { error: null, users, currentUser };
}

export async function action({ request }: Route.ActionArgs) {
  const currentUser = await getCurrentUser(request);

  if (!currentUser || currentUser.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const formData = await request.formData();
  const action = formData.get("action");
  const userId = formData.get("userId") as string;

  if (action === "makeAdmin") {
    await updateUserRole(userId, "admin");
    return { success: true };
  } else if (action === "makeUser") {
    await updateUserRole(userId, "user");
    return { success: true };
  } else if (action === "delete") {
    await deleteUser(userId);
    return { success: true };
  }

  return { error: "Invalid action" };
}

export default function Admin() {
  const { error, users, currentUser } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">
            {error === "Unauthorized"
              ? "You must be an admin to access this page"
              : error}
          </p>
          <a href="/" className="text-primary hover:underline mt-4 inline-block">
            Go back home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users and their roles</p>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-2">Name</th>
              <th className="text-left px-4 py-2">Email</th>
              <th className="text-left px-4 py-2">Role</th>
              <th className="text-left px-4 py-2">Created</th>
              <th className="text-left px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users &&
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-t hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">{user.name}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {user.email}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {user.role === "admin" ? (
                        <>
                          <Shield className="w-4 h-4 text-amber-500" />
                          <span className="text-sm font-medium">Admin</span>
                        </>
                      ) : (
                        <>
                          <User className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">User</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {user.id !== currentUser?.id && (
                        <>
                          {user.role === "user" ? (
                            <fetcher.Form method="post" className="inline">
                              <input type="hidden" name="userId" value={user.id} />
                              <input
                                type="hidden"
                                name="action"
                                value="makeAdmin"
                              />
                              <Button
                                type="submit"
                                size="sm"
                                variant="outline"
                                disabled={fetcher.state !== "idle"}
                              >
                                Make Admin
                              </Button>
                            </fetcher.Form>
                          ) : (
                            <fetcher.Form method="post" className="inline">
                              <input type="hidden" name="userId" value={user.id} />
                              <input
                                type="hidden"
                                name="action"
                                value="makeUser"
                              />
                              <Button
                                type="submit"
                                size="sm"
                                variant="outline"
                                disabled={fetcher.state !== "idle"}
                              >
                                Demote
                              </Button>
                            </fetcher.Form>
                          )}

                          <fetcher.Form method="post" className="inline">
                            <input type="hidden" name="userId" value={user.id} />
                            <input type="hidden" name="action" value="delete" />
                            <Button
                              type="submit"
                              size="sm"
                              variant="destructive"
                              disabled={fetcher.state !== "idle"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </fetcher.Form>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
