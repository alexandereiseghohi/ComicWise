import { deleteComicAction, updateComicAction } from "@/app/actions/admin/comics";
import { ComicForm } from "@/components/admin/ComicForm";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getComicById } from "@/database/queries/adminComics";
import { auth } from "auth";
import { Trash2 } from "lucide-react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import type { JSX } from "react";
import { Suspense } from "react";

interface ComicDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ComicDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const comic = await getComicById(Number.parseInt(id));

  if (!comic) {
    return { title: "Comic Not Found" };
  }

  return {
    title: `Edit ${comic.title} | Admin`,
    description: `Edit comic details for ${comic.title}`,
  };
}

async function ComicEditForm({ id }: { id: number }) {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    redirect("/");
  }

  const comic = await getComicById(id);

  if (!comic) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <ComicForm
        initialData={{
          title: comic.title,
          description: comic.description,
          slug: comic.slug,
          coverImage: comic.coverImage,
          status: comic.status as "Ongoing" | "Hiatus" | "Completed" | "Dropped" | "Coming Soon",
          publicationDate: comic.publicationDate,
          authorId: comic.authorId ? String(comic.authorId) : undefined,
          artistId: comic.artistId ? String(comic.artistId) : undefined,
          typeId: comic.typeId ? String(comic.typeId) : undefined,
        }}
        onSubmit={async (data) => {
          "use server";
          return updateComicAction(id, data);
        }}
        submitLabel="Update Comic"
      />

      {/* Delete Section */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteComicButton comicId={id} />
        </CardContent>
      </Card>
    </div>
  );
}

function DeleteComicButton({ comicId }: { comicId: number }) {
  // ts-ignore - useConfirmDialog hook
  const { confirm, ConfirmDialog } = useConfirmDialog();

  return (
    <>
      <ConfirmDialog />
      <Button
        variant="destructive"
        onClick={() =>
          confirm({
            title: "Delete Comic",
            description:
              "Are you sure you want to delete this comic? This will also delete all associated chapters and cannot be undone.",
            confirmText: "Delete",
            cancelText: "Cancel",
            variant: "destructive",
            onConfirm: async () => {
              const result = await deleteComicAction(comicId);
              if (result.success) {
                redirect("/admin/comics");
              }
            },
          })
        }
      >
        <Trash2 className="mr-2 size-4" />
        Delete Comic
      </Button>
    </>
  );
}

export default async function ComicDetailPage({
  params,
}: ComicDetailPageProps): Promise<JSX.Element> {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Comic</h1>
        <p className="text-muted-foreground">Update comic information</p>
      </div>

      <Suspense fallback={<div>Loading comic...</div>}>
        <ComicEditForm id={Number.parseInt(id)} />
      </Suspense>
    </div>
  );
}
