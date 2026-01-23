/**
 * BookmarkFilters Component
 * Filtering for bookmarked comics
 * @component
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

/**
 * Props for BookmarkFilters component
 */
interface BookmarkFiltersProps {
  /**
   * Callback when filters change
   */
  onFiltersChange(filters: BookmarkFilterValues): void;
}

/**
 * Bookmark filter values
 */
export interface BookmarkFilterValues {
  status: string;
  sortBy: string;
  viewMode: "grid" | "list";
}

/**
 * BookmarkFilters Component
 * Provides filtering and view options for bookmarks
 * @param root0
 * @param root0.onFiltersChange
 */
export function BookmarkFilters({ onFiltersChange }: BookmarkFiltersProps) {
  const [filters, setFilters] = useState<BookmarkFilterValues>({
    status: "all",
    sortBy: "recent",
    viewMode: "list",
  });

  const handleChange = (key: keyof BookmarkFilterValues, value: string) => {
    const newFilters = {
      ...filters,
      [key]: value as any,
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    const defaultFilters: BookmarkFilterValues = {
      status: "all",
      sortBy: "recent",
      viewMode: "list",
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={filters.status} onValueChange={(value) => handleChange("status", value)}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="reading">Currently Reading</SelectItem>
              <SelectItem value="plan_to_read">Plan to Read</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="dropped">Dropped</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="space-y-2">
          <Label htmlFor="sort">Sort By</Label>
          <Select value={filters.sortBy} onValueChange={(value) => handleChange("sortBy", value)}>
            <SelectTrigger id="sort">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recently Added</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="updated">Recently Updated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Mode */}
        <div className="space-y-2">
          <Label>View Mode</Label>
          <div className="flex gap-2">
            {(["list", "grid"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => handleChange("viewMode", mode)}
                className={`flex-1 rounded-sm px-3 py-2 text-sm font-medium transition-colors ${
                  filters.viewMode === mode
                    ? "bg-primary text-primary-foreground"
                    : "border border-input bg-background hover:bg-accent"
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        <Button onClick={handleReset} variant="outline" className="w-full">
          Reset Filters
        </Button>
      </CardContent>
    </Card>
  );
}
