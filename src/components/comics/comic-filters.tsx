"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useComics } from "@/hooks/use-stores";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

interface Type {
  id: number;
  name: string;
}

interface Genre {
  id: number;
  name: string;
}

interface ComicFiltersProps {
  types: Type[];
  genres: Genre[];
}

export function ComicFilters({ types, genres }: ComicFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { filters: storeFilters, applyFilters, clearFilters } = useComics();

  const [filters, setFilters] = useState({
    search: searchParams.get("search") ?? "",
    type: searchParams.get("type") ?? "",
    status: searchParams.get("status") ?? "",
    sort: searchParams.get("sort") ?? "latest",
  });

  useEffect(() => {
    applyFilters({
      search: filters.search,
      typeId: filters.type ? Number.parseInt(filters.type) : undefined,
      status: filters.status || undefined,
    });
  }, []);

  const handleApplyFilters = () => {
    const params = new URLSearchParams();

    if (filters.search) params.set("search", filters.search);
    if (filters.type) params.set("type", filters.type);
    if (filters.status) params.set("status", filters.status);
    if (filters.sort) params.set("sort", filters.sort);

    // Update Zustand store
    applyFilters({
      search: filters.search,
      typeId: filters.type ? Number.parseInt(filters.type) : undefined,
      status: filters.status || undefined,
    });

    startTransition(() => {
      router.push(`/comics?${params.toString()}`);
    });
  };

  const handleReset = () => {
    setFilters({ search: "", type: "", status: "", sort: "latest" });
    clearFilters();
    startTransition(() => {
      router.push("/comics");
    });
  };

  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold">Filters</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Comic title..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-9"
              onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            value={filters.type}
            onValueChange={(value) => setFilters({ ...filters, type: value })}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              {types.map((type) => (
                <SelectItem key={type.id} value={String(type.id)}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value })}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="Ongoing">Ongoing</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Hiatus">Hiatus</SelectItem>
              <SelectItem value="Dropped">Dropped</SelectItem>
              <SelectItem value="Season End">Season End</SelectItem>
              <SelectItem value="Coming Soon">Coming Soon</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sort">Sort By</Label>
          <Select
            value={filters.sort}
            onValueChange={(value) => setFilters({ ...filters, sort: value })}
          >
            <SelectTrigger id="sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
              <SelectItem value="views">Most Viewed</SelectItem>
              <SelectItem value="title">Title (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end gap-2">
          <Button onClick={handleApplyFilters} disabled={isPending} className="flex-1">
            Apply
          </Button>
          <Button onClick={handleReset} variant="outline" disabled={isPending}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
