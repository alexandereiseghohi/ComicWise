import { db as database } from "@/database/db";
import { user } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function createUser(data: {
  email: string;
  name?: string;
  password?: string;
  image?: string;
  role?: "user" | "admin" | "moderator";
}): Promise<typeof user.$inferSelect | undefined> {
  const [newUser] = await database
    .insert(user)
    .values({
      email: data.email,
      name: data.name,
      password: data.password,
      image: data.image,
      role: data.role ?? "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
  return newUser;
}

export async function updateUser(
  userId: string,
  data: {
    name?: string;
    email?: string;
    image?: string | null;
    role?: "user" | "admin" | "moderator";
    emailVerified?: Date;
  }
): Promise<typeof user.$inferSelect | undefined> {
  const cleanData = {
    ...(data.name !== undefined && { name: data.name }),
    ...(data.email !== undefined && { email: data.email }),
    ...(data.image !== undefined && { image: data.image || null }),
    ...(data.role !== undefined && { role: data.role }),
    ...(data.emailVerified !== undefined && { emailVerified: data.emailVerified }),
    updatedAt: new Date(),
  };
  const [updatedUser] = await database
    .update(user)
    .set(cleanData)
    .where(eq(user.id, userId))
    .returning();
  return updatedUser;
}

export async function updateUserPassword(
  userId: string,
  password: string
): Promise<typeof user.$inferSelect | undefined> {
  const [updatedUser] = await database
    .update(user)
    .set({
      password,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId))
    .returning();
  return updatedUser;
}

export async function deleteUser(userId: string): Promise<typeof user.$inferSelect | undefined> {
  const [deletedUser] = await database.delete(user).where(eq(user.id, userId)).returning();
  return deletedUser;
}

export async function verifyUserEmail(
  userId: string
): Promise<typeof user.$inferSelect | undefined> {
  const [updatedUser] = await database
    .update(user)
    .set({
      emailVerified: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId))
    .returning();
  return updatedUser;
}
