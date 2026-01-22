/**
 * EditUserForm Component
 * Edit form for user entity
 */

"use client";

import { BaseForm } from "@/components/admin/base-form";
import { insertUserSchema } from "@/lib/validations/user-schema";

export interface EditUserFormProps {
  id: string | number;
}

export function EditUserForm({ id }: EditUserFormProps) {
  return (
    <BaseForm
      schema={insertUserSchema}
      fields={[
        { name: "name", label: "Name", type: "text", placeholder: "Enter user name" },
        { name: "email", label: "Email", type: "email", placeholder: "Enter email address" },
        { name: "password", label: "Password", type: "password", placeholder: "Enter password" },
        {
          name: "role",
          label: "Role",
          type: "select",
          options: [
            { label: "User", value: "user" },
            { label: "Admin", value: "admin" },
            { label: "Moderator", value: "moderator" },
          ],
        },
        { name: "image", label: "Image URL", type: "text", placeholder: "Enter image URL" },
      ]}
      defaultValues={{ name: null, email: "", role: "user", image: null }}
      onSubmit={async (data) => {
        // Add submission logic
        console.log("Submitting:", data);
      }}
    />
  );
}

export default EditUserForm;
