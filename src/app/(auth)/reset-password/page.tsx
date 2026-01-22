"use client";

import { TextFormField } from "@/components/shared/form-fields";
import { GenericForm } from "@/components/shared/generic-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { resetPassword } from "@/lib/actions/auth";
import { resetPasswordSchema } from "@/schemas/auth-schemas";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleResetPassword = async (data: unknown) => {
    if (!token) {
      return { success: false, error: "Invalid reset token" };
    }
    const resetData = { ...(data as any), token };
    const result = await resetPassword(resetData);
    if (result.success) {
      router.push("/sign-in?message=Password reset successfully. Please sign in.");
    }
    return result;
  };

  if (!token) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-destructive">Invalid or missing reset token</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl font-bold">Reset Password</CardTitle>
        <CardDescription>Enter your new password</CardDescription>
      </CardHeader>
      <CardContent>
        <GenericForm
          schema={resetPasswordSchema}
          onSubmit={handleResetPassword}
          submitText="Reset Password"
        >
          {() => (
            <div className="space-y-4">
              <TextFormField
                name="password"
                label="New Password"
                type="password"
                description="Min 8 characters with uppercase, lowercase, number, and special character"
              />
              <TextFormField name="confirmPassword" label="Confirm Password" type="password" />
            </div>
          )}
        </GenericForm>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="container mx-auto max-w-md py-12">
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
