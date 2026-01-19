// ═══════════════════════════════════════════════════
// COMPONENT TYPES - React Component Prop Types
// ═══════════════════════════════════════════════════

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

// ═══════════════════════════════════════════════════
// BASE COMPONENT PROPS
// ═══════════════════════════════════════════════════

export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

export interface BaseButtonProps extends BaseComponentProps {
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?(): void;
}

export interface BaseInputProps extends BaseComponentProps {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  onChange?(value: string): void;
}

// ═══════════════════════════════════════════════════
// LAYOUT COMPONENT PROPS
// ═══════════════════════════════════════════════════

export interface PageProps<T = Record<string, unknown>> {
  params: T;
  searchParams?: Record<string, string | string[] | undefined>;
}

export interface LayoutProps {
  children: ReactNode;
  params?: Record<string, string>;
}

export interface ErrorProps {
  error: Error & { digest?: string };
  reset(): void;
}

// ═══════════════════════════════════════════════════
// CARD COMPONENT PROPS
// ═══════════════════════════════════════════════════

export interface CardProps extends BaseComponentProps {
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  footer?: ReactNode;
  onClick?(): void;
  href?: string;
}

// ═══════════════════════════════════════════════════
// TABLE COMPONENT PROPS
// ═══════════════════════════════════════════════════

export interface TableColumn<T = unknown> {
  key: string;
  label: string;
  sortable?: boolean;
  render?(value: unknown, row: T): ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
}

export interface TableProps<T = unknown> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?(row: T): void;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?(column: string): void;
}

// ═══════════════════════════════════════════════════
// FORM COMPONENT PROPS
// ═══════════════════════════════════════════════════

export interface FormFieldProps extends BaseInputProps {
  label?: string;
  error?: string;
  helperText?: string;
}

export interface FormProps extends BaseComponentProps {
  onSubmit(data: FormData): void | Promise<void>;
  loading?: boolean;
  error?: string;
  success?: boolean;
}

// ═══════════════════════════════════════════════════
// MODAL/DIALOG COMPONENT PROPS
// ═══════════════════════════════════════════════════

export interface ModalProps extends BaseComponentProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  title?: string;
  description?: string;
  footer?: ReactNode;
}

export interface DialogProps extends ModalProps {
  showClose?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
}

// ═══════════════════════════════════════════════════
// PAGINATION COMPONENT PROPS
// ═══════════════════════════════════════════════════

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange(page: number): void;
  onPageSizeChange?(size: number): void;
}

// ═══════════════════════════════════════════════════
// SEARCH COMPONENT PROPS
// ═══════════════════════════════════════════════════

export interface SearchProps {
  value: string;
  onChange(value: string): void;
  placeholder?: string;
  debounce?: number;
  loading?: boolean;
  onSearch?(value: string): void;
}

// ═══════════════════════════════════════════════════
// FILTER COMPONENT PROPS
// ═══════════════════════════════════════════════════

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterProps {
  options: FilterOption[];
  value?: string | string[];
  onChange(value: string | string[]): void;
  label?: string;
  multiple?: boolean;
  searchable?: boolean;
}

// ═══════════════════════════════════════════════════
// IMAGE COMPONENT PROPS
// ═══════════════════════════════════════════════════

export interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  loading?: "lazy" | "eager";
  onLoad?(): void;
  onError?(): void;
}

// ═══════════════════════════════════════════════════
// POLYMORPHIC COMPONENT PROPS
// ═══════════════════════════════════════════════════

export type PolymorphicComponentProps<E extends ElementType> = ComponentPropsWithoutRef<E> & {
  as?: E;
};

// ═══════════════════════════════════════════════════
// COMIC-SPECIFIC COMPONENT PROPS
// ═══════════════════════════════════════════════════

export interface ComicCardProps {
  id: number;
  title: string;
  slug: string;
  coverImage: string;
  description?: string;
  rating?: number;
  views?: number;
  status?: string;
  author?: string;
  artist?: string;
  genres?: string[];
  onClick?(): void;
}

export interface ChapterListProps {
  chapters: Array<{
    id: number;
    title: string;
    slug: string;
    chapterNumber: number;
    releaseDate: Date | string;
    views?: number;
  }>;
  comicId: number;
  onChapterClick?(chapterId: number): void;
}

export interface ChapterReaderProps {
  chapterId: number;
  images: Array<{
    id: number;
    imageUrl: string;
    pageNumber: number;
  }>;
  currentPage?: number;
  onPageChange?(page: number): void;
}

export interface BookmarkButtonProps {
  comicId: number;
  isBookmarked?: boolean;
  onToggle?(bookmarked: boolean): void;
}

export interface CommentListProps {
  comments: Array<{
    id: number;
    content: string;
    userId: string;
    userName?: string;
    userImage?: string;
    createdAt: Date | string;
  }>;
  onReply?(commentId: number): void;
  onDelete?(commentId: number): void;
  onEdit?(commentId: number, content: string): void;
}

export interface ReadingProgressProps {
  comicId: number;
  chapterId: number;
  progress: number;
  totalPages: number;
  currentPage: number;
}
