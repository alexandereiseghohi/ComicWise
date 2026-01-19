/**
 * EditArtistForm Component
 * Edit form for artist entity
 */

"use client";

import { BaseForm } from "@/components/admin/BaseForm";
import { insertArtistSchema } from "@/lib/validations/artistSchema";

export interface EditArtistFormProps {
  id: string | number;
}

export function EditArtistForm({ id }: EditArtistFormProps) {
  return (
    <BaseForm
      schema={insertArtistSchema}
      fields={[
        { name: "name", label: "Name", type: "text", placeholder: "Enter artist name" },
        { name: "bio", label: "Bio", type: "textarea", placeholder: "Enter artist bio" },
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

export default EditArtistForm;
