import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Clean up duplicate test data
export const removeDuplicateTestData = mutation({
  args: {
    babyId: v.id("babies"),
  },
  handler: async (ctx, args) => {
    // Get all data for this baby
    const [photos, journalEntries, firsts, growthLogs, milestoneEntries] = await Promise.all([
      ctx.db.query("photos")
        .withIndex("by_baby_date", q => q.eq("babyId", args.babyId))
        .collect(),
      ctx.db.query("journalEntries")
        .withIndex("by_baby_date", q => q.eq("babyId", args.babyId))
        .collect(),
      ctx.db.query("firsts")
        .withIndex("by_baby_date", q => q.eq("babyId", args.babyId))
        .collect(),
      ctx.db.query("growthLogs")
        .withIndex("by_baby_date", q => q.eq("babyId", args.babyId))
        .collect(),
      ctx.db.query("milestoneEntries")
        .withIndex("by_baby", q => q.eq("babyId", args.babyId))
        .collect(),
    ]);

    const deletedCount = {
      photos: 0,
      journalEntries: 0,
      firsts: 0,
      growthLogs: 0,
      milestoneEntries: 0,
    };

    // Remove duplicate photos (keep only the first one of each type)
    const seenPhotoCaptions = new Set<string>();
    for (const photo of photos) {
      const key = photo.caption || "birth";
      if (seenPhotoCaptions.has(key)) {
        await ctx.db.delete(photo._id);
        deletedCount.photos++;
      } else {
        seenPhotoCaptions.add(key);
      }
    }

    // Remove duplicate journal entries (keep only the first)
    if (journalEntries.length > 1) {
      for (let i = 1; i < journalEntries.length; i++) {
        await ctx.db.delete(journalEntries[i]._id);
        deletedCount.journalEntries++;
      }
    }

    // Remove duplicate firsts (keep only the first of each type)
    const seenFirstTypes = new Set<string>();
    for (const first of firsts) {
      if (seenFirstTypes.has(first.type)) {
        await ctx.db.delete(first._id);
        deletedCount.firsts++;
      } else {
        seenFirstTypes.add(first.type);
      }
    }

    // Remove duplicate growth logs (keep only the most recent)
    if (growthLogs.length > 1) {
      // Sort by date descending
      const sorted = growthLogs.sort((a, b) => b.date - a.date);
      for (let i = 1; i < sorted.length; i++) {
        await ctx.db.delete(sorted[i]._id);
        deletedCount.growthLogs++;
      }
    }

    // Remove duplicate milestone entries (keep only the first of each milestone)
    const seenMilestoneIds = new Set<string>();
    for (const entry of milestoneEntries) {
      if (seenMilestoneIds.has(entry.milestoneId)) {
        await ctx.db.delete(entry._id);
        deletedCount.milestoneEntries++;
      } else {
        seenMilestoneIds.add(entry.milestoneId);
      }
    }

    return {
      success: true,
      message: "Removed duplicate test data",
      deletedCount,
    };
  },
});

// Delete all data for a baby (useful for testing)
export const deleteAllDataForBaby = mutation({
  args: {
    babyId: v.id("babies"),
  },
  handler: async (ctx, args) => {
    // Get all data for this baby
    const [photos, journalEntries, firsts, growthLogs, milestoneEntries] = await Promise.all([
      ctx.db.query("photos")
        .withIndex("by_baby_date", q => q.eq("babyId", args.babyId))
        .collect(),
      ctx.db.query("journalEntries")
        .withIndex("by_baby_date", q => q.eq("babyId", args.babyId))
        .collect(),
      ctx.db.query("firsts")
        .withIndex("by_baby_date", q => q.eq("babyId", args.babyId))
        .collect(),
      ctx.db.query("growthLogs")
        .withIndex("by_baby_date", q => q.eq("babyId", args.babyId))
        .collect(),
      ctx.db.query("milestoneEntries")
        .withIndex("by_baby", q => q.eq("babyId", args.babyId))
        .collect(),
    ]);

    let deletedCount = 0;

    // Delete all photos
    for (const photo of photos) {
      await ctx.db.delete(photo._id);
      deletedCount++;
    }

    // Delete all journal entries
    for (const journal of journalEntries) {
      await ctx.db.delete(journal._id);
      deletedCount++;
    }

    // Delete all firsts
    for (const first of firsts) {
      await ctx.db.delete(first._id);
      deletedCount++;
    }

    // Delete all growth logs
    for (const growth of growthLogs) {
      await ctx.db.delete(growth._id);
      deletedCount++;
    }

    // Delete all milestone entries
    for (const milestone of milestoneEntries) {
      await ctx.db.delete(milestone._id);
      deletedCount++;
    }

    return {
      success: true,
      message: `Deleted ${deletedCount} entries for baby`,
      deletedCount,
    };
  },
});