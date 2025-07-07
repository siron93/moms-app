import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

// Create or update user from Clerk
export const upsertFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      createdAt: Date.now(),
    });
  },
});

// Migrate anonymous data to authenticated user
export const migrateAnonymousData = mutation({
  args: {
    anonymousId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get or create user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Update user with anonymousId for tracking
    await ctx.db.patch(user._id, { anonymousId: args.anonymousId });

    // Migrate babies
    const babies = await ctx.db
      .query("babies")
      .withIndex("by_anonymous", (q) => q.eq("anonymousId", args.anonymousId))
      .collect();

    for (const baby of babies) {
      await ctx.db.patch(baby._id, {
        userId: user._id,
        anonymousId: undefined,
      });
    }

    // Get all baby IDs for memory migration
    const babyIds = babies.map(b => b._id);

    // Migrate memories
    const memories = await ctx.db
      .query("memories")
      .withIndex("by_anonymous", (q) => q.eq("anonymousId", args.anonymousId))
      .collect();

    for (const memory of memories) {
      if (babyIds.includes(memory.babyId)) {
        await ctx.db.patch(memory._id, {
          userId: user._id,
          anonymousId: undefined,
        });
      }
    }

    // Migrate milestone entries
    const milestoneEntries = await ctx.db
      .query("milestoneEntries")
      .withIndex("by_anonymous", (q) => q.eq("anonymousId", args.anonymousId))
      .collect();

    for (const entry of milestoneEntries) {
      if (babyIds.includes(entry.babyId)) {
        await ctx.db.patch(entry._id, {
          userId: user._id,
          anonymousId: undefined,
        });
      }
    }

    // Migrate feeding logs
    const feedingLogs = await ctx.db
      .query("feedingLogs")
      .withIndex("by_anonymous", (q) => q.eq("anonymousId", args.anonymousId))
      .collect();

    for (const log of feedingLogs) {
      if (babyIds.includes(log.babyId)) {
        await ctx.db.patch(log._id, {
          userId: user._id,
          anonymousId: undefined,
        });
      }
    }

    // Migrate sleep logs
    const sleepLogs = await ctx.db
      .query("sleepLogs")
      .withIndex("by_anonymous", (q) => q.eq("anonymousId", args.anonymousId))
      .collect();

    for (const log of sleepLogs) {
      if (babyIds.includes(log.babyId)) {
        await ctx.db.patch(log._id, {
          userId: user._id,
          anonymousId: undefined,
        });
      }
    }

    // Migrate diaper logs
    const diaperLogs = await ctx.db
      .query("diaperLogs")
      .withIndex("by_anonymous", (q) => q.eq("anonymousId", args.anonymousId))
      .collect();

    for (const log of diaperLogs) {
      if (babyIds.includes(log.babyId)) {
        await ctx.db.patch(log._id, {
          userId: user._id,
          anonymousId: undefined,
        });
      }
    }

    // Migrate growth logs
    const growthLogs = await ctx.db
      .query("growthLogs")
      .withIndex("by_anonymous", (q) => q.eq("anonymousId", args.anonymousId))
      .collect();

    for (const log of growthLogs) {
      if (babyIds.includes(log.babyId)) {
        await ctx.db.patch(log._id, {
          userId: user._id,
          anonymousId: undefined,
        });
      }
    }

    // Migrate sanctuary progress
    const sanctuaryProgress = await ctx.db
      .query("userSanctuaryProgress")
      .withIndex("by_anonymous", (q) => q.eq("anonymousId", args.anonymousId))
      .collect();

    for (const progress of sanctuaryProgress) {
      await ctx.db.patch(progress._id, {
        userId: user._id,
        anonymousId: undefined,
      });
    }

    return { migrated: true, babyCount: babies.length };
  },
});

// Get current user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});