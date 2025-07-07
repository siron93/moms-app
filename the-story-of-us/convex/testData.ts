import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Create all test data for a baby
export const createAllTestData = mutation({
  args: {
    babyId: v.id("babies"),
  },
  handler: async (ctx, args) => {
    const results = [];
    
    try {
      // 1. Create a photo memory (2 days ago)
      const photoId = await ctx.runMutation(api.photos.createTestPhoto, {
        babyId: args.babyId,
      });
      results.push({ type: "photo", id: photoId });
      
      // 2. Create a journal entry (3 days ago)  
      const journalId = await ctx.runMutation(api.journalEntries.createTestJournalEntry, {
        babyId: args.babyId,
      });
      results.push({ type: "journal", id: journalId });
      
      // 3. Create a first (5 days ago)
      const firstId = await ctx.runMutation(api.firsts.createTestFirst, {
        babyId: args.babyId,
      });
      results.push({ type: "first", id: firstId });
      
      // 4. Create a growth log (4 days ago)
      const growthId = await ctx.runMutation(api.growthLogs.createTestGrowthLog, {
        babyId: args.babyId,
      });
      results.push({ type: "growth", id: growthId });
      
      // 5. Create a milestone entry (1 day ago)
      const milestoneId = await ctx.runMutation(api.milestoneEntries.createTestMilestoneEntry, {
        babyId: args.babyId,
      });
      results.push({ type: "milestone", id: milestoneId });
      
      // 6. Create a birth announcement photo (baby's birth date)
      const baby = await ctx.db.get(args.babyId);
      if (baby) {
        const birthPhotoId = await ctx.db.insert("photos", {
          babyId: args.babyId,
          userId: undefined,
          anonymousId: baby.anonymousId || "test-anonymous",
          caption: undefined,
          mediaUrls: ["https://images.pexels.com/photos/1391487/pexels-photo-1391487.jpeg?auto=compress&cs=tinysrgb&w=800"],
          mediaTypes: ["image"],
          localMediaPaths: undefined,
          date: baby.birthDate,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        results.push({ type: "birth", id: birthPhotoId });
      }
      
      return {
        success: true,
        message: "Created all test data successfully",
        results,
      };
    } catch (error) {
      console.error("Error creating test data:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        results,
      };
    }
  },
});