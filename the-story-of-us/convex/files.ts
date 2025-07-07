import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate upload URL for a file
export const generateUploadUrl = mutation(async (ctx) => {
  // Generate a short-lived upload URL
  return await ctx.storage.generateUploadUrl();
});

// Store file reference after upload
export const storeFileUrl = mutation({
  args: {
    storageId: v.string(),
    format: v.optional(v.string()),
    type: v.optional(v.union(v.literal("image"), v.literal("video"))),
  },
  handler: async (ctx, args) => {
    // Get the file URL from storage
    const url = await ctx.storage.getUrl(args.storageId);
    
    return {
      storageId: args.storageId,
      url: url,
      type: args.type,
      format: args.format,
    };
  },
});

// Get file URL by storage ID
export const getFileUrl = query({
  args: {
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Delete file from storage
export const deleteFile = mutation({
  args: {
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
  },
});