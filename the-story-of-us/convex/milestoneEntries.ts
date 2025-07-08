import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { validateBabyOwnership, getCurrentUserId } from "./lib/validation";

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

// Alias for backward compatibility
export const getMilestoneEntriesForBaby = query({
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
    const userId = await getCurrentUserId(ctx.db, ctx.auth?.userId);

    // Validate ownership before creating the entry
    const hasOwnership = await validateBabyOwnership(
      ctx.db,
      args.babyId,
      userId,
      args.anonymousId
    );

    if (!hasOwnership) {
      throw new Error("You don't have permission to create milestone entries for this baby");
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

    // Filter out null values for optional fields
    const data: any = {
      babyId: args.babyId,
      milestoneId: args.milestoneId,
      achievedDate: args.achievedDate,
      userId,
      anonymousId: !userId ? args.anonymousId : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    // Only add optional fields if they are not null
    if (args.notes) data.notes = args.notes;
    if (args.photoUrl && args.photoUrl !== null) data.photoUrl = args.photoUrl;
    if (args.photoLocalPath && args.photoLocalPath !== null) data.photoLocalPath = args.photoLocalPath;
    if (args.metadata) data.metadata = args.metadata;
    
    const entryId = await ctx.db.insert("milestoneEntries", data);

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
    anonymousId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { entryId, anonymousId, ...updates } = args;
    
    // Fetch the milestone entry first
    const entry = await ctx.db.get(entryId);
    if (!entry) throw new Error("Milestone entry not found");

    const userId = await getCurrentUserId(ctx.db, ctx.auth?.userId);

    // Validate ownership using the baby ID from the milestone entry
    const hasOwnership = await validateBabyOwnership(
      ctx.db,
      entry.babyId,
      userId,
      anonymousId || entry.anonymousId
    );

    if (!hasOwnership) {
      throw new Error("You don't have permission to update this milestone entry");
    }
    
    // Handle explicit undefined values for photo removal
    const patchData: any = {};
    
    if (args.achievedDate !== undefined) patchData.achievedDate = args.achievedDate;
    if (args.notes !== undefined) patchData.notes = args.notes;
    if (args.metadata !== undefined) patchData.metadata = args.metadata;
    
    // For photo fields, only include them if they have a non-null value
    // To clear a field, the client should pass null, and we'll exclude it from the patch
    if ('photoUrl' in args && args.photoUrl !== null) {
      patchData.photoUrl = args.photoUrl;
    }
    if ('photoLocalPath' in args && args.photoLocalPath !== null) {
      patchData.photoLocalPath = args.photoLocalPath;
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
    anonymousId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Fetch the milestone entry first
    const entry = await ctx.db.get(args.entryId);
    if (!entry) throw new Error("Milestone entry not found");

    const userId = await getCurrentUserId(ctx.db, ctx.auth?.userId);

    // Validate ownership using the baby ID from the milestone entry
    const hasOwnership = await validateBabyOwnership(
      ctx.db,
      entry.babyId,
      userId,
      args.anonymousId || entry.anonymousId
    );

    if (!hasOwnership) {
      throw new Error("You don't have permission to delete this milestone entry");
    }

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