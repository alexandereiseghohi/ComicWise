/**
 * User Profile Page
 *
 * Displays user profile information including:
 * - Profile picture and basic info
 * - Reading statistics
 * - Bookmarked comics
 * - Edit profile functionality
 *
 * @route GET /profile/[userId]
 * @param userId User ID
 *
 * @returns User profile page
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { normalizeImagePath } from "@/lib/image-path";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Calendar, Heart, Loader2, Mail } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  createdAt: string;
  bio?: string;
  stats: {
    bookmarkCount: number;
    readChaptersCount: number;
    followersCount: number;
    followingCount: number;
  };
  bookmarkedComics: Array<{
    id: string;
    title: string;
    slug: string;
    coverImage: string | null;
  }>;
}

interface ProfilePageProps {
  params: {
    userId: string;
  };
}

/**
 * Fetch user profile from API
 * @param userId
 */
async function fetchUserProfile(userId: string): Promise<UserProfile> {
  const response = await fetch(`/api/users/${userId}/profile`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) throw new Error("Failed to fetch profile");
  return response.json();
}

/**
 * User Profile Page Component
 * @param root0
 * @param root0.params
 */
export default function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = params;
  const { data: session } = useSession();

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => fetchUserProfile(userId),
  });

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-500">Error loading profile</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  const isOwnProfile = session?.user?.id === userId;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-8">
            <div className="flex flex-col items-start gap-8 md:flex-row md:items-center">
              {/* Avatar */}
              <div className="relative size-32 shrink-0">
                {profile.image ? (
                  <Image
                    src={normalizeImagePath(profile.image) ?? profile.image}
                    alt={profile.name}
                    fill
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center rounded-full bg-linear-to-br from-purple-400 to-pink-600 text-4xl font-bold text-white">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">{profile.name}</h1>
                    <Badge className="mt-2">{profile.role.toUpperCase()}</Badge>
                  </div>
                  {isOwnProfile && (
                    <Button asChild>
                      <Link href={`/profile/edit`}>Edit Profile</Link>
                    </Button>
                  )}
                </div>

                {profile.bio && <p className="mb-4 text-gray-600">{profile.bio}</p>}

                {/* Contact Info */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="size-4" />
                    <span>{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4" />
                    <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-2 gap-4 border-t pt-8 md:grid-cols-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{profile.stats.bookmarkCount}</p>
                <p className="text-sm text-gray-600">Bookmarks</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{profile.stats.readChaptersCount}</p>
                <p className="text-sm text-gray-600">Chapters Read</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{profile.stats.followersCount}</p>
                <p className="text-sm text-gray-600">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{profile.stats.followingCount}</p>
                <p className="text-sm text-gray-600">Following</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="bookmarks" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bookmarks">
              <Heart className="mr-2 size-4" />
              Bookmarks ({profile.bookmarkedComics.length})
            </TabsTrigger>
            <TabsTrigger value="reading">
              <BookOpen className="mr-2 size-4" />
              Reading History
            </TabsTrigger>
            <TabsTrigger value="followers">Following</TabsTrigger>
          </TabsList>

          {/* Bookmarks Tab */}
          <TabsContent value="bookmarks">
            {profile.bookmarkedComics.length > 0 ? (
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {profile.bookmarkedComics.map((comic) => (
                  <Link key={comic.id} href={`/comics/${comic.slug}`}>
                    <Card className="h-full cursor-pointer transition-shadow hover:shadow-lg">
                      <div className="relative aspect-3/4 w-full bg-gray-200">
                        {comic.coverImage ? (
                          <Image
                            src={normalizeImagePath(comic.coverImage) ?? comic.coverImage}
                            alt={comic.title}
                            fill
                            className="rounded-t-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center rounded-t-lg bg-linear-to-br from-purple-400 to-pink-600">
                            <BookOpen className="size-8 text-white opacity-50" />
                          </div>
                        )}
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="line-clamp-2 text-base">{comic.title}</CardTitle>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="mt-6">
                <CardContent className="py-8 text-center">
                  <Heart className="mx-auto mb-4 size-12 text-gray-300" />
                  <p className="text-gray-600">No bookmarks yet</p>
                  <Button asChild variant="outline" className="mt-4">
                    <Link href="/comics">Explore Comics</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reading History Tab */}
          <TabsContent value="reading">
            <Card className="mt-6">
              <CardContent className="py-8 text-center text-gray-600">
                <p>Reading history coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Following Tab */}
          <TabsContent value="followers">
            <Card className="mt-6">
              <CardContent className="py-8 text-center text-gray-600">
                <p>Following management coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
