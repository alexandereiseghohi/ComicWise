import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { deleteType, updateType } from "@/dto/typesDto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function EditTypeForm({ params }: { params: { id: string } }) {
  const id = Number(params.id);

  const res = await fetch(`${process.env["NEXT_PUBLIC_APP_URL"] ?? ""}/api/types/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    redirect("/admin/types");
  }

  const type = await res.json();

  async function handleUpdate(formData: FormData) {
    const result = await updateType(id, {
      name: formData.get("name") as string,
      description: formData.get("description") as string | undefined,
    });
    if (result.success) {
      revalidatePath("/admin/types");
      redirect("/admin/types");
    }
    throw new Error(result.error || "Failed to update type");
  }

  async function handleDelete() {
    const result = await deleteType(id);
    if (result.success) {
      revalidatePath("/admin/types");
      redirect("/admin/types");
    }
    throw new Error(result.error || "Failed to delete type");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Type</h1>
        <p className="text-muted-foreground">Update the type information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Type Information</CardTitle>
          <CardDescription>Modify the details for this comic type</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleUpdate} className="space-y-6" method="post">
            <div>
              <label htmlFor="name" className="sr-only">
                Name
              </label>
              <Input
                id="name"
                name="name"
                defaultValue={type.name ?? ""}
                placeholder="e.g., Manga, Manhwa, Manhua"
              />
            </div>

            <div>
              <label htmlFor="description" className="sr-only">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                defaultValue={type.description ?? ""}
                placeholder="Brief description of this comic type..."
                rows={4}
              />
            </div>

            <div className="flex justify-between">
              <form action={async () => handleDelete()} method="post">
                <Button type="submit" variant="destructive">
                  Delete Type
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
