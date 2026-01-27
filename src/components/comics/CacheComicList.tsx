import appConfig from "@/appConfig";
import { ComicsList } from "./comics-list";

export const revalidate = 60;

interface Props {
  searchParams?: Record<string, string | undefined>;
}

export default async function CacheComicList({ searchParams }: Props) {
  // searchParams may be a Promise in next/app router contexts; unwrap safely.
  const resolvedSearchParams = (await (searchParams as any)) ?? {};

  const page = Number(resolvedSearchParams?.["page"] ?? "1");
  const limit = Number(
    resolvedSearchParams?.["limit"] ?? String(appConfig.pagination.comicsPerPage ?? 12)
  );
  const sort = resolvedSearchParams?.["sort"] ?? "newest";
  const genre = resolvedSearchParams?.["genre"];
  const status = resolvedSearchParams?.["status"];
  const search = resolvedSearchParams?.["search"];

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sort,
    ...(genre ? { genre } : {}),
    ...(status ? { status } : {}),
    ...(search ? { search } : {}),
  });

  const base = appConfig.url ?? process.env["NEXT_PUBLIC_APP_URL"] ?? "";
  const url = `${base.replace(/\/$/, "")}/api/comics?${params.toString()}`;

  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) {
    throw new Error("Failed to fetch comics");
  }

  const json = await res.json();

  return (
    <ComicsList
      comics={json.comics ?? []}
      totalCount={json.total ?? 0}
      currentPage={json.page ?? page}
      pageSize={limit}
      types={json.types ?? []}
      genres={json.genres ?? []}
    />
  );
}
