import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

// Create a new memory
export const createMemory = mutation({
  args: {
    babyId: v.id("babies"),
    type: v.union(
      v.literal("photo"),
      v.literal("video"),
      v.literal("journal"),
      v.literal("milestone"),
      v.literal("first"),
      v.literal("growth")
    ),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    mediaUrl: v.optional(v.string()),
    mediaUrls: v.optional(v.array(v.string())),
    mediaType: v.optional(v.union(v.literal("image"), v.literal("video"))),
    mediaTypes: v.optional(v.array(v.union(v.literal("image"), v.literal("video")))),
    localMediaPaths: v.optional(v.array(v.string())),
    milestoneId: v.optional(v.id("milestones")),
    firstType: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    date: v.number(),
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

    // Set primary media fields from arrays
    const memoryData = {
      ...args,
      userId,
      anonymousId: !userId ? args.anonymousId : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    // If arrays are provided, also set the primary fields
    if (args.mediaUrls && args.mediaUrls.length > 0) {
      memoryData.mediaUrl = args.mediaUrls[0];
    }
    if (args.mediaTypes && args.mediaTypes.length > 0) {
      memoryData.mediaType = args.mediaTypes[0];
    }

    const memoryId = await ctx.db.insert("memories", memoryData);
    return memoryId;
  },
});

// Get memories for a baby
export const getMemories = query({
  args: {
    babyId: v.id("babies"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    
    const memories = await ctx.db
      .query("memories")
      .withIndex("by_baby_date", (q) => q.eq("babyId", args.babyId))
      .order("desc")
      .take(limit);

    return {
      memories,
      hasMore: memories.length === limit,
    };
  },
});

// Get memories by type
export const getMemoriesByType = query({
  args: {
    babyId: v.id("babies"),
    type: v.union(
      v.literal("photo"),
      v.literal("video"),
      v.literal("journal"),
      v.literal("milestone"),
      v.literal("first"),
      v.literal("growth")
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    
    const memories = await ctx.db
      .query("memories")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .filter((q) => q.eq(q.field("babyId"), args.babyId))
      .order("desc")
      .take(limit);

    return memories;
  },
});

// Update a memory
export const updateMemory = mutation({
  args: {
    memoryId: v.id("memories"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    date: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { memoryId, ...updates } = args;
    
    await ctx.db.patch(memoryId, {
      ...updates,
      updatedAt: Date.now(),
    });
    
    return memoryId;
  },
});

// Delete a memory
export const deleteMemory = mutation({
  args: {
    memoryId: v.id("memories"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.memoryId);
  },
});

// Update specific media URL after background upload
export const updateMemoryMediaUrl = mutation({
  args: {
    memoryId: v.id("memories"),
    index: v.number(),
    cloudUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const memory = await ctx.db.get(args.memoryId);
    if (!memory) {
      throw new Error("Memory not found");
    }

    const mediaUrls = memory.mediaUrls || [];
    if (args.index >= 0 && args.index < mediaUrls.length) {
      mediaUrls[args.index] = args.cloudUrl;
      
      await ctx.db.patch(args.memoryId, {
        mediaUrls,
        updatedAt: Date.now(),
      });
    }
  },
});

// Update memory for milestone changes
export const updateMemoryForMilestone = mutation({
  args: {
    milestoneId: v.id("milestones"),
    babyId: v.id("babies"),
    content: v.optional(v.string()),
    date: v.optional(v.number()),
    mediaUrl: v.optional(v.union(v.string(), v.null())),
    localMediaPaths: v.optional(v.union(v.array(v.string()), v.null())),
  },
  handler: async (ctx, args) => {
    // Find the memory associated with this milestone
    const memory = await ctx.db
      .query("memories")
      .withIndex("by_baby_date", (q) => q.eq("babyId", args.babyId))
      .filter((q) => 
        q.and(
          q.eq(q.field("type"), "milestone"),
          q.eq(q.field("milestoneId"), args.milestoneId)
        )
      )
      .first();

    if (memory) {
      // Update the existing memory
      const updates: any = {
        updatedAt: Date.now(),
      };

      if (args.content !== undefined) updates.content = args.content;
      if (args.date !== undefined) updates.date = args.date;
      if ('mediaUrl' in args) {
        updates.mediaUrl = args.mediaUrl === undefined ? null : args.mediaUrl;
        updates.mediaUrls = args.mediaUrl ? [args.mediaUrl] : null;
      }
      if ('localMediaPaths' in args) {
        updates.localMediaPaths = args.localMediaPaths === undefined || (args.localMediaPaths && args.localMediaPaths.length === 0) ? null : args.localMediaPaths;
      }

      await ctx.db.patch(memory._id, updates);
      return memory._id;
    } else {
      // No memory exists for this milestone - create one
      const identity = await ctx.auth.getUserIdentity();
      let userId = undefined;
      if (identity) {
        const user = await ctx.db
          .query("users")
          .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
          .unique();
        userId = user?._id;
      }
      
      // Get milestone for baby ID
      const milestone = await ctx.db.get(args.milestoneId);
      if (!milestone) return null;
      
      const memoryId = await ctx.db.insert("memories", {
        babyId: args.babyId,
        type: "milestone",
        milestoneId: args.milestoneId,
        content: args.content || "",
        date: args.date || Date.now(),
        mediaUrl: args.mediaUrl || null,
        mediaUrls: args.mediaUrl ? [args.mediaUrl] : null,
        localMediaPaths: args.localMediaPaths && args.localMediaPaths.length > 0 ? args.localMediaPaths : null,
        userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      return memoryId;
    }
  },
});