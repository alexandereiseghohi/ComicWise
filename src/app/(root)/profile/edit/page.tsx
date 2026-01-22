import { EditProfileForm } from "@/components/profile/edit-profile-form";
import { auth } from "auth";
import { redirect } from "next/navigation";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Profile - ComicWise",
  description: "Update your profile information",
};

export default async function EditProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/profile/edit");
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold md:text-4xl">Edit Profile</h1>
        <p className="mt-2 text-muted-foreground">
          Update your personal information and preferences
        </p>
      </div>

      <EditProfileForm
        user={{
          id: session.user.id,
          name: session.user.name || "",
          email: session.user.email || "",
          image: session.user.image || null,
        }}
      />
    </div>
  );
}
