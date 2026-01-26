import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { deleteGenre, updateGenre } from "@/dto/genres-dto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function EditGenreForm({ params }: { params: { id: string } }) {
  const id = Number(params.id);

  const res = await fetch(`${process.env["NEXT_PUBLIC_APP_URL"] ?? ""}/api/genres/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    redirect("/admin/genres");
  }

  const genre = await res.json();

  async function handleUpdate(formData: FormData) {
    const result = await updateGenre(id, {
      name: formData.get("name") as string,
      description: formData.get("description") as string | undefined,
    });
    if (result.success) {
      revalidatePath("/admin/genres");
      redirect("/admin/genres");
    }
    throw new Error(result.error ?? "Failed to update genre");
  }

  async function handleDelete() {
    const result = await deleteGenre(id);
    if (result.success) {
      revalidatePath("/admin/genres");
      redirect("/admin/genres");
    }
    throw new Error(result.error ?? "Failed to delete genre");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Genre</h1>
        <p className="text-muted-foreground">Update the genre information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Genre Information</CardTitle>
          <CardDescription>Modify the details for this genre</CardDescription>
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
                defaultValue={genre.name ?? ""}
                placeholder="e.g., Action, Romance, Fantasy"
              />
            </div>

            <div>
              <label htmlFor="description" className="sr-only">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                defaultValue={genre.description ?? ""}
                placeholder="Brief description of this genre..."
                rows={4}
              />
            </div>

            <div className="flex justify-between">
              <form action={async () => handleDelete()} method="post">
                <Button type="submit" variant="destructive">
                  Delete Genre
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
