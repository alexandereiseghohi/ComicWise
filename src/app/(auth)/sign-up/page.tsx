"use client";

// ═══════════════════════════════════════════════════
// SIGN UP PAGE (Next.js 16 + React 19)
// ═══════════════════════════════════════════════════

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { AuthForm, EmailField, NameField, PasswordField } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { registerUser } from "@/lib/actions/auth";
import type { SignUpInput } from "@/lib/validations";
import { signUpSchema } from "@/lib/validations";

const SignUp = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (data: SignUpInput) => {
    setError(null);

    startTransition(async () => {
      try {
        const result = await registerUser(data);

        if (result?.success) {
          toast.success("Account created! Please check your email to verify your account.");
          router.push("/verify-request");
        } else {
          setError(result.error || "Failed to create account");
          toast.error(result.error || "Failed to create account");
        }
      } catch (error_) {
        console.error("Sign up error:", error_);
        setError("An unexpected error occurred. Please try again.");
        toast.error("Failed to create account");
      }
    });
  };

  const handleGoogleSignIn = () => {
    startTransition(async () => {
      try {
        await signIn("google", { callbackUrl: "/" });
      } catch {
        toast.error("Failed to sign in with Google");
      }
    });
  };

  return (
    <AuthForm
      title="Sign Up to ComicWise"
      description="Create your account to get started"
      schema={signUpSchema}
      defaultValues={{ name: "", email: "", password: "", confirmPassword: "" }}
      onSubmit={onSubmit}
      error={error}
      isLoading={isPending}
      submitLabel="Sign Up"
      footer={
        <>
          <p className="text-center text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className={`
                text-card-foreground
                hover:underline
              `}
            >
              Sign in instead
            </Link>
          </p>
          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <p>or</p>
            <Separator className="flex-1" />
          </div>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isPending}
          >
            Sign in with Google
          </Button>
        </>
      }
    >
      <NameField disabled={isPending} />
      <EmailField disabled={isPending} />
      <PasswordField
        name="password"
        label="Password"
        autoComplete="new-password"
        disabled={isPending}
        helperText="Must contain uppercase, lowercase, and number"
      />
      <PasswordField
        name="confirmPassword"
        label="Confirm Password"
        autoComplete="new-password"
        disabled={isPending}
      />
    </AuthForm>
  );
};

export default SignUp;
