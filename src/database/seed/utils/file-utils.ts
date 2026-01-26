/**
 * File Utilities for Seed Operations
 */

import { isImageFileName, normalizeImagePath } from "@/lib/image-path";
import fs from "fs/promises";
import path from "path";

export class FileUtils {
  /**
   * Read and parse a JSON file
   * @param filePath
   */
  async readJsonFile<T>(filePath: string): Promise<T> {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as T;
  }

  /**
   * Find files matching a glob pattern
   * @param pattern
   */
  async findJsonFiles(pattern: string): Promise<string[]> {
    try {
      // Handle exact file paths
      if (!pattern.includes("*")) {
        try {
          await fs.access(pattern);
          return [path.resolve(pattern)];
        } catch {
          return [];
        }
      }

      // Handle wildcard patterns
      const dir = path.dirname(pattern);
      const basePattern = path.basename(pattern);
      // Escape regex special chars, then convert wildcards '*' and '?' to regex equivalents
      const escapeForRegex = (s: string) => s.replaceAll(/[$()+.[\\\]^{|}]/g, "\\$&");
      const wildcardToRegex = escapeForRegex(basePattern)
        .replaceAll("\\*", ".*")
        .replaceAll("\\?", ".");
      const regex = new RegExp("^" + wildcardToRegex + "$");

      const files = await fs.readdir(dir);
      const matches = files
        .filter((file) => regex.test(file))
        .map((file) => path.resolve(dir, file));

      return matches;
    } catch (error) {
      console.warn(`Pattern ${pattern} matched no files:`, error);
      return [];
    }
  }

  /**
   * Read multiple JSON files and merge data
   * @param patterns
   */
  async readMultipleJsonFiles<T>(patterns: string[]): Promise<T[]> {
    const allData: T[] = [];

    for (const pattern of patterns) {
      const files = await this.findJsonFiles(pattern);

      for (const file of files) {
        try {
          const data = await this.readJsonFile<T | T[]>(file);
          // Normalize image path values in parsed data so next/image receives valid URLs
          const normalizeRecursively = (obj: any) => {
            if (obj === null || obj === undefined) return obj;
            if (Array.isArray(obj)) {
              obj.forEach((v, i) => (obj[i] = normalizeRecursively(v)));
              return obj;
            }
            if (typeof obj === "object") {
              for (const key of Object.keys(obj)) {
                const val = obj[key];
                if (typeof val === "string" && isImageFileName(val)) {
                  obj[key] = normalizeImagePath(val);
                } else if (typeof val === "string") {
                  // also normalize obvious relative paths that include 'public' or path separators
                  if (val.includes("public\\") || val.includes("public/") || val.includes("\\")) {
                    obj[key] = normalizeImagePath(val);
                  }
                } else if (typeof val === "object") {
                  normalizeRecursively(val);
                }
              }
              return obj;
            }
            return obj;
          };

          normalizeRecursively(data as any);
          if (Array.isArray(data)) {
            allData.push(...data);
          } else {
            allData.push(data);
          }
        } catch (error) {
          console.error(`Error reading file ${file}:`, error);
        }
      }
    }

    return allData;
  }
}

export const fileUtils = new FileUtils();
