"use client";

import { CheckboxFormField, TextFormField } from "@/components/shared/FormFields";
import { GenericForm } from "@/components/shared/GenericForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { registerUser } from "@/lib/actions/auth";
import { signUpSchema } from "@/schemas/authSchemas";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();

  const handleSignUp = async (data: unknown) => {
    const result = await registerUser(data as any);
    if (result.success) {
      router.push("/sign-in?message=Account created successfully. Please sign in.");
    }
    return result;
  };

  return (
    <div className="container mx-auto max-w-md py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Sign Up</CardTitle>
          <CardDescription>Create your ComicWise account</CardDescription>
        </CardHeader>
        <CardContent>
          <GenericForm schema={signUpSchema} onSubmit={handleSignUp} submitText="Create Account">
            {() => (
              <div className="space-y-4">
                <TextFormField name="name" label="Full Name" placeholder="John Doe" />
                <TextFormField
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="john@example.com"
                />
                <TextFormField
                  name="password"
                  label="Password"
                  type="password"
                  description="Min 8 characters with uppercase, lowercase, number, and special character"
                />
                <TextFormField name="confirmPassword" label="Confirm Password" type="password" />
                <CheckboxFormField
                  name="agreeToTerms"
                  label="I agree to the Terms and Conditions"
                />
              </div>
            )}
          </GenericForm>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
