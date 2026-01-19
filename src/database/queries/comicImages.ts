import { db as database } from "@/database/db";
import { comicImage } from "@/database/schema";
import { asc, eq } from "drizzle-orm";

export async function getComicImageById(imageId: number) {
  return await database.query.comicImage.findFirst({
    where: eq(comicImage.id, imageId),
  });
}

export async function getComicImages(comicId: number) {
  return await database.query.comicImage.findMany({
    where: eq(comicImage.comicId, comicId),
    orderBy: asc(comicImage.imageOrder),
  });
}

export async function getComicImageCount(comicId: number) {
  const images = await database.select().from(comicImage).where(eq(comicImage.comicId, comicId));
  return images.length;
}
