/**
 * Artists DTOs
 * Data Transfer Objects for artist operations
 */

import type { artist } from "@/database/schema";

export type ArtistDto = typeof artist.$inferSelect;
export type CreateArtistDto = typeof artist.$inferInsert;
export type UpdateArtistDto = Partial<CreateArtistDto>;

export interface ArtistListDto {
  artists: ArtistDto[];
  total: number;
  page: number;
  limit: number;
}

export type ArtistWithComicsDto = ArtistDto & {
  comics?: Array<{
    id: number;
    title: string;
    slug: string;
    coverImage: string;
  }>;
};

export { deleteArtist, updateArtist } from "@/lib/actions/artists";
