/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GLOBAL TYPE DEFINITIONS - ComicWise Project
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Comprehensive type definitions ensuring type safety and consistency
 * across the entire codebase.
 *
 * version 1.0.0
 * author ComicWise Team
 * license MIT
 */

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL NAMESPACE AUGMENTATIONS
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// REACT & COMPONENT TYPES
// ═══════════════════════════════════════════════════════════════════════════

import type {
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  ElementType,
  ReactNode,
} from "react";

declare global {
  // Extend Window interface for browser globals
  interface Window {
    __INITIAL_DATA__?: unknown;
    __THEME__?: "light" | "dark" | "system";
    gtag?(command: string, ...arguments_: unknown[]): void;
    dataLayer?: unknown[];
  }

  // Node.js global types
  namespace NodeJS {
    interface ProcessEnvironment {
      // Database
      DATABASE_URL: string;
      NEON_DATABASE_URL?: string;

      // Authentication
      AUTH_SECRET: string;
      AUTH_URL: string;
      AUTH_GOOGLE_CLIENT_ID?: string;
      AUTH_GOOGLE_CLIENT_SECRET?: string;
      AUTH_GITHUB_CLIENT_ID?: string;
      AUTH_GITHUB_CLIENT_SECRET?: string;

      // Upload Services
      UPLOAD_PROVIDER?: "imagekit" | "cloudinary" | "local" | "aws";
      IMAGEKIT_PUBLIC_KEY?: string;
      IMAGEKIT_PRIVATE_KEY?: string;
      IMAGEKIT_URL_ENDPOINT?: string;
      CLOUDINARY_CLOUD_NAME?: string;
      CLOUDINARY_API_KEY?: string;
      CLOUDINARY_API_SECRET?: string;
      AWS_REGION?: string;
      AWS_ACCESS_KEY_ID?: string;
      AWS_SECRET_ACCESS_KEY?: string;
      AWS_S3_BUCKET_NAME?: string;

      // Email
      EMAIL_SERVER_HOST?: string;
      EMAIL_SERVER_PORT?: string;
      EMAIL_SERVER_USER?: string;
      EMAIL_SERVER_PASSWORD?: string;
      EMAIL_FROM?: string;
      EMAIL_SECURE?: string;

      // Background Jobs
      QSTASH_TOKEN?: string;
      QSTASH_CURRENT_SIGNING_KEY?: string;
      QSTASH_NEXT_SIGNING_KEY?: string;
      QSTASH_URL?: string;

      // Redis
      REDIS_HOST?: string;
      REDIS_PORT?: string;
      REDIS_PASSWORD?: string;
      REDIS_DB?: string;
      REDIS_URL?: string;
      REDIS_TLS_ENABLED?: string;
      UPSTASH_REDIS_REST_URL?: string;
      UPSTASH_REDIS_REST_TOKEN?: string;

      // Application
      NODE_ENV: "development" | "production" | "test";
      PORT?: string;
      NEXT_PUBLIC_APP_URL?: string;
      CUSTOM_PASSWORD?: string;
    }

    interface Global {
      prisma: unknown;
      db: unknown;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY TYPES - SUPPLEMENTARY ONLY
// ═══════════════════════════════════════════════════════════════════════════
// NOTE: Import core utilities from './Utility' instead

/**
 * Get all values of an object type
 */
export type ValueOf<T> = T[keyof T];

/**
 * Get all keys of an object type as a union
 */
export type KeyOf<T> = keyof T;

/**
 * Extract entries type from object
 */
export type Entries<T> = { [K in keyof T]: [K, T[K]] }[keyof T][];

/**
 * Async function return type extractor
 */
export type AsyncReturnType<T extends (...arguments_: never[]) => Promise<unknown>> = T extends (
  ...arguments_: never[]
) => Promise<infer R>
  ? R
  : never;

/**
 * Awaited type - Unwrap Promise
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * Non-empty array type
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * At least one element array
 */
export type AtLeastOne<T> = [T, ...T[]];

/**
 * Exact type matching
 */
export type Exact<T, Shape> = T extends Shape
  ? Exclude<keyof T, keyof Shape> extends never
    ? T
    : never
  : never;

/**
 * Pick required properties
 */
export type PickRequired<T> = {
  [K in keyof T as T[K] extends Required<T>[K] ? K : never]: T[K];
};

/**
 * Pick optional properties
 */
export type PickOptional<T> = {
  [K in keyof T as T[K] extends Required<T>[K] ? never : K]: T[K];
};

/**
 * Mutable type - Remove readonly
 */
export type Mutable<T> = { -readonly [P in keyof T]: T[P] };

/**
 * Deep mutable - Remove readonly recursively
 */
export type DeepMutable<T> = T extends object ? { -readonly [P in keyof T]: DeepMutable<T[P]> } : T;

/**
 * Primitive types
 */
export type Primitive = string | number | boolean | null | undefined | symbol | bigint;

/**
 * Built-in types
 */
export type Builtin = Primitive | Date | RegExp | Error | Function;

/**
 * JSON-serializable types
 */
export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
export interface JsonObject {
  [key: string]: JsonValue;
}
export interface JsonArray extends Array<JsonValue> {}

/**
 * Make specific keys required
 */
export type RequiredKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Make specific keys optional
 */
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Replace property type
 */
export type Replace<T, K extends keyof T, V> = Omit<T, K> & { [P in K]: V };

/**
 * Union to intersection
 */
export type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

/**
 * Base component props with className and children
 */
export interface BaseComponentProperties {
  className?: string;
  children?: ReactNode;
}

/**
 * Polymorphic component props
 */
export type PolymorphicComponentProps<E extends ElementType, P = { Poly }> = P &
  Omit<ComponentPropsWithoutRef<E>, keyof P> & {
    as?: E;
  };

/**
 * Polymorphic component with ref
 */
export type PolymorphicComponentPropsWithRef<E extends ElementType, P = { Ploy }> = P &
  Omit<ComponentPropsWithRef<E>, keyof P> & {
    as?: E;
  };

/**
 * Component with children
 */
export interface WithChildren {
  children?: ReactNode;
}

/**
 * Component with className
 */
export interface WithClassName {
  className?: string;
}

/**
 * Component with both children and className
 */
export interface ComponentProperties extends WithChildren, WithClassName {}

/**
 * Async component type
 */
export type AsyncComponent<P = { "" }> = (properties: P) => Promise<ReactNode>;

/**
 * Server component type
 */
export type ServerComponent<P = { "" }> = (properties: P) => ReactNode | Promise<ReactNode>;

// ═══════════════════════════════════════════════════════════════════════════
// FORM & INPUT TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Select option type
 */
export interface SelectOption<T = string | number> {
  label: string;
  value: T;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  group?: string;
}

/**
 * File upload result
 */
export interface FileUploadResult {
  url: string;
  publicId?: string;
  filename: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  provider?: "imagekit" | "cloudinary" | "local" | "aws";
  metadata?: Record<string, unknown>;
}

/**
 * Image upload options
 */
export interface ImageUploadOptions {
  folder?: string;
  filename?: string;
  maxSize?: number;
  allowedTypes?: string[];
  transformation?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
    crop?: string;
    [key: string]: unknown;
  };
}

/**
 * Form field configuration
 */
export interface FormFieldConfig {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "textarea"
    | "select"
    | "checkbox"
    | "radio"
    | "file"
    | "date"
    | "number"
    | "url"
    | "tel"
    | "time"
    | "datetime-local"
    | "color"
    | "range"
    | "search"
    | "month"
    | "week";
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  options?: SelectOption[];
  validation?: Record<string, unknown>;
  defaultValue?: unknown;
  description?: string;
  autoComplete?: string;
}

/**
 * Form validation error
 */
export interface FormValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Form state
 */
export interface FormState<T = unknown> {
  values: T;
  errors: Record<string, string[]>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
  touched: Record<string, boolean>;
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVER ACTION & API TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Server action state
 */
export interface ActionState<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  errors?: Record<string, string[]>;
  timestamp?: Date;
}

/**
 * Server action response
 */
export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  errors?: Record<string, string[]>;
  redirect?: string;
  metadata?: Record<string, unknown>;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
    stack?: string;
  };
  message?: string;
  pagination?: PaginationInfo;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    stack?: string;
  };
  timestamp: string;
}

