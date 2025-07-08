import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { validateBabyOwnership, getCurrentUserId } from "./lib/validation";

// Create a "first" entry
export const createFirst = mutation({
  args: {
    babyId: v.id("babies"),
    type: v.string(), // "first_smile", "first_laugh", etc.
    title: v.string(),
    description: v.optional(v.string()),
    date: v.number(),
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
      throw new Error("You don't have permission to create entries for this baby");
    }

    return await ctx.db.insert("firsts", {
      babyId: args.babyId,
      userId,
      anonymousId: args.anonymousId,
      type: args.type,
      title: args.title,
      description: args.description,
      date: args.date,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update first entry
export const updateFirst = mutation({
  args: {
    firstId: v.id("firsts"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    anonymousId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const first = await ctx.db.get(args.firstId);
    if (!first) throw new Error("First entry not found");

    const userId = await getCurrentUserId(ctx.db, ctx.auth?.userId);

    // Validate ownership using the baby ID from the first entry
    const hasOwnership = await validateBabyOwnership(
      ctx.db,
      first.babyId,
      userId,
      args.anonymousId || first.anonymousId
    );

    if (!hasOwnership) {
      throw new Error("You don't have permission to update this first entry");
    }

    await ctx.db.patch(args.firstId, {
      ...(args.title !== undefined && { title: args.title }),
      ...(args.description !== undefined && { description: args.description }),
      updatedAt: Date.now(),
    });
  },
});

// Get firsts for a baby
export const getFirstsForBaby = query({
  args: {
    babyId: v.id("babies"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("firsts")
      .withIndex("by_baby_date", q => q.eq("babyId", args.babyId))
      .order("desc")
      .collect();
  },
});

// Test data creation function
export const createTestFirst = mutation({
  args: {
    babyId: v.id("babies"),
  },
  handler: async (ctx, args) => {
    // Get the baby to find the anonymous ID
    const baby = await ctx.db.get(args.babyId);
    
    return await ctx.db.insert("firsts", {
      babyId: args.babyId,
      userId: undefined,
      anonymousId: baby?.anonymousId || "test-anonymous",
      type: "first_laugh",
      title: "First Real Laugh",
      description: "Emma burst into the most beautiful giggles when daddy made funny faces during bath time. Her whole face lit up and we couldn't stop laughing with her!",
      date: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});