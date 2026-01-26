import { env } from "@/appConfig";
import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

async function getAuthors() {
  const baseUrl = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/authors?limit=100`);

  if (!response.ok) {
    throw new Error("Failed to fetch authors");
  }

  const data = await response.json();
  return data.authors || [];
}

function AuthorsHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Authors</h1>
        <p className="text-muted-foreground">Manage comic authors and writers</p>
      </div>
      <Button asChild>
        <Link href="/admin/authors/new">
          <Plus className="mr-2 size-4" />
          Create Author
        </Link>
      </Button>
    </div>
  );
}

async function AuthorsTable() {
  const authors = await getAuthors();

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
      accessorKey: "bio",
      header: "Bio",
    },
    {
      accessorKey: "createdAt",
      header: "Created",
    },
  ];

  return <DataTable columns={columns} data={authors} />;
}

export default function AuthorsPage() {
  return (
    <div className="space-y-6">
      <AuthorsHeader />

      <Suspense fallback={<div>Loading authors...</div>}>
        <AuthorsTable />
      </Suspense>
    </div>
  );
}
