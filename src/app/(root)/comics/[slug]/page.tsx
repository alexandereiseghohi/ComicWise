/**
 * Comic Detail Page
 *
 * Displays detailed information about a specific comic including:
 * - Cover image and metadata
 * - Description and genres
 * - Chapter list with reading progress
 * - Rating and reviews
 * - Bookmark functionality
 *
 * @route GET /comics/[slug]
 * @param slug Comic slug identifier
 *
 * @returns Comic detail page with chapters and metadata
 */

import CacheComicDetail from "@/components/comics/CacheComicDetail";

export default function ComicDetailPage({ params }: { params: { slug: string } }) {
  return <CacheComicDetail params={params} />;
}
