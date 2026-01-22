/**
 * Users DTOs
 * Data Transfer Objects for user operations
 */

import type { user } from "@/database/schema";

export type UserDto = typeof user.$inferSelect;
export type CreateUserDto = typeof user.$inferInsert;
export type UpdateUserDto = Partial<CreateUserDto>;

export interface UserListDto {
  users: UserDto[];
  total: number;
  page: number;
  limit: number;
}

export type UserWithBookmarksDto = UserDto & {
  bookmarks?: Array<{
    comicId: number;
    lastReadChapterId?: number | null;
    createdAt: Date;
  }>;
};

export type SafeUserDto = Omit<UserDto, "password">;

export {
  deleteUserAdmin as deleteUser,
  createUserAdmin as registerUser,
  updateUserAdmin as updateUser,
} from "@/lib/actions/users-management";
