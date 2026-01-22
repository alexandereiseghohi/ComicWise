"use client";
import { ImageUpload } from "@/components/admin/image-upload";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const chapterSchema = z
  .object({
    comicId: z.number().min(1, "Comic is required"),
    chapterNumber: z.number().min(0, "Chapter number must be positive"),
    title: z.string().min(1, "Title is required").max(500),
    content: z.string().optional(),
    releaseDate: z.string().optional(),
    sendNotifications: z.boolean(),
    imageUrls: z.array(z.string().url()).optional(),
  })
  .strict();

type ChapterFormValues = z.infer<typeof chapterSchema>;

interface Comic {
  id: number;
  title: string;
}

export default function NewChapterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [comics, setComics] = useState<Comic[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const form = useForm<ChapterFormValues>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      chapterNumber: 1,
      title: "",
      content: "",
      releaseDate: new Date().toISOString().split("T")[0],
      sendNotifications: true,
      imageUrls: [],
    },
  });

  useEffect(() => {
    async function fetchComics() {
      try {
        const response = await fetch("/api/comics?limit=1000");
        if (!response.ok) throw new Error("Failed to fetch comics");
        const data = await response.json();
        setComics(data.comics || []);
      } catch {
        toast.error("Failed to load comics");
      }
    }
    fetchComics();
  }, []);

  const handleImageRemove = (url?: string) => {
    if (!url) return;
    setUploadedImages((prev) => prev.filter((img) => img !== url));
    form.setValue(
      "imageUrls",
      uploadedImages.filter((img) => img !== url)
    );
  };

  const handleImageUpload = (url: string) => {
    setUploadedImages((prev) => {
      const next = [...prev, url];
      form.setValue("imageUrls", next);
      return next;
    });
  };

  async function onSubmit(data: ChapterFormValues) {
    setIsLoading(true);

    try {
      // Create chapter
      const response = await fetch("/api/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          releaseDate: data.releaseDate ? new Date(data.releaseDate) : new Date(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create chapter");
      }

      const chapter = await response.json();

      // Upload chapter images if any
      if (uploadedImages.length > 0) {
        const imagesPayload = uploadedImages.map((url, index) => ({
          imageUrl: url,
          pageNumber: index + 1,
        }));

        await fetch("/api/chapter-images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chapterId: chapter.id,
            images: imagesPayload,
          }),
        });
      }

      toast.success(
        data.sendNotifications
          ? "Chapter created and notifications sent!"
          : "Chapter created successfully"
      );
      router.push("/admin/chapters");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create chapter");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Chapter</h1>
        <p className="text-muted-foreground">Add a new chapter to a comic</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chapter Information</CardTitle>
          <CardDescription>Enter the details for the new chapter</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="comicId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comic *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number.parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a comic" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {comics.map((comic) => (
                          <SelectItem key={comic.id} value={comic.id.toString()}>
                            {comic.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div
                className={`
                  grid gap-6
                  md:grid-cols-2
                `}
              >
                <FormField
                  control={form.control}
                  name="chapterNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chapter Number *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="releaseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Release Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Chapter title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content/Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Chapter summary or description..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Chapter Images</FormLabel>
                <FormDescription className="mb-4">
                  Upload images for this chapter (in reading order)
                </FormDescription>
                <ImageUpload
                  onUploadComplete={handleImageUpload}
                  onRemove={handleImageRemove}
                  uploadType="chapter"
                />
                {uploadedImages.length > 0 && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {uploadedImages.length} image(s) uploaded
                  </p>
                )}
              </div>

              <FormField
                control={form.control}
                name="sendNotifications"
                render={({ field }) => (
                  <FormItem
                    className={`
                      flex flex-row items-center justify-between rounded-lg
                      border p-4
                    `}
                  >
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Send Notifications</FormLabel>
                      <FormDescription>
                        Email users who bookmarked this comic about the new chapter
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Chapter"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
