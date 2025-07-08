import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { validateBabyOwnership, getCurrentUserId } from "./lib/validation";

// Get latest growth logs for a baby
export const getLatestGrowthLogs = query({
  args: {
    babyId: v.id("babies"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 30;
    
    const logs = await ctx.db
      .query("growthLogs")
      .withIndex("by_baby_date", (q) => q.eq("babyId", args.babyId))
      .order("desc")
      .take(limit);

    return logs;
  },
});

// Alias for backward compatibility
export const getGrowthLogsForBaby = query({
  args: {
    babyId: v.id("babies"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("growthLogs")
      .withIndex("by_baby_date", (q) => q.eq("babyId", args.babyId))
      .order("desc")
      .collect();
  },
});

// Create a new growth log
export const createGrowthLog = mutation({
  args: {
    babyId: v.id("babies"),
    date: v.number(),
    weight: v.optional(v.number()),
    weightUnit: v.optional(v.union(v.literal("lb"), v.literal("kg"))),
    height: v.optional(v.number()),
    heightUnit: v.optional(v.union(v.literal("in"), v.literal("cm"))),
    headCircumference: v.optional(v.number()),
    headUnit: v.optional(v.union(v.literal("in"), v.literal("cm"))),
    notes: v.optional(v.string()),
    anonymousId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx.db, ctx.auth?.userId);

    // Validate ownership before creating the entry
    const hasOwnership = await validateBabyOwnership(
      ctx.db,
      args.babyId,
      userId,
      args.anonymousId
    );

    if (!hasOwnership) {
      throw new Error("You don't have permission to create growth logs for this baby");
    }

    const logId = await ctx.db.insert("growthLogs", {
      ...args,
      userId,
      anonymousId: !userId ? args.anonymousId : undefined,
      createdAt: Date.now(),
    });

    return logId;
  },
});

// Test data creation function
export const createTestGrowthLog = mutation({
  args: {
    babyId: v.id("babies"),
  },
  handler: async (ctx, args) => {
    // Get the baby to find the anonymous ID
    const baby = await ctx.db.get(args.babyId);
    
    return await ctx.db.insert("growthLogs", {
      babyId: args.babyId,
      userId: undefined,
      anonymousId: baby?.anonymousId || "test-anonymous",
      date: Date.now() - 1000 * 60 * 60 * 24 * 4, // 4 days ago
      weight: 12.5,
      weightUnit: "lb",
      height: 24,
      heightUnit: "in",
      headCircumference: 16,
      headUnit: "in",
      notes: "Emma is growing beautifully! The doctor says she's right on track.",
      createdAt: Date.now(),
    });
  },
});