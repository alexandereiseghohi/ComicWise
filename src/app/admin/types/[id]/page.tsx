import EditTypeForm from "@/components/admin/EditTypeForm";
import { Suspense } from "react";

export default function Page({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div className="text-muted-foreground">Loading editor...</div>}>
      {/* Render the client-side edit form inside a suspense boundary */}
      <EditTypeForm id={params.id} />
    </Suspense>
  );
}
