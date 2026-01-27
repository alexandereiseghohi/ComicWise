/**
 * Chapter Reader Page
 *
 * Full-screen chapter reader with:
 * - Image/content display
 * - Navigation between chapters
 * - Reading progress tracking
 * - Comments and ratings
 *
 * @route GET /comics/[slug]/chapters/[chapterId]
 * @param slug Comic slug
 * @param chapterId Chapter ID
 *
 * @returns Chapter reader interface
 */

import CacheComicChapterReader from "@/components/comics/CacheComicChapterReader";

export default function ChapterReaderPage({
  params,
}: {
  params: { slug: string; "chapter-id": string };
}) {
  return <CacheComicChapterReader params={params} />;
}
