import EditChapterForm from "@/components/admin/edit-chapter-form";
import { Suspense } from "react";

export default function EditChapterPage({ params }: { params: { id: string } }) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Chapter</h1>
        <p className="text-muted-foreground">Update the chapter information</p>
      </div>

      <Suspense fallback={<div className="text-muted-foreground">Loading chapter editor...</div>}>
        <EditChapterForm id={params.id} />
      </Suspense>
    </div>
  );
}
