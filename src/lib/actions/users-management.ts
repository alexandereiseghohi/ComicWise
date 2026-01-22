"use server";

import type { ActionResult } from "@/dto";

export interface UsersManagementDto {
  userId: string;
  role: string;
}

export async function deleteUserAdmin(userId: string): Promise<ActionResult> {
  return { success: true };
}

export async function createUserAdmin(data: any): Promise<ActionResult> {
  return { success: true };
}

export async function updateUserAdmin(userId: string, data: any): Promise<ActionResult> {
  return { success: true };
}
