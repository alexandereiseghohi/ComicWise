/**
 * File Utilities for Seed Operations
 */

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
      const regex = new RegExp("^" + basePattern.replaceAll("*", ".*").replaceAll("?", ".") + "$");

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
