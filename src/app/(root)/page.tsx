import { ComicCard } from "@/components/layout/comic-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getLatestComics, getPopularComics } from "@/database/queries";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ComicWise - Your Comic Reading Platform",
  description: "Discover and read your favorite comics online",
};

async function LatestComics() {
  const comics = await getLatestComics(8);

  return (
    <div
      className={`
        grid grid-cols-2 gap-4
        md:grid-cols-3 md:gap-6
        lg:grid-cols-4
      `}
    >
      {comics.map((comic) => (
        <ComicCard key={comic.slug} comic={comic} authorName={null} typeName={null} />
      ))}
    </div>
  );
}

async function PopularComics() {
  const comics = await getPopularComics(8);

  return (
    <div
      className={`
        grid grid-cols-2 gap-4
        md:grid-cols-3 md:gap-6
        lg:grid-cols-4
      `}
    >
      {comics.map((comic) => (
        <ComicCard key={comic.slug} comic={comic} authorName={null} typeName={null} />
      ))}
    </div>
  );
}

function ComicGridSkeleton() {
  return (
    <div
      className={`
        grid grid-cols-2 gap-6
        md:grid-cols-3
        lg:grid-cols-4
      `}
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-2/3 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="container mx-auto space-y-12 px-4 py-8">
      {/* Hero Section */}
      <section
        className={`
          space-y-4 py-8 text-center
          md:py-16
        `}
      >
        <h1
          className={`
            text-4xl font-bold tracking-tight
            md:text-6xl
          `}
        >
          Welcome to ComicWise
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
          Discover and read thousands of comics from around the world
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link href="/comics">
            <Button size="lg">
              Browse Comics
              <ArrowRight className="ml-2 size-5" />
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button size="lg" variant="outline">
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      {/* Latest Releases */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Latest Releases</h2>
          <Link href="/comics?sort=latest">
            <Button variant="ghost">
              View All
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </div>
        <Suspense fallback={<ComicGridSkeleton />}>
          <LatestComics />
        </Suspense>
      </section>

      {/* Popular Comics */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Popular This Week</h2>
          <Link href="/comics?sort=views">
            <Button variant="ghost">
              View All
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </div>
        <Suspense fallback={<ComicGridSkeleton />}>
          <PopularComics />
        </Suspense>
      </section>

      {/* CTA Section */}
      <section
        className={`
          space-y-4 rounded-lg bg-muted p-8 text-center
          md:p-12
        `}
      >
        <h2
          className={`
            text-2xl font-bold
            md:text-3xl
          `}
        >
          Join Our Community
        </h2>
        <p className="mx-auto max-w-xl text-muted-foreground">
          Sign up to bookmark your favorite comics, track your reading progress, and get
          personalized recommendations.
        </p>
        <Link href="/register">
          <Button size="lg">Create Free Account</Button>
        </Link>
      </section>
    </div>
  );
}
