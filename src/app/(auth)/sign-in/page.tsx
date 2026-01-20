'use client';

import { GenericForm } from '@/components/shared/GenericForm';
import { TextFormField, CheckboxFormField } from '@/components/shared/FormFields';
import { signInSchema } from '@/schemas/authSchemas';
import { signInAction } from '@/lib/actions/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignInPage() {
  const router = useRouter();

  const handleSignIn = async (data: unknown) => {
    const result = await signInAction(data);
    if (result.success) {
      router.push('/');
    }
    return result;
  };

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Sign In</CardTitle>
          <CardDescription>Welcome back to ComicWise</CardDescription>
        </CardHeader>
        <CardContent>
          <GenericForm
            schema={signInSchema}
            onSubmit={handleSignIn}
            submitText="Sign In"
          >
            {() => (
              <div className="space-y-4">
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
                />
                <CheckboxFormField 
                  name="rememberMe" 
                  label="Remember me" 
                />
              </div>
            )}
          </GenericForm>
          <div className="mt-4 flex flex-col gap-2 text-center text-sm">
            <Link href="/forgot-password" className="text-primary hover:underline">
              Forgot password?
            </Link>
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/sign-up" className="text-primary hover:underline font-medium">
                Sign Up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
