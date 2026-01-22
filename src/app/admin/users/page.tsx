import { DataTable } from "@/components/admin/data-table";
import { db } from "@/database/db";
import { Suspense } from "react";
import { user } from "schema";

async function UsersTable() {
  const users = await db.select().from(user);

  const columns = [
    {
      accessorKey: "id" as const,
      header: "ID",
    },
    {
      accessorKey: "name" as const,
      header: "Name",
    },
    {
      accessorKey: "email" as const,
      header: "Email",
    },
    {
      accessorKey: "role" as const,
      header: "Role",
    },
    {
      accessorKey: "createdAt" as const,
      header: "Created At",
    },
  ];

  return <DataTable columns={columns} data={users} />;
}

function UsersHeader() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
      <p className="text-muted-foreground">Manage all users in the platform</p>
    </div>
  );
}

/**
 *
 */
export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <UsersHeader />

      <Suspense fallback={<div>Loading users...</div>}>
        <UsersTable />
      </Suspense>
    </div>
  );
}