/**
 * Server action function type
 */
export type ServerAction<T = unknown, R = unknown> = (data: T) => Promise<ActionState<R>>;

/**
 * Server action with FormData
 */
export type ServerActionWithFormData<R = unknown> = (formData: FormData) => Promise<ActionState<R>>;

/**
 * API handler function type
 */
export type ApiHandler<T = unknown, R = unknown> = (
  request: Request,
  context?: T
) => Promise<Response | ApiResponse<R>>;

// ═══════════════════════════════════════════════════════════════════════════
// PAGINATION & LISTING TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Pagination information
 */
export interface PaginationInfo {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  startIndex: number;
  endIndex: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

/**
 * Cursor-based pagination info
 */
export interface CursorPaginationInfo {
  total: number;
  cursor?: string;
  nextCursor?: string;
  prevCursor?: string;
  hasMore: boolean;
  limit: number;
}

/**
 * Cursor-based paginated response
 */
export interface CursorPaginatedResponse<T> {
  data: T[];
  pagination: CursorPaginationInfo;
}

/**
 * List query options
 */
export interface ListOptions {
  limit?: number;
  offset?: number;
  cursor?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: Record<string, unknown>;
}

/**
 * Sort option
 */
export interface SortOption {
  field: string;
  order: "asc" | "desc";
  label?: string;
}

/**
 * Filter option
 */
export interface FilterOption {
  field: string;
  value: unknown;
  operator?: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "like";
  label?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION & ROUTING TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Navigation item
 */
export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  external?: boolean;
  badge?: string | number;
  description?: string;
  children?: NavItem[];
  roles?: string[];
  active?: boolean;
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  title: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

/**
 * Route configuration
 */
export interface RouteConfig {
  path: string;
  component: React.ComponentType<Record<string, unknown>>;
  protected?: boolean;
  roles?: string[];
  layout?: "default" | "admin" | "auth" | "minimal";
  metadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

/**
 * Link props with active state
 */
export interface ActiveLinkProperties {
  href: string;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
  exact?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// TABLE & DATA DISPLAY TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Data table column definition
 */
export interface DataTableColumn<T> {
  id: string;
  header: string | React.ComponentType;
  accessorKey?: keyof T | string;
  cell?(row: T): ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  align?: "left" | "center" | "right";
  sticky?: boolean;
  hidden?: boolean;
}

/**
 * Data table props
 */
export interface DataTableProperties<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  error?: string;
  pagination?: PaginationInfo;
  sorting?: SortOption[];
  filters?: FilterOption[];
  onSort?(column: string, order: "asc" | "desc"): void;
  onFilter?(filters: FilterOption[]): void;
  onPageChange?(page: number): void;
  rowKey?: keyof T | ((row: T) => string | number);
  selectable?: boolean;
  onRowClick?(row: T): void;
  emptyState?: ReactNode;
}

// ═══════════════════════════════════════════════════════════════════════════
// THEME & STYLING TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Theme mode
 */
export type ThemeMode = "light" | "dark" | "system";

/**
 * Theme colors
 */
export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  radius: string;
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  mode: ThemeMode;
  colors: ThemeColors;
  fonts: {
    sans: string;
    mono: string;
    serif: string;
  };
  animations: {
    enabled: boolean;
    duration: "fast" | "normal" | "slow";
  };
  reducedMotion: boolean;
}

/**
 * CSS variable
 */
export type CSSVariable = `--${string}`;

/**
 * Tailwind class
 */
export type TailwindClass = string;

/**
 * Class value (for cn utility)
 */
export type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | ClassValue[]
  | Record<string, boolean | undefined | null>;

// ═══════════════════════════════════════════════════════════════════════════
// UPLOAD & MEDIA TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Upload provider type
 */
export type UploadProvider = "imagekit" | "cloudinary" | "local" | "aws";

/**
 * Upload service result
 */
export interface UploadServiceResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
  metadata?: {
    width?: number;
    height?: number;
    format?: string;
    size?: number;
    provider?: UploadProvider;
  };
}

/**
 * Bulk upload options
 */
export interface BulkUploadOptions extends ImageUploadOptions {
  files: File[];
  onProgress?(progress: number, fileName: string): void;
  onComplete?(results: UploadServiceResult[]): void;
  onError?(error: Error, fileName: string): void;
  concurrent?: number;
}

/**
 * Image transformation options
 */
export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "jpg" | "png" | "webp" | "avif" | "gif";
  crop?: "scale" | "fit" | "fill" | "limit" | "pad";
  gravity?: "center" | "north" | "south" | "east" | "west" | "auto" | "face";
  blur?: number;
  sharpen?: number;
  rotate?: number;
  flip?: "horizontal" | "vertical" | "both";
  grayscale?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// EMAIL TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Email template data
 */
export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

/**
 * Send email options
 */
export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: EmailAttachment[];
  headers?: Record<string, string>;
  priority?: "high" | "normal" | "low";
}

