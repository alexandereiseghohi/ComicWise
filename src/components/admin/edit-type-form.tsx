/**
 * EditTypeForm Component
 * Edit form for type entity
 */

"use client";

import { BaseForm } from "@/components/admin/base-form";
import { insertTypeSchema } from "@/lib/validations/type-schema";

export interface EditTypeFormProps {
  id: string | number;
}

export function EditTypeForm({ id }: EditTypeFormProps) {
  return (
    <BaseForm
      schema={insertTypeSchema}
      fields={[
        { name: "name", label: "Name", type: "text", placeholder: "Enter type name" },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          placeholder: "Enter type description",
        },
      ]}
      defaultValues={{ name: "", description: undefined }}
      onSubmit={async (data) => {
        // Add submission logic
        console.log("Submitting:", data);
      }}
    />
  );
}

export default EditTypeForm;
