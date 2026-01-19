import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { deleteUser, updateUser } from "@/dto/usersDto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function EditUserForm({ params }: { params: { id: string } }) {
  const id = String(params.id);

  const res = await fetch(`${process.env["NEXT_PUBLIC_APP_URL"] ?? ""}/api/users/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    redirect("/admin/users");
  }

  const result = await res.json();
  if (!result?.success) {
    redirect("/admin/users");
  }

  const user = result.data;

  async function handleUpdate(formData: FormData) {
    // convert emailVerified boolean to date server-side is handled in updateUser action
    const result = await updateUser(id, {
      name: formData.get("name") as string | undefined,
      email: formData.get("email") as string | undefined,
      role: formData.get("role") as "user" | "admin" | "moderator" | undefined,
      image: formData.get("image") as string | undefined,
      emailVerified: formData.get("emailVerified") === "true" ? new Date() : undefined,
    });
    if (result.success) {
      revalidatePath("/admin/users");
      revalidatePath(`/admin/users/${id}`);
      redirect("/admin/users");
    }
    throw new Error(result.error || "Failed to update user");
  }

  async function handleDelete() {
    const result = await deleteUser(id);
    if (result.success) {
      revalidatePath("/admin/users");
      redirect("/admin/users");
    }
    throw new Error(result.error || "Failed to delete user");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
        <p className="text-muted-foreground">Update the user profile and role</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Modify the details for this user</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleUpdate} className="space-y-6" method="post">
            <div>
              <label htmlFor="name" className="sr-only">
                Name
              </label>
              <Input id="name" name="name" defaultValue={user.name ?? ""} placeholder="John Doe" />
            </div>

            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user.email ?? ""}
                placeholder="johnexample.com"
              />
            </div>

            <div>
              <label htmlFor="role" className="sr-only">
                Role
              </label>
              <select
                id="role"
                name="role"
                defaultValue={user.role ?? "user"}
                className="w-full rounded-sm border px-3 py-2"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>

            <div>
              <label htmlFor="image" className="sr-only">
                Avatar Image URL
              </label>
              <Input
                id="image"
                name="image"
                type="url"
                defaultValue={user.image ?? ""}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div className="flex justify-between">
              <form action={async () => handleDelete()} method="post">
                <Button type="submit" variant="destructive">
                  Delete User
                </Button>
              </form>
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
