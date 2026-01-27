import CacheComicList from "@/components/comics/CacheComicList";

export default function ComicsPage({ searchParams }: { searchParams?: Record<string, string> }) {
  return <CacheComicList searchParams={searchParams} />;
}
