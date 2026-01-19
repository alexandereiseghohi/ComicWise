"use client";

// ═══════════════════════════════════════════════════
// VERIFY EMAIL PAGE (Next.js 16 + React 19)
// ═══════════════════════════════════════════════════

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { verifyEmail as verifyEmailAction } from "@/lib/actions/auth";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function VerifyEmailContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const searchParameters = useSearchParams();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParameters.get("token");

      if (!token) {
        setStatus("error");
        setErrorMessage("Invalid verification link. Please check your email and try again.");
        return;
      }

      try {
        const result = await verifyEmailAction({ token });

        if (!result.success) {
          setStatus("error");
          setErrorMessage(result.error || "Verification failed");
        } else {
          setStatus("success");
        }
      } catch (error) {
        console.error("Email verification error:", error);
        setStatus("error");
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    };

    verifyEmail();
  }, [searchParameters]);

  if (status === "loading") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className={`mx-auto mb-2 flex size-12 items-center justify-center`}>
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Verifying Email</CardTitle>
          <CardDescription>Please wait while we verify your email address...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div
            className={`
              mx-auto mb-2 flex size-12 items-center justify-center rounded-full
              bg-red-100
            `}
          >
            <XCircle className="size-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Verification Failed</CardTitle>
          <CardDescription className="text-red-600">{errorMessage}</CardDescription>
        </CardHeader>
        <CardFooter className="flex-col space-y-2">
          <Link href="/resend-verification" className="w-full">
            <Button className="w-full">Request New Link</Button>
          </Link>
          <Link href="/sign-in" className="w-full">
            <Button variant="outline" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

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
        <CardTitle className="text-2xl font-bold">Email Verified!</CardTitle>
        <CardDescription>
          Your email has been successfully verified. You can now access all features of ComicWise.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <h3 className="mb-2 font-semibold">Welcome to ComicWise!</h3>
          <p className="text-sm text-muted-foreground">
            Start exploring thousands of comics, bookmark your favorites, and join our community of
            readers.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Link href="/sign-in" className="w-full">
          <Button className="w-full">Continue to Sign In</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

/**
 *
 */
export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Verifying your email...</CardDescription>
          </CardHeader>
        </Card>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