/**
 * Email attachment
 */
export interface EmailAttachment {
  filename: string;
  content?: Buffer | string;
  path?: string;
  contentType?: string;
  cid?: string;
  encoding?: string;
}

/**
 * Email send result
 */
export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  response?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// CACHE & QUEUE TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Cache options
 */
export interface CacheOptions {
  ttl?: number;
  tags?: string[];
  revalidate?: number;
}

/**
 * Cache key builder
 */
export type CacheKey = string | string[] | Record<string, unknown>;

/**
 * Queue job data
 */
export interface QueueJobData {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  priority?: number;
  delay?: number;
  attempts?: number;
  timestamp: Date;
}

/**
 * Queue job result
 */
export interface QueueJobResult {
  success: boolean;
  data?: unknown;
  error?: string;
  duration?: number;
}

/**
 * Queue options
 */
export interface QueueOptions {
  priority?: number;
  delay?: number;
  attempts?: number;
  backoff?: {
    type: "fixed" | "exponential";
    delay: number;
  };
  removeOnComplete?: boolean;
  removeOnFail?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// SEARCH & FILTER TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Search query
 */
export interface SearchQuery {
  q: string;
  filters?: Record<string, unknown>;
  sort?: SortOption[];
  limit?: number;
  offset?: number;
  facets?: string[];
}

/**
 * Search result
 */
export interface SearchResult<T> {
  hits: T[];
  total: number;
  facets?: Record<string, SearchFacet[]>;
  query: string;
  executionTime?: number;
}

/**
 * Search facet
 */
export interface SearchFacet {
  value: string;
  count: number;
  selected?: boolean;
}

/**
 * Full-text search options
 */
export interface FullTextSearchOptions {
  query: string;
  fields?: string[];
  fuzzy?: boolean;
  prefix?: boolean;
  weights?: Record<string, number>;
  limit?: number;
  offset?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// ANALYTICS & TRACKING TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Analytics event
 */
export interface AnalyticsEvent {
  name: string;
  category?: string;
  label?: string;
  value?: number;
  properties?: Record<string, unknown>;
  timestamp?: Date;
}

/**
 * Page view event
 */
export interface PageViewEvent {
  path: string;
  title?: string;
  referrer?: string;
  properties?: Record<string, unknown>;
}

/**
 * User tracking data
 */
export interface UserTrackingData {
  userId?: string;
  sessionId?: string;
  device?: string;
  browser?: string;
  os?: string;
  country?: string;
  language?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validation rule
 */
export interface ValidationRule<T = unknown> {
  validator(value: T): boolean | Promise<boolean>;
  message: string;
  code?: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
  value?: unknown;
}

/**
 * Schema validation
 */
export interface SchemaValidation<T> {
  schema: unknown;
  data: T;
  options?: {
    abortEarly?: boolean;
    stripUnknown?: boolean;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * App configuration
 */
export interface AppConfig {
  name: string;
  description: string;
  url: string;
  version: string;
  env: {
    isProduction: boolean;
    isDevelopment: boolean;
    isTest: boolean;
    current: "development" | "production" | "test";
  };
  features: Record<string, boolean>;
}

/**
 * Database configuration
 */
export interface DatabaseConfig {
  url: string;
  neonUrl?: string;
  pooling: boolean;
  ssl?: boolean;
  maxConnections?: number;
}

/**
 * Auth configuration
 */
export interface AuthConfig {
  secret: string;
  url: string;
  sessionMaxAge: number;
  providers: {
    credentials: boolean;
    google: boolean;
    github: boolean;
  };
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  requests: number;
  window: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// ERROR TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * App error
 */
export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
  isOperational?: boolean;
}

/**
 * Error with context
 */
export interface ErrorWithContext extends Error {
  context?: Record<string, unknown>;
  timestamp?: Date;
  userId?: string;
}

/**
 * API error
 */
export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
  stack?: string;
}
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & object;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT ALL TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type {
  ActionResponse,
  // API types
  ActionState,
  ActiveLinkProperties as ActiveLinkProps,
  // Analytics types
  AnalyticsEvent,
  ApiError,
  ApiErrorResponse,
  ApiHandler,
  ApiResponse,
  // Config types
  AppConfig,
  // Error types
  AppError,
  AsyncComponent,
  AsyncReturnType,
  AtLeastOne,
  AuthConfig,
  Awaited,
  // Component types
  BaseComponentProperties as BaseComponentProps,
  BreadcrumbItem,
  Builtin,
  BulkUploadOptions,
  CacheKey,
  // Cache types
  CacheOptions,
  ClassValue,
  ComponentProperties as ComponentProps,
  CSSVariable,
  CursorPaginatedResponse,
  CursorPaginationInfo,
  DatabaseConfig,
  // Table types
  DataTableColumn,
  DataTableProperties as DataTableProps,
  DeepMutable,
  DeepPartial,
  DeepRequired,
  EmailAttachment,
  EmailSendResult,
  // Email types
  EmailTemplate,
  Entries,
  ErrorWithContext,
  Exact,
  FileUploadResult,
  FilterOption,
  FormFieldConfig,
  FormState,
  FormValidationError,
  FullTextSearchOptions,
  ImageTransformOptions,
  ImageUploadOptions,
  JsonArray,
  JsonObject,
  JsonValue,
  KeyOf,
  ListOptions,
  Maybe,
  Mutable,
  // Navigation types
  NavItem,
  NonEmptyArray,
  // Utility types
  Nullable,
  Optional,
  OptionalKeys,
  PageViewEvent,
  PaginatedResponse,
  // Pagination types
  PaginationInfo,
  PickOptional,
  PickRequired,
  PolymorphicComponentProps,
  PolymorphicComponentPropsWithRef,
  Prettify,
  Primitive,
  QueueJobData,
  QueueJobResult,
  QueueOptions,
  RateLimitConfig,
  Replace,
  RequiredKeys,
  RouteConfig,
  SchemaValidation,
  SearchFacet,
  // Search types
  SearchQuery,
  SearchResult,
  // Form types
  SelectOption,
  SendEmailOptions,
  ServerAction,
  ServerActionWithFormData,
  ServerComponent,
  SortOption,
  TailwindClass,
  ThemeColors,
  ThemeConfig,
  // Theme types
  ThemeMode,
  UnionToIntersection,
  // Upload types
  UploadProvider,
  UploadServiceResult,
  UserTrackingData,
  ValidationError,
  ValidationResult,
  // Validation types
  ValidationRule,
  ValueOf,
  WithChildren,
  WithClassName,
};

export {};
