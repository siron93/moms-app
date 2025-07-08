import { DatabaseReader } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export async function validateBabyOwnership(
  db: DatabaseReader,
  babyId: Id<"babies">,
  userId?: Id<"users">,
  anonymousId?: string
): Promise<boolean> {
  const baby = await db.get(babyId);
  
  if (!baby) {
    throw new Error("Baby not found");
  }

  // If user is authenticated, check if they own the baby
  if (userId) {
    return baby.userId === userId;
  }

  // For anonymous users, check if the anonymous ID matches
  if (anonymousId && baby.anonymousId) {
    return baby.anonymousId === anonymousId;
  }

  // If neither authenticated nor anonymous ID provided, deny access
  return false;
}

export async function getCurrentUserId(
  db: DatabaseReader,
  authUserId?: string | null
): Promise<Id<"users"> | undefined> {
  if (!authUserId) return undefined;
  
  const user = await db
    .query("users")
    .withIndex("by_clerk", q => q.eq("clerkId", authUserId))
    .first();
    
  return user?._id;
}