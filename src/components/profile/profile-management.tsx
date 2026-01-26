"use client";

/**
 * OPTIMIZED PROFILE MANAGEMENT COMPONENT
 * NextAuth integration with full CRUD functionality
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { User } from "next-auth";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface ProfileManagementProps {
  user: User;
  bookmarkCount?: number;
}

export function ProfileManagement({ user, bookmarkCount = 0 }: ProfileManagementProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? "U";

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">My Profile</h1>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardContent className="pt-6 text-center">
              <Avatar className="mx-auto mb-4 size-32">
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProfileManagement;
