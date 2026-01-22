"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface Author {
  id: number;
  name: string;
}

interface Artist {
  id: number;
  name: string;
}

interface Genre {
  id: number;
  name: string;
}

interface ComicFormEnhancedProps {
  authors?: Author[];
  artists?: Artist[];
  genres?: Genre[];
}

export function ComicFormEnhanced({
  authors = [],
  artists = [],
  genres = [],
}: ComicFormEnhancedProps) {
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);

  const toggleGenre = (genreId: number) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Comic</CardTitle>
        <CardDescription>Fill in the details to create a new comic</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" name="title" placeholder="Enter comic title" required />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter comic description"
              rows={4}
              required
            />
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image URL *</Label>
            <Input
              id="coverImage"
              name="coverImage"
              type="url"
              placeholder="https://example.com/cover.jpg"
              required
            />
            <p className="text-sm text-muted-foreground">Provide a URL to the cover image</p>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select defaultValue="Ongoing" name="status">
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ongoing">Ongoing</SelectItem>
                <SelectItem value="Hiatus">Hiatus</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Dropped">Dropped</SelectItem>
                <SelectItem value="Coming Soon">Coming Soon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Publication Date */}
          <div className="space-y-2">
            <Label htmlFor="publicationDate">Publication Date *</Label>
            <Input
              id="publicationDate"
              name="publicationDate"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label htmlFor="rating">Rating (0-10)</Label>
            <Input
              id="rating"
              name="rating"
              type="number"
              min="0"
              max="10"
              step="0.1"
              defaultValue="0"
            />
          </div>

          {/* Author Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="authorId">Author</Label>
            <Select name="authorId">
              <SelectTrigger>
                <SelectValue placeholder="Select an author" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No author</SelectItem>
                {authors.map((author) => (
                  <SelectItem key={author.id} value={String(author.id)}>
                    {author.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Artist Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="artistId">Artist</Label>
            <Select name="artistId">
              <SelectTrigger>
                <SelectValue placeholder="Select an artist" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No artist</SelectItem>
                {artists.map((artist) => (
                  <SelectItem key={artist.id} value={String(artist.id)}>
                    {artist.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Genre Multi-Select */}
          <div className="space-y-2">
            <Label>Genres</Label>
            <div
              className={`
                grid grid-cols-2 gap-3
                md:grid-cols-3
              `}
            >
              {genres.map((genre) => (
                <label key={genre.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name={`genre-${genre.id}`}
                    checked={selectedGenres.includes(genre.id)}
                    onChange={() => toggleGenre(genre.id)}
                    className="size-4 rounded-sm border-gray-300"
                  />
                  <span className="text-sm">{genre.name}</span>
                </label>
              ))}
            </div>
            {genres.length === 0 && (
              <p className="text-sm text-muted-foreground">No genres available</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button type="submit">Create Comic</Button>
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
