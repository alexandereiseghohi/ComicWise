/**
 * Authentication DTOs
 * Data Transfer Objects for authentication operations
 */

import type { user } from "@/database/schema";

export type UserDto = typeof user.$inferSelect;
export type CreateUserDto = typeof user.$inferInsert;
export type UpdateUserDto = Partial<CreateUserDto>;

export interface SignInDto {
  email: string;
  password: string;
}

export interface SignUpDto {
  email: string;
  password: string;
  name?: string;
}

export interface VerifyEmailDto {
  token: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

export interface RequestPasswordResetDto {
  email: string;
}

export interface AuthResponseDto {
  success: boolean;
  message?: string;
  user?: UserDto;
  error?: string;
}

export interface SessionDto {
  user: UserDto;
  expires: string;
}
