import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createComic } from "@/dto/comicsDto";
import type { CreateComicInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function handleCreate(formData: FormData) {
  // Build payload from FormData and coerce types to match CreateComicInput
  const payload: CreateComicInput = {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    coverImage: String(formData.get("coverImage") ?? "").trim(),
    status: String(formData.get("status") ?? "Ongoing") as CreateComicInput["status"],
    publicationDate: formData.get("publicationDate")
      ? new Date(String(formData.get("publicationDate")))
      : new Date(),
    rating: formData.get("rating") ? Number(formData.get("rating")) : undefined,
    views: 0,
    authorId: formData.get("authorId") ? Number(formData.get("authorId")) : undefined,
    artistId: formData.get("artistId") ? Number(formData.get("artistId")) : undefined,
    typeId: formData.get("typeId") ? Number(formData.get("typeId")) : undefined,
  };

  const result = await createComic(payload);

  if (result.success) {
    // Revalidate admin comics list and home
    revalidatePath("/admin/comics");
    revalidatePath("/");
    redirect("/admin/comics");
  }

  // On failure throw so framework surfaces error (could be improved)
  throw new Error(result.error || "Failed to create comic");
}

export default function ComicForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comic Information</CardTitle>
        <CardDescription>Fill in the details to create a new comic</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleCreate} className="space-y-6" method="post">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" name="title" placeholder="Enter comic title" required />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter comic description"
              rows={4}
              required
            />
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image URL *</Label>
            <Input
              id="coverImage"
              name="coverImage"
              type="url"
              placeholder="https://example.com/cover.jpg"
              required
            />
            <p className="text-sm text-muted-foreground">Provide a URL to the cover image</p>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select defaultValue="Ongoing" name="status">
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ongoing">Ongoing</SelectItem>
                <SelectItem value="Hiatus">Hiatus</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Dropped">Dropped</SelectItem>
                <SelectItem value="Coming Soon">Coming Soon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Publication Date */}
          <div className="space-y-2">
            <Label htmlFor="publicationDate">Publication Date *</Label>
            <Input
              id="publicationDate"
              name="publicationDate"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label htmlFor="rating">Rating (0-10)</Label>
            <Input
              id="rating"
              name="rating"
              type="number"
              min="0"
              max="10"
              step="0.1"
              defaultValue="0"
              placeholder="0"
            />
          </div>

          <div
            className={`
              grid gap-6
              md:grid-cols-3
            `}
          >
            {/* Author ID */}
            <div className="space-y-2">
              <Label htmlFor="authorId">Author ID</Label>
              <Input id="authorId" name="authorId" type="number" placeholder="Enter author ID" />
            </div>

            {/* Artist ID */}
            <div className="space-y-2">
              <Label htmlFor="artistId">Artist ID</Label>
              <Input id="artistId" name="artistId" type="number" placeholder="Enter artist ID" />
            </div>

            {/* Type ID */}
            <div className="space-y-2">
              <Label htmlFor="typeId">Type ID</Label>
              <Input id="typeId" name="typeId" type="number" placeholder="Enter type ID" />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button type="submit">Create Comic</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                /* client-only navigation handled by surrounding page */
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
