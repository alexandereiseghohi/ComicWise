// ═══════════════════════════════════════════════════
// UTILITY TYPES - Commonly Used Type Helpers
// ═══════════════════════════════════════════════════
// Generic utility types for type transformations

// ═══════════════════════════════════════════════════
// NULL/UNDEFINED HELPERS
// ═══════════════════════════════════════════════════

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

// ═══════════════════════════════════════════════════
// OBJECT TRANSFORMATIONS
// ═══════════════════════════════════════════════════

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & object;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

// ═══════════════════════════════════════════════════
// PICK/OMIT VARIANTS
// ═══════════════════════════════════════════════════

export type StrictOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type StrictPick<T, K extends keyof T> = Pick<T, K>;

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type PickByValue<T, V> = Pick<T, { [K in keyof T]: T[K] extends V ? K : never }[keyof T]>;
export type OmitByValue<T, V> = Pick<T, { [K in keyof T]: T[K] extends V ? never : K }[keyof T]>;

// ═══════════════════════════════════════════════════
// KEY/VALUE EXTRACTION
// ═══════════════════════════════════════════════════

export type ValueOf<T> = T[keyof T];
export type KeysOfType<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];
export type NonNullableKeys<T> = { [K in keyof T]-?: NonNullable<T[K]> };

// ═══════════════════════════════════════════════════
// ARRAY HELPERS
// ═══════════════════════════════════════════════════

export type NonEmptyArray<T> = [T, ...T[]];
export type AtLeastOne<T> = [T, ...T[]];
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

// ═══════════════════════════════════════════════════
// PROMISE HELPERS
// ═══════════════════════════════════════════════════

export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

// ═══════════════════════════════════════════════════
// ADVANCED TYPE MANIPULATION
// ═══════════════════════════════════════════════════

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;
