import { ComicsListContent } from "@/components/admin/ComicsListContent";
import { getComicsWithPagination, searchComics } from "@/database/queries/adminComics";
import { Suspense } from "react";

interface ComicsPageProps {
  searchParams: Promise<{ q?: string; cursor?: string }>;
}

async function ComicsListPageContent({ q, cursor }: { q?: string; cursor?: string }) {
  let data;

  if (q) {
    const searchResults = await searchComics(q);
    data = {
      data: searchResults,
      hasNextPage: false,
      nextCursor: null,
    };
  } else {
    data = await getComicsWithPagination();
  }

  return (
    <ComicsListContent
      initialComics={data.data as any}
      hasNextPage={data.hasNextPage}
      nextCursor={data.nextCursor}
    />
  );
}

export default async function ComicsPage({ searchParams }: ComicsPageProps) {
  const params = await searchParams;
  return (
    <Suspense fallback={<div>Loading comics...</div>}>
      <ComicsListPageContent q={params.q} cursor={params.cursor} />
    </Suspense>
  );
}
