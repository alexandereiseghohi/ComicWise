/**
 * ComicFilters Component
 * Advanced filtering for comics listing
 * @component
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
 * Props for ComicFilters component
 */
interface ComicFiltersProps {
  /**
   * Callback when filters change
   */
  onFiltersChange(filters: FilterValues): void;
  /**
   * Available genres
   */
  genres?: Array<{ id: string; name: string }>;
  /**
   * Available types
   */
  types?: Array<{ id: string; name: string }>;
}

/**
 * Filter values structure
 */
export interface FilterValues {
  search: string;
  genre: string;
  type: string;
  status: string;
  sortBy: string;
}

/**
 * ComicFilters Component
 * Provides advanced filtering and search options
 * @param root0
 * @param root0.onFiltersChange
 * @param root0.genres
 * @param root0.types
 */
export function ComicFilters({ onFiltersChange, genres = [], types = [] }: ComicFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    genre: "",
    type: "",
    status: "",
    sortBy: "latest",
  });

  const handleChange = (key: keyof FilterValues, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    const defaultFilters: FilterValues = {
      search: "",
      genre: "",
      type: "",
      status: "",
      sortBy: "latest",
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filter & Search</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search comics..."
            value={filters.search}
            onChange={(e) => handleChange("search", e.target.value)}
          />
        </div>

        {/* Genre Filter */}
        <div className="space-y-2">
          <Label htmlFor="genre">Genre</Label>
          <Select value={filters.genre} onValueChange={(value) => handleChange("genre", value)}>
            <SelectTrigger id="genre">
              <SelectValue placeholder="All genres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All genres</SelectItem>
              {genres.map((genre) => (
                <SelectItem key={genre.id} value={genre.id}>
                  {genre.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type Filter */}
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select value={filters.type} onValueChange={(value) => handleChange("type", value)}>
            <SelectTrigger id="type">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All types</SelectItem>
              {types.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={filters.status} onValueChange={(value) => handleChange("status", value)}>
            <SelectTrigger id="status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="hiatus">Hiatus</SelectItem>
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
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="trending">Trending</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reset Button */}
        <Button onClick={handleReset} variant="outline" className="w-full">
          Reset Filters
        </Button>
      </CardContent>
    </Card>
  );
}
