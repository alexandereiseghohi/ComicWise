"use client";

// ═══════════════════════════════════════════════════
// RESET PASSWORD PAGE (Next.js 16 + React 19)
// ═══════════════════════════════════════════════════

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { AuthForm, PasswordField } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { resetPassword } from "@/lib/actions/auth";
import type { ResetPasswordInput } from "@/lib/validations";
import { resetPasswordSchema } from "@/lib/validations";

function ResetPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const searchParameters = useSearchParams();

  useEffect(() => {
    const tokenParameter = searchParameters.get("token");
    if (!tokenParameter) {
      toast.error("Invalid reset link");
      router.push("/forgot-password");
      return;
    }
    startTransition(() => {
      setToken(tokenParameter);
    });
  }, [searchParameters, router]);

  const onSubmit = async (data: Omit<ResetPasswordInput, "token">) => {
    if (!token) {
      setError("Invalid reset token");
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        const result = await resetPassword({
          ...data,
          token,
        });

        if (!result.success) {
          setError(result.error || "Failed to reset password");
          toast.error(result.error || "Failed to reset password");
        } else {
          setIsSuccess(true);
          toast.success("Password reset successfully!");
        }
      } catch (error_) {
        console.error("Reset password error:", error_);
        setError("An unexpected error occurred. Please try again.");
        toast.error("Failed to reset password");
      }
    });
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div
            className={`
              mx-auto mb-2 flex size-12 items-center justify-center rounded-full
              bg-green-100
            `}
          >
            <CheckCircle2 className="size-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Password Reset Successful</CardTitle>
          <CardDescription>
            Your password has been reset. You can now sign in with your new password.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/sign-in" className="w-full">
            <Button className="w-full">Go to Sign In</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <AuthForm
      title="Reset Password"
      description="Enter your new password below"
      schema={resetPasswordSchema.omit({ token: true })}
      defaultValues={{ password: "", confirmPassword: "" }}
      onSubmit={onSubmit}
      error={error}
      isLoading={isPending || !token}
      submitLabel="Reset Password"
    >
      <PasswordField
        name="password"
        label="New Password"
        autoComplete="new-password"
        disabled={isPending || !token}
        helperText="Must be at least 8 characters with uppercase, lowercase, and number"
      />
      <PasswordField
        name="confirmPassword"
        label="Confirm Password"
        autoComplete="new-password"
        disabled={isPending || !token}
      />
    </AuthForm>
  );
}

/**
 *
 */
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Validating reset token...</CardDescription>
          </CardHeader>
        </Card>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
