import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { db } from "@/database/db";
import { chapter, comic } from "@/database/schema";
import { eq } from "drizzle-orm";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

async function ChaptersTable() {
  const chapters = await db
    .select({
      id: chapter.id,
      chapterNumber: chapter.chapterNumber,
      title: chapter.title,
      comicTitle: comic.title,
      releaseDate: chapter.releaseDate,
      views: chapter.views,
      createdAt: chapter.createdAt,
    })
    .from(chapter)
    .leftJoin(comic, eq(chapter.comicId, comic.id))
    .orderBy(chapter.createdAt);

  const columns = [
    {
      accessorKey: "id" as const,
      header: "ID",
    },
    {
      accessorKey: "comicTitle" as const,
      header: "Comic",
    },
    {
      accessorKey: "chapterNumber" as const,
      header: "Chapter ",
    },
    {
      accessorKey: "title" as const,
      header: "Title",
    },
    {
      accessorKey: "views" as const,
      header: "Views",
    },
    {
      accessorKey: "releaseDate" as const,
      header: "Release Date",
    },
  ] as const;

  return <DataTable columns={[...columns]} data={chapters} />;
}

function ChaptersHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chapters</h1>
        <p className="text-muted-foreground">Manage comic chapters and episodes</p>
      </div>
      <Button asChild>
        <Link href="/admin/chapters/new">
          <Plus className="mr-2 size-4" />
          Create Chapter
        </Link>
      </Button>
    </div>
  );
}

/**
 *
 */
export default function ChaptersPage() {
  return (
    <div className="space-y-6">
      <ChaptersHeader />

      <Suspense fallback={<div>Loading chapters...</div>}>
        <ChaptersTable />
      </Suspense>
    </div>
  );
}
