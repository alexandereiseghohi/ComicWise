import EditAuthorForm from "@/components/admin/edit-author-form";
import { Suspense } from "react";

export default function EditAuthorPage({ params }: { params: { id: string } }) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Author</h1>
        <p className="text-muted-foreground">Update the author information</p>
      </div>

      <Suspense fallback={<div className="text-muted-foreground">Loading author editor...</div>}>
        {/* Client component handles its own data fetching and UI */}
        {}
        <EditAuthorForm id={params.id} />
      </Suspense>
    </div>
  );
}
