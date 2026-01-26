"use client";

import type { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useImageUpload } from "@/hooks/use-image-upload";
import { normalizeImagePath } from "@/lib/image-path";
import { comicFormSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, Upload } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface ComicFormProps {
  onSubmit(
    data: z.infer<typeof comicFormSchema>
  ): Promise<{ success: boolean; error?: string } | void>;
  initialData?: Partial<z.infer<typeof comicFormSchema>>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function ComicForm({
  onSubmit,
  initialData,
  isLoading = false,
  submitLabel = "Create Comic",
}: ComicFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    fileInputRef,
    isUploading,
    uploadProgress,
    error: uploadError,
    handleFileSelect,
  } = useImageUpload({
    maxSizeMB: 10,
    uploadType: "comic-cover",
    onChange: (url) => form.setValue("coverImage", url),
  });

  const form = useForm<z.infer<typeof comicFormSchema>>({
    // ts-expect-error - zodResolver type compatibility issue with react-hook-form
    resolver: zodResolver(comicFormSchema) as any,
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      slug: initialData?.slug ?? "",
      coverImage: initialData?.coverImage ?? "",
      status: initialData?.status ?? "Ongoing",
      publicationDate: initialData?.publicationDate
        ? new Date(initialData.publicationDate)
        : new Date(),
      authorId: initialData?.authorId ? String(initialData.authorId) : "",
      artistId: initialData?.artistId ? String(initialData.artistId) : "",
      typeId: initialData?.typeId ? String(initialData.typeId) : "",
      genreIds: initialData?.genreIds || [],
    },
  });

  async function handleFormSubmit(data: z.infer<typeof comicFormSchema>) {
    try {
      setSubmitError(null);
      setIsSubmitting(true);
      const result = await onSubmit(data);
      if (result && !result.success) {
        setSubmitError(result.error ?? "Failed to save comic");
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  const coverImageValue = form.watch("coverImage");

  return (
    <div className="space-y-6">
      {submitError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className={`space-y-6`}>
          {/* Cover Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Cover Image</CardTitle>
              <CardDescription>Upload a cover image for your comic</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-6">
                {coverImageValue && (
                  <div
                    className={`
                      relative h-48 w-32 overflow-hidden rounded-lg border
                    `}
                  >
                    <Image
                      src={normalizeImagePath(coverImageValue) ?? coverImageValue}
                      alt="Cover preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="flex-1 space-y-4">
                  {uploadError && (
                    <Alert variant="destructive">
                      <AlertCircle className="size-4" />
                      <AlertDescription>{uploadError}</AlertDescription>
                    </Alert>
                  )}

                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Uploading... {uploadProgress}%
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 size-4" />
                        Choose Image
                      </>
                    )}
                  </Button>

                  <FormField
                    control={form.control as any}
                    name="coverImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control as any}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Comic title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="auto-generated from title" {...field} />
                    </FormControl>
                    <FormDescription>Leave empty to auto-generate from title</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Comic description" className={`min-h-32`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Publication Details */}
          <Card>
            <CardHeader>
              <CardTitle>Publication Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control as any}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Ongoing">Ongoing</SelectItem>
                        <SelectItem value="Hiatus">Hiatus</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Dropped">Dropped</SelectItem>
                        <SelectItem value="Coming Soon">Coming Soon</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="publicationDate"
                render={({ field }) => {
                  const dateValue =
                    field.value instanceof Date
                      ? field.value.toISOString().split("T")[0]
                      : String(field.value ?? "");
                  return (
                    <FormItem>
                      <FormLabel>Publication Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={dateValue}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </CardContent>
          </Card>

          {/* Relationships (optional) */}
          <Card>
            <CardHeader>
              <CardTitle>Relationships (Optional)</CardTitle>
              <CardDescription>Connect author, artist, and type to this comic</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control as any}
                name="authorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author ID</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Author ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="artistId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Artist ID</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Artist ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="typeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type ID</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Type ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                submitLabel
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
