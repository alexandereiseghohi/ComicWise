import EditGenreForm from "@/components/admin/edit-genre-form";
import { Suspense } from "react";

export default function EditGenrePage({ params }: { params: { id: string } }) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Genre</h1>
        <p className="text-muted-foreground">Update the genre information</p>
      </div>

      <Suspense fallback={<div className="text-muted-foreground">Loading genre editor...</div>}>
        <EditGenreForm id={params.id} />
      </Suspense>
    </div>
  );
}
