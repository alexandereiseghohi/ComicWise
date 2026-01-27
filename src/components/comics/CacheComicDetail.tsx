import appConfig from "@/appConfig";
import { ComicDetails } from "./comic-details";

export const revalidate = 120;

interface Props {
  params?: { slug?: string };
}

export default async function CacheComicDetail({ params }: Props) {
  const slug = params?.slug;
  if (!slug) throw new Error("Missing comic slug");

  const base = appConfig.url ?? process.env["NEXT_PUBLIC_APP_URL"] ?? "";
  const url = `${base.replace(/\/$/, "")}/api/comics/${encodeURIComponent(slug)}`;

  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) throw new Error("Failed to fetch comic detail");
  const payload = await res.json();

  return (
    <ComicDetails
      comic={payload.comic}
      chapters={payload.chapters ?? []}
      genres={payload.genres ?? []}
      isBookmarked={payload.isBookmarked ?? false}
      isAuthenticated={payload.isAuthenticated ?? false}
    />
  );
}
