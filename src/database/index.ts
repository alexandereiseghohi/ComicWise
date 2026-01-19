// Central database entrypoint — provides convenient named exports for imports like `from "database"`

export * from "./db";
export * from "./schema";

// Re-export queries and mutations for easier access
export * as mutations from "./mutations";
export * as queries from "./queries";
