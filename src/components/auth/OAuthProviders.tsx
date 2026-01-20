"use client";

import { Button } from "@/components/ui/button";
import { Chrome, Github } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";

interface OAuthProvidersProps {
  /**
   * Redirect URL after successful authentication
   * @default "/"
   */
  redirectTo?: string;
  /**
   * Whether providers are loading
   */
  isLoading?: boolean;
}

/**
 * OAuth Provider Buttons Component
 * Displays Google and GitHub authentication options
 *
 * @example
 * ```tsx
 * <OAuthProviders redirectTo="/dashboard" />
 * ```
 */
export function OAuthProviders({ redirectTo = "/", isLoading = false }: OAuthProvidersProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleSignIn = async (provider: "google" | "github") => {
    try {
      setLoadingProvider(provider);
      await signIn(provider, { redirect: true, callbackUrl: redirectTo });
    } catch (error) {
      console.error(`Sign in with ${provider} failed:`, error);
      setLoadingProvider(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={() => handleSignIn("google")}
          disabled={isLoading || loadingProvider !== null}
          className="w-full"
        >
          {loadingProvider === "google" ? (
            <div className="mr-2 size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <Chrome className="mr-2 size-4" />
          )}
          Google
        </Button>

        <Button
          variant="outline"
          onClick={() => handleSignIn("github")}
          disabled={isLoading || loadingProvider !== null}
          className="w-full"
        >
          {loadingProvider === "github" ? (
            <div className="mr-2 size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <Github className="mr-2 size-4" />
          )}
          GitHub
        </Button>
      </div>
    </div>
  );
}
