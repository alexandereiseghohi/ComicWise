/**
 * Client-safe configuration that can be imported in both Client and Server Components
 */

const nodeEnv = process.env["NODE_ENV"] || "development";

export const isProduction = nodeEnv === "production";
export const isDevelopment = nodeEnv === "development";
export const isTest = nodeEnv === "test";
