import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get milestone entries for a baby
export const getMilestoneEntries = query({
  args: {
    babyId: v.id("babies"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("milestoneEntries")
      .withIndex("by_baby", (q) => q.eq("babyId", args.babyId))
      .collect();
  },
});

// Create a milestone entry
export const createMilestoneEntry = mutation({
  args: {
    babyId: v.id("babies"),
    milestoneId: v.id("milestones"),
    achievedDate: v.number(),
    notes: v.optional(v.string()),
    photoUrl: v.optional(v.union(v.string(), v.null())),
    photoLocalPath: v.optional(v.union(v.string(), v.null())),
    metadata: v.optional(v.any()),
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

    // Check if milestone already logged for this baby
    const existing = await ctx.db
      .query("milestoneEntries")
      .withIndex("by_baby", (q) => q.eq("babyId", args.babyId))
      .filter((q) => q.eq(q.field("milestoneId"), args.milestoneId))
      .first();
    
    if (existing) {
      throw new Error("Milestone already logged for this baby");
    }

    const entryId = await ctx.db.insert("milestoneEntries", {
      ...args,
      userId,
      anonymousId: !userId ? args.anonymousId : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return entryId;
  },
});

// Update a milestone entry
export const updateMilestoneEntry = mutation({
  args: {
    entryId: v.id("milestoneEntries"),
    achievedDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    photoUrl: v.optional(v.union(v.string(), v.null())),
    photoLocalPath: v.optional(v.union(v.string(), v.null())),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { entryId, ...updates } = args;
    
    // Handle explicit undefined values for photo removal
    const patchData: any = {};
    
    if (args.achievedDate !== undefined) patchData.achievedDate = args.achievedDate;
    if (args.notes !== undefined) patchData.notes = args.notes;
    if (args.metadata !== undefined) patchData.metadata = args.metadata;
    
    // For photo fields, we need to handle null/undefined explicitly
    // When photoUrl is undefined, we want to set it to null to clear it
    if ('photoUrl' in args) {
      patchData.photoUrl = args.photoUrl === undefined ? null : args.photoUrl;
    }
    if ('photoLocalPath' in args) {
      patchData.photoLocalPath = args.photoLocalPath === undefined ? null : args.photoLocalPath;
    }
    
    patchData.updatedAt = Date.now();
    await ctx.db.patch(entryId, patchData);
    
    return entryId;
  },
});

// Delete a milestone entry
export const deleteMilestoneEntry = mutation({
  args: {
    entryId: v.id("milestoneEntries"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.entryId);
  },
});

// Test data creation function
export const createTestMilestoneEntry = mutation({
  args: {
    babyId: v.id("babies"),
  },
  handler: async (ctx, args) => {
    // Get the baby to find the anonymous ID
    const baby = await ctx.db.get(args.babyId);
    
    // Get the "First Word" milestone
    const firstWordMilestone = await ctx.db
      .query("milestones")
      .filter(q => q.eq(q.field("name"), "First Word"))
      .first();
      
    if (!firstWordMilestone) {
      throw new Error("First Word milestone not found");
    }

    return await ctx.db.insert("milestoneEntries", {
      babyId: args.babyId,
      milestoneId: firstWordMilestone._id,
      userId: undefined,
      anonymousId: baby?.anonymousId || "test-anonymous",
      achievedDate: Date.now() - 1000 * 60 * 60 * 24 * 1, // 1 day ago
      notes: "Emma said 'Mama' for the first time while reaching for me! My heart melted!",
      photoUrl: "https://images.pexels.com/photos/1648387/pexels-photo-1648387.jpeg?auto=compress&cs=tinysrgb&w=800",
      photoLocalPath: undefined,
      metadata: { word: "Mama" },
      createdAt: Date.now(),
    });
  },
});