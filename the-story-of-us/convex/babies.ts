import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

// Create a new baby profile
export const createBaby = mutation({
  args: {
    name: v.string(),
    birthDate: v.number(),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"), v.literal("other"))),
    profilePictureUrl: v.optional(v.string()),
    anonymousId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    // Get user if authenticated
    let userId = undefined;
    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
        .unique();
      userId = user?._id;
    }

    const babyId = await ctx.db.insert("babies", {
      userId,
      anonymousId: !userId ? args.anonymousId : undefined,
      name: args.name,
      birthDate: args.birthDate,
      gender: args.gender,
      profilePictureUrl: args.profilePictureUrl,
      createdAt: Date.now(),
    });

    return babyId;
  },
});

// Get all babies for current user (or anonymous ID)
export const getBabies = query({
  args: {
    anonymousId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    let babies: Doc<"babies">[] = [];
    
    if (identity) {
      // Get user
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
        .unique();
      
      if (user) {
        // Get babies by userId
        babies = await ctx.db
          .query("babies")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();
      }
    } else if (args.anonymousId) {
      // Get babies by anonymousId
      babies = await ctx.db
        .query("babies")
        .withIndex("by_anonymous", (q) => q.eq("anonymousId", args.anonymousId))
        .collect();
    }

    return babies;
  },
});

// Update baby profile
export const updateBaby = mutation({
  args: {
    babyId: v.id("babies"),
    name: v.optional(v.string()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"), v.literal("other"))),
    profilePictureUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { babyId, ...updates } = args;
    
    await ctx.db.patch(babyId, updates);
    
    return babyId;
  },
});

// Get a single baby by ID
export const getBaby = query({
  args: {
    babyId: v.id("babies"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.babyId);
  },
});