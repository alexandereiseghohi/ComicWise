// ═══════════════════════════════════════════════════
// CORE TYPES - Application-wide Core Types
// ═══════════════════════════════════════════════════
// Only fundamental types that are truly core to the application

// Base entity interfaces
export interface BaseEntity {
  id: number | string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TimestampedEntity extends BaseEntity {
  createdAt: Date;
  updatedAt: Date;
}

// Async/Sync types
export type AsyncResult<T> = Promise<T>;
export type SyncOrAsync<T> = T | Promise<T>;

// Array helpers
export type ValueOrArray<T> = T | T[];

// Readonly utilities
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Key type utilities
export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];
