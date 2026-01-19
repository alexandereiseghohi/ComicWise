import { ComicGridSkeleton } from "@/components/ui/skeletons";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-5 w-64 animate-pulse rounded-md bg-muted" />
      </div>
      <ComicGridSkeleton count={18} />
    </div>
  );
}
