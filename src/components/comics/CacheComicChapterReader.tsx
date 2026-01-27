import appConfig from "@/appConfig";
import dynamic from "next/dynamic";
import { ComicChapters } from "./ComicChapters";

// Dynamically import the ChapterReader client component (default export)
const ChapterReader = dynamic(() => import("@/components/chapters/ChapterReader"), {
  ssr: false,
});

export const revalidate = 300;

interface Props {
  params?: { slug?: string; "chapter-id"?: string };
}

export default async function CacheComicChapterReader({ params }: Props) {
  const slug = params?.slug;
  const chapterId = params?.["chapter-id"];
  if (!slug || !chapterId) throw new Error("Missing slug or chapter id");

  const base = appConfig.url ?? process.env["NEXT_PUBLIC_APP_URL"] ?? "";
  const url = `${base.replace(/\/$/, "")}/api/comics/${encodeURIComponent(
    slug
  )}/chapters/${encodeURIComponent(String(chapterId))}`;

  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) throw new Error("Failed to fetch chapter");

  const payload = await res.json();

  // Determine pages/images for the chapter. Prefer payload.chapter.images or pages.
  let pages: string[] = [];
  if (payload.chapter?.pages && Array.isArray(payload.chapter.pages)) {
    pages = payload.chapter.pages;
  } else if (payload.chapter?.images && Array.isArray(payload.chapter.images)) {
    pages = payload.chapter.images;
  } else if (payload.chapter?.id) {
    // try fetching via chapter-images API
    try {
      const imgsRes = await fetch(
        `${base.replace(/\/$/, "")}/api/chapter-images?chapterId=${encodeURIComponent(
          String(payload.chapter.id)
        )}`,
        { next: { revalidate } }
      );
      if (imgsRes.ok) {
        const imgsPayload = await imgsRes.json();
        if (Array.isArray(imgsPayload?.data)) {
          pages = imgsPayload.data
            .slice()
            .sort((a: any, b: any) => (a.pageNumber || 0) - (b.pageNumber || 0))
            .map((i: any) => i.imageUrl || i.url || "");
        }
      }
    } catch (err) {
      // ignore and continue without images
      console.error("Failed to fetch chapter images:", err);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{payload.chapter?.title ?? "Chapter"}</h1>
      <p className="text-sm text-muted-foreground">Chapter {payload.chapter?.number}</p>

      <ComicChapters comicSlug={slug} chapters={payload.comicChapters ?? []} isLoading={false} />

      {/* Chapter pages reader (client component) */}
      <div>
        {/* ChapterReader is a client component that handles zoom, navigation and fullscreen */}
        <ChapterReader pages={pages} initialPage={0} isLoading={pages.length === 0} />
      </div>
    </div>
  );
}
