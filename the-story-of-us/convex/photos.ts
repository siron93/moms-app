import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { validateBabyOwnership, getCurrentUserId } from "./lib/validation";

// Create a photo/video memory
export const createPhoto = mutation({
  args: {
    babyId: v.id("babies"),
    caption: v.optional(v.string()),
    mediaUrls: v.array(v.string()),
    mediaTypes: v.array(v.union(v.literal("image"), v.literal("video"))),
    localMediaPaths: v.optional(v.array(v.string())),
    date: v.number(),
    anonymousId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx.db, ctx.auth?.userId);

    // Validate ownership
    const isOwner = await validateBabyOwnership(
      ctx.db,
      args.babyId,
      userId,
      args.anonymousId
    );

    if (!isOwner) {
      throw new Error("You don't have permission to add photos to this baby profile");
    }

    return await ctx.db.insert("photos", {
      babyId: args.babyId,
      userId,
      anonymousId: !userId ? args.anonymousId : undefined,
      caption: args.caption,
      mediaUrls: args.mediaUrls,
      mediaTypes: args.mediaTypes,
      localMediaPaths: args.localMediaPaths,
      date: args.date,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update photo media URL after cloud upload
export const updatePhotoMediaUrl = mutation({
  args: {
    photoId: v.id("photos"),
    index: v.number(),
    cloudUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const photo = await ctx.db.get(args.photoId);
    if (!photo) throw new Error("Photo not found");

    const newMediaUrls = [...photo.mediaUrls];
    newMediaUrls[args.index] = args.cloudUrl;

    await ctx.db.patch(args.photoId, {
      mediaUrls: newMediaUrls,
      updatedAt: Date.now(),
    });
  },
});

// Get photos for a baby
export const getPhotosForBaby = query({
  args: {
    babyId: v.id("babies"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("photos")
      .withIndex("by_baby_date", q => q.eq("babyId", args.babyId))
      .order("desc")
      .collect();
  },
});

// Test data creation function
export const createTestPhoto = mutation({
  args: {
    babyId: v.id("babies"),
  },
  handler: async (ctx, args) => {
    // Get the baby to find the anonymous ID
    const baby = await ctx.db.get(args.babyId);
    
    return await ctx.db.insert("photos", {
      babyId: args.babyId,
      userId: undefined,
      anonymousId: baby?.anonymousId || "test-anonymous",
      caption: "Emma's first time at the beach! She loved the sand between her toes 🏖️",
      mediaUrls: ["https://images.pexels.com/photos/1556706/pexels-photo-1556706.jpeg?auto=compress&cs=tinysrgb&w=800"],
      mediaTypes: ["image"],
      localMediaPaths: undefined,
      date: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});