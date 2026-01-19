import ClientImageUploader from "@/components/admin/ClientImageUploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { deleteAuthor, updateAuthor } from "@/dto/authorsDto";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import { redirect } from "next/navigation";

// `ClientImageUploader` moved to `components/admin/ClientImageUploader`

export default async function EditAuthorForm({ params }: { params: { id: string } }) {
  const id = Number(params.id);

  // Fetch author data on the server to populate defaults
  const res = await fetch(`${process.env["NEXT_PUBLIC_APP_URL"] ?? ""}/api/authors/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    // If author not found or API failed, redirect back to list
    redirect("/admin/authors");
  }

  const author = await res.json();

  async function handleUpdate(formData: FormData) {
    // Delegate to shared server action
    const result = await updateAuthor(id, formData);
    if (result.success) {
      revalidatePath("/admin/authors");
      revalidatePath(`/admin/authors/${id}`);
      redirect("/admin/authors");
    }
    throw new Error(result.error || "Failed to update author");
  }

  async function handleDelete() {
    const result = await deleteAuthor(id);
    if (result.success) {
      revalidatePath("/admin/authors");
      redirect("/admin/authors");
    }
    throw new Error(result.error || "Failed to delete author");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Author</h1>
        <p className="text-muted-foreground">Update the author information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Author Information</CardTitle>
          <CardDescription>Modify the details for this author</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleUpdate} className="space-y-6" method="post">
            <div className="space-y-2">
              <label htmlFor="name" className="sr-only">
                Name
              </label>
              <Input
                id="name"
                name="name"
                defaultValue={author.name ?? ""}
                placeholder="Author's full name"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="bio" className="sr-only">
                Biography
              </label>
              <Textarea
                id="bio"
                name="bio"
                defaultValue={author.bio ?? ""}
                placeholder="Brief biography of the author..."
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="image" className="sr-only">
                Profile Image
              </label>
              <Input
                id="image"
                name="image"
                type="url"
                defaultValue={author.profileImage ?? ""}
                placeholder="https://example.com/image.jpg"
              />
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">or</span>
                <ClientImageUploader targetInputId="image" />
              </div>
              {author.profileImage && (
                <div
                  className={`
                    relative mt-2 size-32 overflow-hidden rounded-lg border
                  `}
                >
                  <Image
                    src={author.profileImage}
                    alt="Profile preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Upload or provide URL for author's profile image
              </p>
            </div>

            <div className="flex justify-between">
              <form action={async () => handleDelete()} method="post">
                <Button type="submit" variant="destructive">
                  Delete Author
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
