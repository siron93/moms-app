import { v } from "convex/values";
import { query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

const ITEMS_PER_PAGE = 20;

// Timeline item structure
type TimelineItem = {
  _id: string;
  _creationTime: number;
  babyId: Id<"babies">;
  userId?: Id<"users">;
  anonymousId?: string;
  type: "photo" | "video" | "journal" | "milestone" | "first" | "growth";
  title?: string;
  content?: string;
  mediaUrl?: string;
  mediaUrls?: string[];
  mediaType?: "image" | "video";
  mediaTypes?: ("image" | "video")[];
  localMediaPaths?: string[];
  milestoneId?: Id<"milestones">;
  firstType?: string;
  tags: string[];
  date: number;
  createdAt: number;
  updatedAt: number;
  growthLogId?: Id<"growthLogs">;
  // Growth measurements
  weight?: number;
  weightUnit?: string;
  height?: number;
  heightUnit?: string;
  headCircumference?: number;
  headCircumferenceUnit?: string;
  // For milestones
  metadata?: any;
  localMediaPath?: string;
};

// Fixed pagination query
export const getTimelinePaginated = query({
  args: {
    babyId: v.id("babies"),
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
    // Support for Convex's usePaginatedQuery
    paginationOpts: v.optional(v.object({
      cursor: v.union(v.null(), v.string()),
      id: v.number(),
      numItems: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    // Handle both old and new formats
    const cursorString = args.paginationOpts?.cursor || args.cursor;
    const requestedLimit = args.paginationOpts?.numItems || args.limit || ITEMS_PER_PAGE;
    const limit = Math.min(requestedLimit, 50);
    
    // Parse cursor to get skip count
    let skipCount = 0;
    if (cursorString) {
      try {
        skipCount = parseInt(cursorString, 10);
      } catch {
        skipCount = 0;
      }
    }

    // Get baby for birth date check
    const baby = await ctx.db.get(args.babyId);
    if (!baby) {
      return args.paginationOpts 
        ? { page: [], continueCursor: null, isDone: true }
        : { items: [], nextCursor: undefined, hasMore: false };
    }
    
    const birthDate = baby.birthDate;

    // Fetch ALL data from all tables (we'll sort and paginate in memory)
    const [photos, journalEntries, firsts, growthLogs, milestoneEntries] = await Promise.all([
      ctx.db.query("photos")
        .withIndex("by_baby_date", q => q.eq("babyId", args.babyId))
        .order("desc")
        .collect(),
      ctx.db.query("journalEntries")
        .withIndex("by_baby_date", q => q.eq("babyId", args.babyId))
        .order("desc")
        .collect(),
      ctx.db.query("firsts")
        .withIndex("by_baby_date", q => q.eq("babyId", args.babyId))
        .order("desc")
        .collect(),
      ctx.db.query("growthLogs")
        .withIndex("by_baby_date", q => q.eq("babyId", args.babyId))
        .order("desc")
        .collect(),
      ctx.db.query("milestoneEntries")
        .withIndex("by_baby_date", q => q.eq("babyId", args.babyId))
        .order("desc")
        .collect(),
    ]);

    // Get milestones for reference
    const milestoneIds = new Set(milestoneEntries.map(m => m.milestoneId));
    const milestones = milestoneIds.size > 0 
      ? await ctx.db.query("milestones")
          .filter(q => q.or(...Array.from(milestoneIds).map(id => q.eq(q.field("_id"), id))))
          .collect()
      : [];
    const milestonesById = new Map(milestones.map(m => [m._id, m]));

    // Transform all items into timeline format
    const allItems: TimelineItem[] = [];

    // Transform photos
    photos.forEach(photo => {
      const isBirthAnnouncement = Math.abs(photo.date - birthDate) < 1000 * 60 * 60 * 24;
      allItems.push({
        _id: photo._id,
        _creationTime: photo._creationTime,
        babyId: photo.babyId,
        userId: photo.userId,
        anonymousId: photo.anonymousId,
        type: "photo",
        title: isBirthAnnouncement ? "Welcome to the world" : undefined,
        content: photo.caption,
        mediaUrl: photo.mediaUrls?.[0],
        mediaUrls: photo.mediaUrls,
        mediaTypes: photo.mediaTypes,
        localMediaPaths: photo.localMediaPaths,
        tags: isBirthAnnouncement ? ["birth"] : [],
        date: photo.date,
        createdAt: photo.createdAt,
        updatedAt: photo.updatedAt || photo.createdAt,
      });
    });

    // Transform journal entries
    journalEntries.forEach(journal => {
      allItems.push({
        _id: journal._id,
        _creationTime: journal._creationTime,
        babyId: journal.babyId,
        userId: journal.userId,
        anonymousId: journal.anonymousId,
        type: "journal",
        title: journal.title,
        content: journal.content,
        tags: [],
        date: journal.date,
        createdAt: journal.createdAt,
        updatedAt: journal.updatedAt || journal.createdAt,
      });
    });

    // Transform firsts
    firsts.forEach(first => {
      allItems.push({
        _id: first._id,
        _creationTime: first._creationTime,
        babyId: first.babyId,
        userId: first.userId,
        anonymousId: first.anonymousId,
        type: "first",
        title: first.title,
        content: first.description,
        firstType: first.type,
        tags: [],
        date: first.date,
        createdAt: first.createdAt,
        updatedAt: first.updatedAt || first.createdAt,
      });
    });

    // Transform growth logs
    growthLogs.forEach(growth => {
      allItems.push({
        _id: growth._id,
        _creationTime: growth._creationTime,
        babyId: growth.babyId,
        userId: growth.userId,
        anonymousId: growth.anonymousId,
        type: "growth",
        title: "Growth Update",
        content: growth.notes,
        tags: [],
        date: growth.date,
        createdAt: growth.createdAt,
        updatedAt: growth.createdAt,
        growthLogId: growth._id,
        weight: growth.weight,
        weightUnit: growth.weightUnit,
        height: growth.height,
        heightUnit: growth.heightUnit,
        headCircumference: growth.headCircumference,
        headCircumferenceUnit: growth.headUnit,
      });
    });

    // Transform milestone entries
    milestoneEntries.forEach(entry => {
      // milestone data is not needed here, just for reference lookup
      allItems.push({
        _id: entry._id,
        _creationTime: entry._creationTime,
        babyId: entry.babyId,
        userId: entry.userId,
        anonymousId: entry.anonymousId,
        type: "milestone",
        content: entry.notes,
        mediaUrl: entry.photoUrl,
        localMediaPath: entry.photoLocalPath,
        milestoneId: entry.milestoneId,
        metadata: entry.metadata,
        tags: [],
        date: entry.achievedDate,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt || entry.createdAt,
      });
    });

    // Sort ALL items by date descending, then by ID for stability
    allItems.sort((a, b) => {
      if (b.date !== a.date) return b.date - a.date;
      return b._id.localeCompare(a._id); // Stable sort by ID
    });

    // Apply pagination using skip/limit
    const paginatedItems = allItems.slice(skipCount, skipCount + limit);
    const hasMore = allItems.length > skipCount + limit;
    const nextCursor = hasMore ? String(skipCount + limit) : undefined;

    // Return format depends on whether this is called by usePaginatedQuery
    if (args.paginationOpts) {
      return {
        page: paginatedItems,
        continueCursor: nextCursor || null,
        isDone: !hasMore,
      };
    } else {
      return {
        items: paginatedItems,
        nextCursor,
        hasMore,
      };
    }
  },
});

// Get ALL timeline items for a baby (for local-first caching if needed)
export const getAllTimelineItems = query({
  args: {
    babyId: v.id("babies"),
  },
  handler: async (ctx, args) => {
    // Get baby for birth date check
    const baby = await ctx.db.get(args.babyId);
    if (!baby) {
      return [];
    }
    
    const birthDate = baby.birthDate;

    // Fetch ALL data from all tables
    const [photos, journalEntries, firsts, growthLogs, milestoneEntries] = await Promise.all([
      ctx.db.query("photos")
        .withIndex("by_baby_date", q => q.eq("babyId", args.babyId))
        .order("desc")
        .collect(),
      ctx.db.query("journalEntries")
        .withIndex("by_baby_date", q => q.eq("babyId", args.babyId))
        .order("desc")
        .collect(),
      ctx.db.query("firsts")
        .withIndex("by_baby_date", q => q.eq("babyId", args.babyId))
        .order("desc")
        .collect(),
      ctx.db.query("growthLogs")
        .withIndex("by_baby_date", q => q.eq("babyId", args.babyId))
        .order("desc")
        .collect(),
      ctx.db.query("milestoneEntries")
        .withIndex("by_baby_date", q => q.eq("babyId", args.babyId))
        .order("desc")
        .collect(),
    ]);

    // Transform all items into timeline format
    const allItems: TimelineItem[] = [];

    // Transform photos
    photos.forEach(photo => {
      const isBirthAnnouncement = Math.abs(photo.date - birthDate) < 1000 * 60 * 60 * 24;
      allItems.push({
        _id: photo._id,
        _creationTime: photo._creationTime,
        babyId: photo.babyId,
        userId: photo.userId,
        anonymousId: photo.anonymousId,
        type: "photo",
        title: isBirthAnnouncement ? "Welcome to the world" : undefined,
        content: photo.caption,
        mediaUrl: photo.mediaUrls?.[0],
        mediaUrls: photo.mediaUrls,
        mediaTypes: photo.mediaTypes,
        localMediaPaths: photo.localMediaPaths,
        tags: isBirthAnnouncement ? ["birth"] : [],
        date: photo.date,
        createdAt: photo.createdAt,
        updatedAt: photo.updatedAt || photo.createdAt,
      });
    });

    // Transform other types similarly...
    journalEntries.forEach(journal => {
      allItems.push({
        _id: journal._id,
        _creationTime: journal._creationTime,
        babyId: journal.babyId,
        userId: journal.userId,
        anonymousId: journal.anonymousId,
        type: "journal",
        title: journal.title,
        content: journal.content,
        tags: [],
        date: journal.date,
        createdAt: journal.createdAt,
        updatedAt: journal.updatedAt || journal.createdAt,
      });
    });

    firsts.forEach(first => {
      allItems.push({
        _id: first._id,
        _creationTime: first._creationTime,
        babyId: first.babyId,
        userId: first.userId,
        anonymousId: first.anonymousId,
        type: "first",
        title: first.title,
        content: first.description,
        firstType: first.type,
        tags: [],
        date: first.date,
        createdAt: first.createdAt,
        updatedAt: first.updatedAt || first.createdAt,
      });
    });

    growthLogs.forEach(growth => {
      allItems.push({
        _id: growth._id,
        _creationTime: growth._creationTime,
        babyId: growth.babyId,
        userId: growth.userId,
        anonymousId: growth.anonymousId,
        type: "growth",
        title: "Growth Update",
        content: growth.notes,
        tags: [],
        date: growth.date,
        createdAt: growth.createdAt,
        updatedAt: growth.createdAt,
        growthLogId: growth._id,
        weight: growth.weight,
        weightUnit: growth.weightUnit,
        height: growth.height,
        heightUnit: growth.heightUnit,
        headCircumference: growth.headCircumference,
        headCircumferenceUnit: growth.headUnit,
      });
    });

    milestoneEntries.forEach(entry => {
      allItems.push({
        _id: entry._id,
        _creationTime: entry._creationTime,
        babyId: entry.babyId,
        userId: entry.userId,
        anonymousId: entry.anonymousId,
        type: "milestone",
        content: entry.notes,
        mediaUrl: entry.photoUrl,
        localMediaPath: entry.photoLocalPath,
        milestoneId: entry.milestoneId,
        metadata: entry.metadata,
        tags: [],
        date: entry.achievedDate,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt || entry.createdAt,
      });
    });

    // Sort ALL items by date descending, then by ID for stability
    allItems.sort((a, b) => {
      if (b.date !== a.date) return b.date - a.date;
      return b._id.localeCompare(a._id);
    });

    return allItems;
  },
});