'use client';

import { GenericForm } from '@/components/shared/GenericForm';
import { TextFormField } from '@/components/shared/FormFields';
import { forgotPasswordSchema } from '@/schemas/authSchemas';
import { forgotPasswordAction } from '@/lib/actions/auth';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  const handleForgotPassword = async (data: unknown) => {
    const result = await forgotPasswordAction(data);
    return result;
  };

  return (
    <div className="container max-w-md mx-auto py-12">
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
            Remember your password?{' '}
            <Link href="/sign-in" className="text-primary hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
