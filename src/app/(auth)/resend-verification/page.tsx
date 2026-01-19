"use client";

// ═══════════════════════════════════════════════════
// RESEND VERIFICATION PAGE (Next.js 16 + React 19)
// ═══════════════════════════════════════════════════

import { Mail } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { AuthForm, EmailField } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { resendVerificationEmail } from "@/lib/actions/auth";
import type { ResendVerificationEmailInput } from "@/lib/validations";
import { resendVerificationEmailSchema } from "@/lib/validations";

export default function ResendVerificationPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const onSubmit = async (data: ResendVerificationEmailInput) => {
    setError(null);

    startTransition(async () => {
      try {
        const result = await resendVerificationEmail(data);

        if (!result.success) {
          setError(result.error || "Failed to send verification email");
          toast.error(result.error || "Failed to send verification email");
        } else {
          setIsSubmitted(true);
          toast.success("Verification email sent!");
        }
      } catch (error_) {
        console.error("Resend verification error:", error_);
        setError("An unexpected error occurred. Please try again.");
        toast.error("Failed to send verification email");
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
              bg-primary/10
            `}
          >
            <Mail className="size-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Email Sent!</CardTitle>
          <CardDescription>
            We&apos;ve sent you a new verification link. Please check your email and click the link
            to verify your account.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex-col space-y-2">
          <Link href="/sign-in" className="w-full">
            <Button className="w-full">Back to Sign In</Button>
          </Link>
          <p className="text-center text-sm text-muted-foreground">
            Still didn&apos;t receive it?{" "}
            <button
              onClick={() => setIsSubmitted(false)}
              className={`
                text-primary
                hover:underline
              `}
            >
              Try again
            </button>
          </p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <AuthForm
      title="Resend Verification Email"
      description="Enter your email address and we'll send you a new verification link"
      schema={resendVerificationEmailSchema}
      defaultValues={{ email: "" }}
      onSubmit={onSubmit}
      error={error}
      isLoading={isPending}
      submitLabel="Send Verification Email"
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Already verified?{" "}
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
