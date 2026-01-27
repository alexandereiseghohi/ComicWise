export type ComicDTOStatus = "draft" | "published" | "archived";

export interface ComicCreateDTO {
  title: string;
  slug?: string;
  description?: string;
  authorId?: string;
  tags?: string[];
  status?: ComicDTOStatus;
}

export interface ComicUpdateDTO extends Partial<ComicCreateDTO> {}

export interface ComicReadDTO {
  id: string;
  title: string;
  slug: string;
  description?: string;
  authorId?: string;
  tags: string[];
  status: ComicDTOStatus;
  createdAt: string; // ISO timestamp
  updatedAt?: string; // ISO timestamp
}
