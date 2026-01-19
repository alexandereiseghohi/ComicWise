import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - ComicWise",
  description: "Sign in to your ComicWise account",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`
        flex min-h-screen items-center justify-center bg-linear-to-br
        from-background to-muted p-4
      `}
    >
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">ComicWise</h1>
          <p className="mt-2 text-muted-foreground">Your comic reading companion</p>
        </div>
        {children}
      </div>
    </div>
  );
}
