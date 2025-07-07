import { v } from "convex/values";
import { query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Unified timeline query that merges all content types
export const getTimelineForBaby = query({
  args: {
    babyId: v.id("babies"),
  },
  handler: async (ctx, args) => {
    // Get all content from different tables
    const [photos, journalEntries, firsts, growthLogs, milestoneEntries] = await Promise.all([
      ctx.db.query("photos")
        .withIndex("by_baby_date", q => q.eq("babyId", args.babyId))
        .order("desc")
        .take(100),
      ctx.db.query("journalEntries")
        .withIndex("by_baby_date", q => q.eq("babyId", args.babyId))
        .order("desc")
        .take(100),
      ctx.db.query("firsts")
        .withIndex("by_baby_date", q => q.eq("babyId", args.babyId))
        .order("desc")
        .take(100),
      ctx.db.query("growthLogs")
        .withIndex("by_baby_date", q => q.eq("babyId", args.babyId))
        .order("desc")
        .take(100),
      ctx.db.query("milestoneEntries")
        .withIndex("by_baby_date", q => q.eq("babyId", args.babyId))
        .order("desc")
        .take(100),
    ]);

    // Get all milestones for reference
    const milestones = await ctx.db.query("milestones").collect();
    const milestonesById = new Map(milestones.map(m => [m._id, m]));

    // Transform each type into a common timeline format that matches Doc<"memories">
    const timelineItems: any[] = [];

    // Get baby for birth date check
    const baby = await ctx.db.get(args.babyId);
    const birthDate = baby?.birthDate || 0;

    // Transform photos
    for (const photo of photos) {
      // Check if this is a birth announcement (photo on birth date)
      const isBirthAnnouncement = Math.abs(photo.date - birthDate) < 1000 * 60 * 60 * 24; // Within 24 hours
      
      timelineItems.push({
        _id: photo._id,
        _creationTime: photo._creationTime,
        babyId: photo.babyId,
        userId: photo.userId,
        anonymousId: photo.anonymousId,
        type: "photo" as const,
        title: isBirthAnnouncement ? "Welcome to the world" : undefined,
        content: photo.caption,
        mediaUrl: photo.mediaUrls[0], // For backward compatibility
        mediaUrls: photo.mediaUrls,
        mediaType: photo.mediaTypes[0] as "image" | "video",
        mediaTypes: photo.mediaTypes,
        localMediaPaths: photo.localMediaPaths,
        milestoneId: undefined,
        firstType: undefined,
        tags: isBirthAnnouncement ? ["birth"] : [],
        date: photo.date,
        createdAt: photo.createdAt,
        updatedAt: photo.updatedAt,
      });
    }

    // Transform journal entries
    for (const journal of journalEntries) {
      timelineItems.push({
        _id: journal._id,
        _creationTime: journal._creationTime,
        babyId: journal.babyId,
        userId: journal.userId,
        anonymousId: journal.anonymousId,
        type: "journal" as const,
        title: journal.title,
        content: journal.content,
        mediaUrl: undefined,
        mediaUrls: undefined,
        mediaType: undefined,
        mediaTypes: undefined,
        localMediaPaths: undefined,
        milestoneId: undefined,
        firstType: undefined,
        tags: [],
        date: journal.date,
        createdAt: journal.createdAt,
        updatedAt: journal.updatedAt,
      });
    }

    // Transform firsts
    for (const first of firsts) {
      timelineItems.push({
        _id: first._id,
        _creationTime: first._creationTime,
        babyId: first.babyId,
        userId: first.userId,
        anonymousId: first.anonymousId,
        type: "first" as const,
        title: first.title,
        content: first.description,
        mediaUrl: undefined,
        mediaUrls: undefined,
        mediaType: undefined,
        mediaTypes: undefined,
        localMediaPaths: undefined,
        milestoneId: undefined,
        firstType: first.type,
        tags: [],
        date: first.date,
        createdAt: first.createdAt,
        updatedAt: first.updatedAt,
      });
    }

    // Transform growth logs
    for (const growth of growthLogs) {
      timelineItems.push({
        _id: growth._id,
        _creationTime: growth._creationTime,
        babyId: growth.babyId,
        userId: growth.userId,
        anonymousId: growth.anonymousId,
        type: "growth" as const,
        title: "Growth Update",
        content: growth.notes,
        mediaUrl: undefined,
        mediaUrls: undefined,
        mediaType: undefined,
        mediaTypes: undefined,
        localMediaPaths: undefined,
        milestoneId: undefined,
        firstType: undefined,
        tags: [],
        date: growth.date,
        createdAt: growth.createdAt,
        updatedAt: growth.createdAt, // growthLogs doesn't have updatedAt
        growthLogId: growth._id, // Add this to link to the growth log
      });
    }

    // Transform milestone entries
    for (const milestoneEntry of milestoneEntries) {
      const milestone = milestonesById.get(milestoneEntry.milestoneId);
      if (!milestone) continue;

      timelineItems.push({
        _id: milestoneEntry._id,
        _creationTime: milestoneEntry._creationTime,
        babyId: milestoneEntry.babyId,
        userId: milestoneEntry.userId,
        anonymousId: milestoneEntry.anonymousId,
        type: "milestone" as const,
        title: milestone.name,
        content: milestoneEntry.notes,
        mediaUrl: milestoneEntry.photoUrl,
        mediaUrls: milestoneEntry.photoUrl ? [milestoneEntry.photoUrl] : undefined,
        mediaType: milestoneEntry.photoUrl ? "image" as const : undefined,
        mediaTypes: milestoneEntry.photoUrl ? ["image" as const] : undefined,
        localMediaPaths: milestoneEntry.photoLocalPath ? [milestoneEntry.photoLocalPath] : undefined,
        milestoneId: milestoneEntry.milestoneId,
        firstType: undefined,
        tags: [],
        date: milestoneEntry.achievedDate,
        createdAt: milestoneEntry.createdAt,
        updatedAt: milestoneEntry.createdAt, // milestoneEntries doesn't have updatedAt
      });
    }

    // Sort all items by date (newest first)
    timelineItems.sort((a, b) => b.date - a.date);

    // Return with additional data
    return {
      memories: timelineItems,
      milestones,
      milestoneEntries,
      growthLogs,
    };
  },
});