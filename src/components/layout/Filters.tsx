"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface Type {
  id: number;
  name: string;
}

interface Genre {
  id: number;
  name: string;
}

interface FiltersProps {
  types: Type[];
  genres: Genre[];
}

export function Filters({ types, genres }: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedType, setSelectedType] = useState<number | null>(
    searchParams.get("type") ? Number(searchParams.get("type")) : null
  );
  const [selectedGenres, setSelectedGenres] = useState<number[]>(
    searchParams.get("genres") ? searchParams.get("genres")!.split(",").map(Number) : []
  );
  const [selectedStatus, setSelectedStatus] = useState<string | null>(
    searchParams.get("status") || null
  );
  const [sortBy, setSortBy] = useState<string>(searchParams.get("sort") || "latest");
  const [isOpen, setIsOpen] = useState(false);

  const statuses = ["Ongoing", "Completed", "Hiatus", "Dropped", "Coming Soon"];
  const sortOptions = [
    { value: "latest", label: "Latest" },
    { value: "rating", label: "Highest Rated" },
    { value: "views", label: "Most Popular" },
    { value: "title", label: "A-Z" },
  ];

  const toggleGenre = (genreId: number) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId]
    );
  };

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (selectedType) {
      params.set("type", selectedType.toString());
    }
    if (selectedGenres.length > 0) {
      params.set("genres", selectedGenres.join(","));
    }
    if (selectedStatus) {
      params.set("status", selectedStatus);
    }
    if (sortBy) {
      params.set("sort", sortBy);
    }

    router.push(`/comics?${params.toString()}`);
  };

  const resetFilters = () => {
    setSelectedType(null);
    setSelectedGenres([]);
    setSelectedStatus(null);
    setSortBy("latest");
    router.push("/comics");
  };

  const hasActiveFilters = selectedType || selectedGenres.length > 0 || selectedStatus;

  return (
    <>
      {/* Mobile Toggle */}
      <div
        className={`
          mb-4
          md:hidden
        `}
      >
        <Button variant="outline" className="w-full" onClick={() => setIsOpen(!isOpen)}>
          <SlidersHorizontal className="mr-2 size-4" />
          Filters {hasActiveFilters && `(${1 + selectedGenres.length})`}
        </Button>
      </div>

      {/* Filters Panel */}
      <Card
        className={`
          mb-6
          ${isOpen ? "block" : "hidden md:block"}
        `}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Filters</span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className={`
                text-sm
              `}
              >
                Reset
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sort By */}
          <div>
            <Label className="mb-3 block">Sort By</Label>
            <div className="grid grid-cols-2 gap-2">
              {sortOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={sortBy === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy(option.value)}
                  className="w-full"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <Label className="mb-3 block">Type</Label>
            <div className="flex flex-wrap gap-2">
              {types.map((type) => (
                <Badge
                  key={type.id}
                  variant={selectedType === type.id ? "default" : "outline"}
                  className={`
                    cursor-pointer
                    hover:bg-primary/10
                  `}
                  onClick={() => setSelectedType(selectedType === type.id ? null : type.id)}
                >
                  {type.name}
                  {selectedType === type.id && <X className="ml-1 size-3" />}
                </Badge>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <Label className="mb-3 block">Status</Label>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <Badge
                  key={status}
                  variant={selectedStatus === status ? "default" : "outline"}
                  className={`
                    cursor-pointer
                    hover:bg-primary/10
                  `}
                  onClick={() => setSelectedStatus(selectedStatus === status ? null : status)}
                >
                  {status}
                  {selectedStatus === status && <X className="ml-1 size-3" />}
                </Badge>
              ))}
            </div>
          </div>

          {/* Genre Filter */}
          <div>
            <Label className="mb-3 block">
              Genres
              {selectedGenres.length > 0 && ` (${selectedGenres.length})`}
            </Label>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <Badge
                  key={genre.id}
                  variant={selectedGenres.includes(genre.id) ? "default" : "outline"}
                  className={`
                    cursor-pointer
                    hover:bg-primary/10
                  `}
                  onClick={() => toggleGenre(genre.id)}
                >
                  {genre.name}
                  {selectedGenres.includes(genre.id) && (
                    <X
                      className={`
                    ml-1 size-3
                  `}
                    />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <Button onClick={applyFilters} className="w-full">
            Apply Filters
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
