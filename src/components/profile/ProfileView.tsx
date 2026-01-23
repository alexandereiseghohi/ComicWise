/**
 * ProfileView Component
 * Displays user profile information with statistics and navigation
 * @component
 */

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import Link from "next/link";

/**
 * Props for ProfileView component
 */
interface ProfileViewProps {
  /**
   * User statistics
   */
  stats?: {
    comics_read: number;
    bookmarks: number;
    reviews: number;
  };
}

/**
 * ProfileView Component
 * Shows user's profile overview with avatar, basic info, and statistics
 * @param root0
 * @param root0.stats
 */
export function ProfileView({
  stats = { comics_read: 0, bookmarks: 0, reviews: 0 },
}: ProfileViewProps) {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-sm text-muted-foreground">
            Please sign in to view your profile
          </p>
        </CardContent>
      </Card>
    );
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : (user.email?.[0]?.toUpperCase() ?? "U");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Overview</CardTitle>
        <CardDescription>Your reading profile and statistics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Header */}
        <div className="flex items-start gap-4">
          <Avatar className="size-20">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? "User"} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div>
              <h3 className="text-lg font-semibold">{user.name ?? "User"}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            {user.role && (
              <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                {user.role.toUpperCase()}
              </Badge>
            )}
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.comics_read}</div>
            <p className="text-xs text-muted-foreground">Comics Read</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.bookmarks}</div>
            <p className="text-xs text-muted-foreground">Bookmarks</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.reviews}</div>
            <p className="text-xs text-muted-foreground">Reviews</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-4">
          <Link
            href="/profile/edit"
            className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Edit Profile
          </Link>
          <Link
            href="/profile/settings"
            className="flex-1 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Settings
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
