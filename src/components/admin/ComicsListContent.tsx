"use client";

import { bulkDeleteComics, deleteComic } from "@/app/admin/comics/actions";
import { ComicsTable } from "@/components/admin/ComicsTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/useToast";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

interface ComicsListPageProps {
  initialComics: Array<{
    id: number;
    title: string;
    slug: string;
    coverImage: string;
    status: "Ongoing" | "Hiatus" | "Completed" | "Dropped" | "Coming Soon";
    views: number;
    createdAt: Date;
    updatedAt: Date;
  }>;
  hasNextPage: boolean;
  nextCursor: number | null;
}

export function ComicsListContent({ initialComics, hasNextPage, nextCursor }: ComicsListPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [comics, setComics] = useState(initialComics);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [canGoNext] = useState(hasNextPage);
  const [canGoPrevious, setCanGoPrevious] = useState(false);

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        setIsLoading(true);
        const result = await deleteComic(id);
        if (result.success) {
          setComics(comics.filter((c) => c.id !== id));
          toast({
            title: "Success",
            description: "Comic deleted successfully",
          });
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to delete comic",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete comic",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [comics, toast]
  );

  const handleBulkDelete = useCallback(
    async (ids: number[]) => {
      try {
        setIsLoading(true);
        const result = await bulkDeleteComics(ids);
        if (result.success) {
          setComics(comics.filter((c) => !ids.includes(c.id)));
          toast({
            title: "Success",
            description: `${ids.length} comic(s) deleted successfully`,
          });
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to delete comics",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete comics",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [comics, toast]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/comics?q=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push("/admin/comics");
    }
  };

  const handleNextPage = () => {
    if (canGoNext && nextCursor) {
      router.push(`/admin/comics?cursor=${nextCursor}`);
      setCurrentPage(currentPage + 1);
      setCanGoPrevious(true);
    }
  };

  const handlePreviousPage = () => {
    if (canGoPrevious) {
      router.back();
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comics</h1>
          <p className="text-muted-foreground">Manage all comics in your library</p>
        </div>
        <Button asChild>
          <Link href="/admin/comics/new">
            <Plus className="mr-2 size-4" />
            New Comic
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search comics by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              <Search className="mr-2 size-4" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Comics Table */}
      <ComicsTable
        comics={comics}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        currentPage={currentPage}
        hasNextPage={canGoNext}
        hasPrevPage={canGoPrevious}
        onNextPage={handleNextPage}
        onPrevPage={handlePreviousPage}
        isLoading={isLoading}
      />
    </div>
  );
}
