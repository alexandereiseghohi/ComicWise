import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getBookmarkCount } from "@/database/queries";
import { auth } from "auth";
import { BookMarked, Mail, User } from "lucide-react";
import { redirect } from "next/navigation";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile - ComicWise",
  description: "Manage your account and preferences",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/profile");
  }

  const bookmarkCount = await getBookmarkCount(session.user.id);

  const initials =
    session.user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1
        className={`
          mb-8 text-3xl font-bold
          md:text-4xl
        `}
      >
        My Profile
      </h1>

      <div
        className={`
          grid gap-8
          md:grid-cols-[300px_1fr]
        `}
      >
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Avatar */}
          <Card>
            <CardContent className="pt-6 text-center">
              <Avatar className="mx-auto mb-4 size-32">
                <AvatarImage src={session.user.image || undefined} />
                <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{session.user.name}</h2>
              <p className="text-sm text-muted-foreground">{session.user.email}</p>
              {session.user.role && (
                <div className="mt-3">
                  <span
                    className={`
                      inline-block rounded-full bg-primary/10 px-3 py-1 text-xs
                      font-medium text-primary
                    `}
                  >
                    {session.user.role}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <BookMarked className="size-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{bookmarkCount}</p>
                  <p className="text-sm text-muted-foreground">Bookmarks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <div className="flex items-center gap-3">
                  <User className="size-5 text-muted-foreground" />
                  <Input id="name" defaultValue={session.user.name || ""} disabled />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-3">
                  <Mail className="size-5 text-muted-foreground" />
                  <Input id="email" type="email" defaultValue={session.user.email || ""} disabled />
                </div>
              </div>

              <div className="pt-2">
                <Button disabled variant="outline" className="w-full">
                  Edit Profile (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a href="/bookmarks">
                <Button variant="outline" className="w-full justify-start">
                  <BookMarked className="mr-2 size-4" />
                  My Bookmarks
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
