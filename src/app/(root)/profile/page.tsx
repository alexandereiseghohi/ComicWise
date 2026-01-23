"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { redirect } from "next/navigation";

/**
 * Profile view page - Displays user information and recent activity
 */
export default function ProfilePage() {
  const { data: session } = useSession();

  if (!session) {
    redirect("/auth/signin");
  }

  const user = session.user;

  return (
    <div className="container py-8">
      <div className="grid gap-8">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>View and manage your profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Info */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <p className="text-lg">{user?.name || "Not set"}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <p className="text-lg">{user?.email}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Link href="/profile/edit">
                <Button>Edit Profile</Button>
              </Link>
              <Link href="/profile/settings">
                <Button variant="outline">Settings</Button>
              </Link>
              <Link href="/profile/change-password">
                <Button variant="outline">Change Password</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Comics Read</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Bookmarks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Followers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
