import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { deleteChapter, updateChapter } from "@/dto/chapters-dto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function EditChapterForm({ params }: { params: { id: string } }) {
  const id = Number(params.id);

  // Fetch chapter and comics on the server
  const [chapterRes, comicsRes] = await Promise.all([
    fetch(`${process.env["NEXT_PUBLIC_APP_URL"] ?? ""}/api/chapters/${id}`, { cache: "no-store" }),
    fetch(`${process.env["NEXT_PUBLIC_APP_URL"] ?? ""}/api/comics?limit=1000`, {
      cache: "no-store",
    }),
  ]);

  if (!chapterRes.ok || !comicsRes.ok) {
    redirect("/admin/chapters");
  }

  const chapter = await chapterRes.json();
  const comicsData = await comicsRes.json();
  const comics = comicsData.comics || [];

  async function handleUpdate(formData: FormData) {
    const payload = {
      comicId: Number(formData.get("comicId")),
      chapterNumber: Number(formData.get("chapterNumber")),
      title: String(formData.get("title") ?? "").trim(),
      content: formData.get("content") ? String(formData.get("content")) : undefined,
      releaseDate: formData.get("releaseDate")
        ? new Date(String(formData.get("releaseDate")))
        : undefined,
    };

    const result = await updateChapter(id, payload);
    if (result.success) {
      revalidatePath("/admin/chapters");
      revalidatePath(`/comics/${payload.comicId}`);
      redirect("/admin/chapters");
    }

    throw new Error(result.error || "Failed to update chapter");
  }

  async function handleDelete() {
    const result = await deleteChapter(id);
    if (result.success) {
      revalidatePath("/admin/chapters");
      redirect("/admin/chapters");
    }
    throw new Error(result.error || "Failed to delete chapter");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Chapter Information</CardTitle>
          <CardDescription>Modify the details for this chapter</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleUpdate} className="space-y-6" method="post">
            <div>
              <label htmlFor="comicId" className="sr-only">
                Comic
              </label>
              <select
                id="comicId"
                name="comicId"
                defaultValue={String(chapter.comicId)}
                className="w-full rounded-sm border px-3 py-2"
              >
                <option value="">Select a comic</option>
                {comics.map((c: { id: number; title: string }) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div
              className={`
                grid gap-6
                md:grid-cols-2
              `}
            >
              <div>
                <label htmlFor="chapterNumber" className="sr-only">
                  Chapter Number
                </label>
                <Input
                  id="chapterNumber"
                  name="chapterNumber"
                  type="number"
                  defaultValue={String(chapter.chapterNumber)}
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label htmlFor="releaseDate" className="sr-only">
                  Release Date
                </label>
                <Input
                  id="releaseDate"
                  name="releaseDate"
                  type="date"
                  defaultValue={
                    chapter.releaseDate
                      ? new Date(chapter.releaseDate).toISOString().split("T")[0]
                      : ""
                  }
                />
              </div>
            </div>

            <div>
              <label htmlFor="title" className="sr-only">
                Title
              </label>
              <Input
                id="title"
                name="title"
                defaultValue={chapter.title ?? ""}
                placeholder="Chapter title"
              />
            </div>

            <div>
              <label htmlFor="content" className="sr-only">
                Content
              </label>
              <Textarea
                id="content"
                name="content"
                defaultValue={chapter.content ?? ""}
                placeholder="Chapter summary or description..."
                rows={4}
              />
            </div>

            <div className="flex justify-between">
              <form action={async () => handleDelete()} method="post">
                <Button type="submit" variant="destructive">
                  Delete Chapter
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
