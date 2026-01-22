"use client";

import { TextFormField } from "@/components/shared/form-fields";
import { GenericForm } from "@/components/shared/generic-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { forgotPassword } from "@/lib/actions/auth";
import { forgotPasswordSchema } from "@/schemas/auth-schemas";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const handleForgotPassword = async (data: unknown) => {
    const result = await forgotPassword(data as any);
    return result;
  };

  return (
    <div className="container mx-auto max-w-md py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Forgot Password</CardTitle>
          <CardDescription>Enter your email to reset your password</CardDescription>
        </CardHeader>
        <CardContent>
          <GenericForm
            schema={forgotPasswordSchema}
            onSubmit={handleForgotPassword}
            submitText="Send Reset Link"
          >
            {() => (
              <div className="space-y-4">
                <TextFormField
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="john@example.com"
                  description="We'll send you a reset link"
                />
              </div>
            )}
          </GenericForm>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link href="/sign-in" className="font-medium text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
