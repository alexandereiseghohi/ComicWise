import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { auth } from "auth";
import { redirect } from "next/navigation";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Change Password - ComicWise",
  description: "Update your account password",
};

export default async function ChangePasswordPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/profile/change-password");
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold md:text-4xl">Change Password</h1>
        <p className="mt-2 text-muted-foreground">
          Update your password to keep your account secure
        </p>
      </div>

      <ChangePasswordForm />
    </div>
  );
}
