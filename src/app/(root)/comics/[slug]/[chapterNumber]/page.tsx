/* eslint-disable typescript-eslint/no-non-null-assertion */
import { ChapterReader } from "@/components/chapters/ChapterReader";
import { db as database } from "@/database/db";
import { chapter, chapterImage, comic } from "@/database/schema";
import { updateProgress } from "@/lib/actions/bookmark";
import { auth } from "@/lib/auth";
import { and, asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

interface ChapterPageProps {
  params: Promise<{ slug: string; chapterNumber: string }>;
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { slug, chapterNumber } = await params;

  const [comicData] = await database
    .select({
      id: comic.id,
      title: comic.title,
      slug: comic.slug,
    })
    .from(comic)
    .where(eq(comic.slug, slug))
    .limit(1);

  if (!comicData) {
    notFound();
  }

  const [currentChapter] = await database
    .select()
    .from(chapter)
    .where(and(eq(chapter.comicId, comicData.id), eq(chapter.chapterNumber, Number(chapterNumber))))
    .limit(1);

  if (!currentChapter) {
    notFound();
  }

  const images = await database
    .select()
    .from(chapterImage)
    .where(eq(chapterImage.chapterId, currentChapter.id))
    .orderBy(asc(chapterImage.pageNumber));

  const [prevChapter] = await database
    .select({
      slug: chapter.slug,
      chapterNumber: chapter.chapterNumber,
    })
    .from(chapter)
    .where(
      and(
        eq(chapter.comicId, comicData.id),
        eq(chapter.chapterNumber, currentChapter.chapterNumber - 1)
      )
    )
    .limit(1);

  const [nextChapter] = await database
    .select({
      slug: chapter.slug,
      chapterNumber: chapter.chapterNumber,
    })
    .from(chapter)
    .where(
      and(
        eq(chapter.comicId, comicData.id),
        eq(chapter.chapterNumber, currentChapter.chapterNumber + 1)
      )
    )
    .limit(1);

  const session = await auth();
  if (session?.user?.id) {
    await updateProgress(comicData.id, currentChapter.id).catch(console.error);
  }

  return (
    <ChapterReader
      comic={comicData}
      chapter={currentChapter}
      images={images}
      prevChapter={prevChapter!}
      nextChapter={nextChapter!}
    />
  );
}
