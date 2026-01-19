"use client";

// ═══════════════════════════════════════════════════
// FORGOT PASSWORD PAGE (Next.js 16 + React 19)
// ═══════════════════════════════════════════════════

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { AuthForm, EmailField } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { forgotPassword } from "@/lib/actions/auth";
import type { ForgotPasswordInput } from "@/lib/validations";
import { forgotPasswordSchema } from "@/lib/validations";

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const onSubmit = async (data: ForgotPasswordInput) => {
    setError(null);

    startTransition(async () => {
      try {
        const result = await forgotPassword(data);

        if (!result.success) {
          setError(result.error || "Failed to send reset link");
          toast.error(result.error || "Failed to send reset link");
        } else {
          setIsSubmitted(true);
          toast.success("Password reset link sent!");
        }
      } catch (error_) {
        console.error("Forgot password error:", error_);
        setError("An unexpected error occurred. Please try again.");
        toast.error("Failed to send reset link");
      }
    });
  };

  if (isSubmitted) {
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
          <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
          <CardDescription>
            We&apos;ve sent you a password reset link. Please check your email and follow the
            instructions.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex-col space-y-2">
          <Link href="/sign-in" className="w-full">
            <Button className="w-full">Back to Sign In</Button>
          </Link>
          <Button variant="ghost" className="w-full" onClick={() => setIsSubmitted(false)}>
            Send another link
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <AuthForm
      title="Forgot Password"
      description="Enter your email address and we'll send you a link to reset your password"
      schema={forgotPasswordSchema}
      defaultValues={{ email: "" }}
      onSubmit={onSubmit}
      error={error}
      isLoading={isPending}
      submitLabel="Send Reset Link"
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link
            href="/sign-in"
            className={`
              text-primary
              hover:underline
            `}
          >
            Sign in
          </Link>
        </p>
      }
    >
      <EmailField disabled={isPending} />
    </AuthForm>
  );
}
