"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail } from "lucide-react";
import Link from "next/link";

export default function VerifyRequestPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <div
          className={`
            mx-auto mb-4 flex size-16 items-center justify-center rounded-full
            bg-primary/10
          `}
        >
          <Mail className="size-8 text-primary" />
        </div>
        <CardTitle>Check your email</CardTitle>
        <CardDescription>
          We&apos;ve sent you a verification link. Please check your email and click the link to
          verify your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <h3 className="mb-2 font-semibold">What&apos;s next?</h3>
          <ul
            className={`
              list-inside list-disc space-y-1 text-sm text-muted-foreground
            `}
          >
            <li>Check your inbox (and spam folder)</li>
            <li>Click the verification link</li>
            <li>Sign in to your account</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex-col space-y-2">
        <Link href="/sign-in" className="w-full">
          <Button className="w-full">Back to Sign In</Button>
        </Link>
        <p className="text-center text-sm text-muted-foreground">
          Didn&apos;t receive the email?{" "}
          <Link
            href="/resend-verification"
            className={`
              text-primary
              hover:underline
            `}
          >
            Resend
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
