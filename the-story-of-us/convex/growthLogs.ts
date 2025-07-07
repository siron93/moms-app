import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
    const identity = await ctx.auth.getUserIdentity();
    
    let userId = undefined;
    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
        .unique();
      userId = user?._id;
    }

    const logId = await ctx.db.insert("growthLogs", {
      ...args,
      userId,
      anonymousId: !userId ? args.anonymousId : undefined,
      createdAt: Date.now(),
    });

    // Also create a memory for this growth update
    await ctx.db.insert("memories", {
      babyId: args.babyId,
      userId,
      anonymousId: !userId ? args.anonymousId : undefined,
      type: "growth",
      title: "Growth Update",
      date: args.date,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return logId;
  },
});