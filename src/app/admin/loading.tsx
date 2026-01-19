import { AdminTableSkeleton } from "@/components/ui/skeletons";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="h-10 w-64 animate-pulse rounded-md bg-muted" />
      </div>
      <AdminTableSkeleton rows={15} />
    </div>
  );
}
