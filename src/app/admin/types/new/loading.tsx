import { Skeleton } from "@/components/ui/skeleton";

export default function NewTypeLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-[400px] w-full" />
      </div>
    </div>
  );
}
