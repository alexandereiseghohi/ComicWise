import { createComicAction } from "@/app/actions/admin/comics";
import { ComicForm } from "@/components/admin/comic-form";
import { auth } from "auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Comic | Admin",
  description: "Add a new comic to the platform",
};

async function ProtectedComicForm() {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    redirect("/");
  }

  return <ComicForm onSubmit={createComicAction} submitLabel="Create Comic" />;
}

export default function NewComicPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Comic</h1>
        <p className="text-muted-foreground">Add a new comic to the platform</p>
      </div>

      <Suspense fallback={<div>Checking permissions...</div>}>
        <ProtectedComicForm />
      </Suspense>
    </div>
  );
}
