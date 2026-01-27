import { env } from "@/appConfig";
import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

async function getGenres() {
  const baseUrl = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/genres?limit=100`);

  if (!response.ok) {
    throw new Error("Failed to fetch genres");
  }

  const data = await response.json();
  return data.genres || [];
}

function GenresHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Genres</h1>
        <p className="text-muted-foreground">Manage comic genres and categories</p>
      </div>
      <Button asChild>
        <Link href="/admin/genres/new">
          <Plus className="mr-2 size-4" />
          Create Genre
        </Link>
      </Button>
    </div>
  );
}

async function GenresTable() {
  const genres = await getGenres();

  const columns = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "createdAt",
      header: "Created",
    },
  ];

  return <DataTable columns={columns} data={genres} />;
}

export default function GenresPage() {
  return (
    <div className="space-y-6">
      <GenresHeader />

      <Suspense fallback={<div>Loading genres...</div>}>
        <GenresTable />
      </Suspense>
    </div>
  );
}
