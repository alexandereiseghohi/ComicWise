"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateProfileAction } from "@/lib/actions/profile";
import type { ProfileUpdate } from "@/schemas/profileSchemas";
import { ProfileUpdateSchema } from "@/schemas/profileSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

/**
 * Profile edit page - Allows users to edit their profile information
 */
export default function ProfileEditPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!session) {
    redirect("/auth/signin");
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileUpdate>({
    resolver: zodResolver(ProfileUpdateSchema),
    defaultValues: {
      name: session.user?.name || "",
      email: session.user?.email || "",
    },
  });

  const onSubmit = async (data: ProfileUpdate) => {
    setLoading(true);
    try {
      const result = await updateProfileAction(session.user?.id || "", data);
      if (result.success) {
        setMessage({ type: "success", text: "Profile updated successfully" });
      } else {
        setMessage({ type: "error", text: result.error || "Update failed" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input {...register("name")} placeholder="Your name" />
              {errors.name && <span className="text-sm text-red-500">{errors.name.message}</span>}
            </div>

            <div>
              <label className="text-sm font-medium">Email</label>
              <Input {...register("email")} type="email" placeholder="your@email.com" />
              {errors.email && <span className="text-sm text-red-500">{errors.email.message}</span>}
            </div>

            <div>
              <label className="text-sm font-medium">Bio</label>
              <Textarea
                {...register("bio")}
                placeholder="Tell us about yourself"
                className="h-24"
              />
              {errors.bio && <span className="text-sm text-red-500">{errors.bio.message}</span>}
            </div>

            {message && (
              <div
                className={
                  "text-sm p-2 rounded " +
                  (message.type === "success"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800")
                }
              >
                {message.text}
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => window.history.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
