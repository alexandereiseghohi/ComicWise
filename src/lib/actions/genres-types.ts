"use server";

import type { ActionResult } from "@/dto";

export async function getAllGenres(): Promise<ActionResult> {
  return { success: true, data: [] };
}

export async function getAllTypes(): Promise<ActionResult> {
  return { success: true, data: [] };
}

export async function deleteGenre(id: number): Promise<ActionResult> {
  return { success: true };
}

export async function updateGenre(id: number, data: any): Promise<ActionResult> {
  return { success: true };
}

export async function deleteType(id: number): Promise<ActionResult> {
  return { success: true };
}

export async function updateType(id: number, data: any): Promise<ActionResult> {
  return { success: true };
}
