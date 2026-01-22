"use client";

import { CheckboxFormField, TextFormField } from "@/components/shared/form-fields";
import { GenericForm } from "@/components/shared/generic-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signInUser } from "@/lib/actions/auth";
import { signInSchema } from "@/schemas/auth-schemas";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();

  const handleSignIn = async (data: unknown) => {
    const signInData = data as { email: string; password: string };
    const result = await signInUser(signInData.email, signInData.password);
    if (result.success) {
      router.push("/");
    }
    return result;
  };

  return (
    <div className="container mx-auto max-w-md py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Sign In</CardTitle>
          <CardDescription>Welcome back to ComicWise</CardDescription>
        </CardHeader>
        <CardContent>
          <GenericForm schema={signInSchema} onSubmit={handleSignIn} submitText="Sign In">
            {() => (
              <div className="space-y-4">
                <TextFormField
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="john@example.com"
                />
                <TextFormField name="password" label="Password" type="password" />
                <CheckboxFormField name="rememberMe" label="Remember me" />
              </div>
            )}
          </GenericForm>
          <div className="mt-4 flex flex-col gap-2 text-center text-sm">
            <Link href="/forgot-password" className="text-primary hover:underline">
              Forgot password?
            </Link>
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/sign-up" className="font-medium text-primary hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
