/**
 * EditAuthorForm Component
 * Edit form for author entity
 */

"use client";

import { BaseForm } from "@/components/admin/base-form";
import { insertAuthorSchema } from "@/lib/validations/author-schema";

export interface EditAuthorFormProps {
  id: string | number;
}

export function EditAuthorForm({ id }: EditAuthorFormProps) {
  return (
    <BaseForm
      schema={insertAuthorSchema}
      fields={[
        { name: "name", label: "Name", type: "text", placeholder: "Enter author name" },
        { name: "bio", label: "Bio", type: "textarea", placeholder: "Enter author bio" },
        { name: "image", label: "Image URL", type: "text", placeholder: "Enter image URL" },
      ]}
      defaultValues={{ name: "", bio: undefined, image: undefined }}
      onSubmit={async (data) => {
        // Add submission logic
        console.log("Submitting:", data);
      }}
    />
  );
}

export default EditAuthorForm;
