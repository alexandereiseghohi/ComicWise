"use client";

import { AvatarUpload } from "@/components/ui/AvatarUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadAvatar } from "@/lib/actions/avatar";
import { updateUserProfile } from "@/lib/actions/users";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const editProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name too long"),
  email: z.string().email("Invalid email address"),
  bio: z.string().max(500, "Bio is too long").optional(),
  image: z.string().url("Invalid image URL").optional().or(z.literal("")),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

interface EditProfileFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export function EditProfileForm({ user }: EditProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(user.image);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      bio: "",
      image: user.image || "",
    },
  });

  const onSubmit = (data: EditProfileFormData) => {
    startTransition(async () => {
      try {
        const result = await updateUserProfile({
          name: data.name,
          email: data.email,
          bio: data.bio,
          image: data.image || null,
        });

        if (result.success) {
          toast.success("Profile updated successfully!");
        } else {
          toast.error(result.error || "Failed to update profile");
        }
      } catch (error) {
        toast.error("An error occurred while updating profile");
        console.error("Profile update error:", error);
      }
    });
  };

  const handleImageSelect = async (file: File) => {
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const result = await uploadAvatar(formData);

      if (result.success && result.data) {
        setImagePreview(result.data.url);
        setValue("image", result.data.url);
        toast.success("Avatar uploaded successfully!");
      } else if (!result.success) {
        toast.error("error" in result ? result.error : "Failed to upload avatar");
      }
    } catch (error) {
      toast.error("An error occurred while uploading avatar");
      console.error("Avatar upload error:", error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageRemove = () => {
    setImagePreview(null);
    setValue("image", "");
    toast.info("Avatar removed. Save changes to confirm.");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your profile details and public information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center">
            <AvatarUpload
              currentImage={imagePreview}
              onImageSelect={handleImageSelect}
              onImageRemove={handleImageRemove}
              className="mb-4"
            />
            {isUploadingImage && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Uploading avatar...
              </div>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter your name"
              disabled={isPending}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="Enter your email"
              disabled={isPending}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            <p className="text-xs text-muted-foreground">
              Changing your email will require verification
            </p>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              {...register("bio")}
              placeholder="Tell us about yourself"
              rows={4}
              disabled={isPending}
            />
            {errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}
            <p className="text-xs text-muted-foreground">
              Brief description for your profile. Max 500 characters.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Save Changes
            </Button>
            <Button type="button" variant="outline" disabled={isPending}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
