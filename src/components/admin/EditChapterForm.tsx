/**
 * EditChapterForm Component
 * Edit form for chapter entity
 */

"use client";

import { BaseForm } from "@/components/admin/BaseForm";
import { insertChapterSchema } from "@/lib/validations/chapterSchema";

export interface EditChapterFormProps {
  id: string | number;
}

export function EditChapterForm({ id }: EditChapterFormProps) {
  return (
    <BaseForm
      schema={insertChapterSchema}
      fields={[
        { name: "title", label: "Title", type: "text", placeholder: "Enter chapter title" },
        {
          name: "chapterNumber",
          label: "Chapter Number",
          type: "number",
          placeholder: "Enter chapter number",
        },
        { name: "releaseDate", label: "Release Date", type: "date" },
        { name: "comicId", label: "Comic ID", type: "number", placeholder: "Enter comic ID" },
      ]}
      defaultValues={{
        title: "",
        chapterNumber: 1,
        releaseDate: new Date(),
        comicId: 0,
        views: 0,
      }}
      onSubmit={async (data) => {
        // Add submission logic
        console.log("Submitting:", data);
      }}
    />
  );
}

export default EditChapterForm;
