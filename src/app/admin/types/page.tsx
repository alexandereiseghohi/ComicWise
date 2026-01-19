import { env } from "@/appConfig";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

async function getTypes() {
  const baseUrl = env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/types?limit=100`);

  if (!response.ok) {
    throw new Error("Failed to fetch types");
  }

  const data = await response.json();
  return data.types || [];
}

function TypesHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Types</h1>
        <p className="text-muted-foreground">Manage comic types (Manga, Manhwa, Manhua, etc.)</p>
      </div>
      <Button asChild>
        <Link href="/admin/types/new">
          <Plus className="mr-2 size-4" />
          Create Type
        </Link>
      </Button>
    </div>
  );
}

async function TypesTable() {
  const types = await getTypes();

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

  return <DataTable columns={columns} data={types} />;
}

export default function TypesPage() {
  return (
    <div className="space-y-6">
      <TypesHeader />

      <Suspense fallback={<div>Loading types...</div>}>
        {/* Async server component that fetches data inside Suspense */}
        {}
        <TypesTable />
      </Suspense>
    </div>
  );
}
