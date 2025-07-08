import { v } from "convex/values";
import { query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

const ITEMS_PER_PAGE = 20;

// Type for timeline items
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
};

// Cursor for pagination - tracks last seen item from each table
type Cursor = {
  // Last item's date and ID for proper ordering
  lastDate: number;
  lastId: string;
  // Track which items we've already seen to prevent duplicates
  seenIds: string[];
};

// Paginated timeline query - accepts both old format and Convex pagination format
export const getTimelinePaginated = query({
  args: {
    babyId: v.id("babies"),
    cursor: v.optional(v.string()), // Base64 encoded cursor
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
    let cursor: Cursor | null = null;
    
    if (cursorString) {
      try {
        // Use atob for base64 decoding in Convex runtime
        cursor = JSON.parse(atob(cursorString));
      } catch {
        throw new Error("Invalid cursor");
      }
    }

    // Get baby for birth date check
    const baby = await ctx.db.get(args.babyId);
    const birthDate = baby?.birthDate || 0;

    // Build queries with cursor support
    const photoQuery = ctx.db.query("photos")
      .withIndex("by_baby_date", q => q.eq("babyId", args.babyId));
    const journalQuery = ctx.db.query("journalEntries")
      .withIndex("by_baby_date", q => q.eq("babyId", args.babyId));
    const firstsQuery = ctx.db.query("firsts")
      .withIndex("by_baby_date", q => q.eq("babyId", args.babyId));
    const growthQuery = ctx.db.query("growthLogs")
      .withIndex("by_baby_date", q => q.eq("babyId", args.babyId));
    const milestoneQuery = ctx.db.query("milestoneEntries")
      .withIndex("by_baby_date", q => q.eq("babyId", args.babyId));

    // Fetch more than needed to find the right cutoff point
    const fetchLimit = limit + 10;
    
    const [photos, journalEntries, firsts, growthLogs, milestoneEntries] = await Promise.all([
      photoQuery.order("desc").take(fetchLimit),
      journalQuery.order("desc").take(fetchLimit),
      firstsQuery.order("desc").take(fetchLimit),
      growthQuery.order("desc").take(fetchLimit),
      milestoneQuery.order("desc").take(fetchLimit),
    ]);

    // Get all milestones for reference
    const milestoneIds = new Set(milestoneEntries.map(m => m.milestoneId));
    const milestones = await ctx.db.query("milestones")
      .filter(q => q.or(...Array.from(milestoneIds).map(id => q.eq(q.field("_id"), id))))
      .collect();
    const milestonesById = new Map(milestones.map(m => [m._id, m]));

    // Transform and combine all items
    const allItems: TimelineItem[] = [];

    // Transform photos
    for (const photo of photos) {
      if (cursor && (
        photo.date < cursor.date || 
        (photo.date === cursor.date && photo._creationTime <= cursor._creationTime)
      )) {
        continue;
      }
      
      const isBirthAnnouncement = Math.abs(photo.date - birthDate) < 1000 * 60 * 60 * 24;
      
      allItems.push({
        _id: photo._id,
        _creationTime: photo._creationTime,
        babyId: photo.babyId,
        userId: photo.userId,
        anonymousId: photo.anonymousId,
        type: "photo" as const,
        title: isBirthAnnouncement ? "Welcome to the world" : undefined,
        content: photo.caption,
        mediaUrl: photo.mediaUrls[0],
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
      if (cursor && (
        journal.date < cursor.date || 
        (journal.date === cursor.date && journal._creationTime <= cursor._creationTime)
      )) {
        continue;
      }
      
      allItems.push({
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
      if (cursor && (
        first.date < cursor.date || 
        (first.date === cursor.date && first._creationTime <= cursor._creationTime)
      )) {
        continue;
      }
      
      allItems.push({
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
      if (cursor && (
        growth.date < cursor.date || 
        (growth.date === cursor.date && growth._creationTime <= cursor._creationTime)
      )) {
        continue;
      }
      
      allItems.push({
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
        updatedAt: growth.createdAt,
        growthLogId: growth._id,
        // Include actual growth measurements
        weight: growth.weight,
        weightUnit: growth.weightUnit,
        height: growth.height,
        heightUnit: growth.heightUnit,
        headCircumference: growth.headCircumference,
        headCircumferenceUnit: growth.headCircumferenceUnit,
      });
    }

    // Transform milestone entries
    for (const milestoneEntry of milestoneEntries) {
      if (cursor && (
        milestoneEntry.achievedDate < cursor.date || 
        (milestoneEntry.achievedDate === cursor.date && milestoneEntry._creationTime <= cursor._creationTime)
      )) {
        continue;
      }
      
      const milestone = milestonesById.get(milestoneEntry.milestoneId);
      if (!milestone) continue;

      allItems.push({
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
        updatedAt: milestoneEntry.createdAt,
      });
    }

    // Sort all items by date (newest first), then by creation time
    allItems.sort((a, b) => {
      if (b.date !== a.date) return b.date - a.date;
      return b._creationTime - a._creationTime;
    });

    // Take only the requested limit
    const items = allItems.slice(0, limit);
    const hasMore = allItems.length > limit;

    // Create next cursor if there are more items
    let nextCursor: string | undefined;
    if (hasMore && items.length > 0) {
      const lastItem = items[items.length - 1];
      const newCursor: Cursor = {
        date: lastItem.date,
        _creationTime: lastItem._creationTime,
        lastIds: {},
      };
      
      // Use btoa for base64 encoding in Convex runtime
      nextCursor = btoa(JSON.stringify(newCursor));
    }

    // Return format depends on whether this is called by usePaginatedQuery
    if (args.paginationOpts) {
      // Format for usePaginatedQuery
      return {
        page: items,
        continueCursor: nextCursor || null,
        isDone: !hasMore,
      };
    } else {
      // Original format
      return {
        items,
        nextCursor,
        hasMore,
      };
    }
  },
});

// Get ALL timeline items for a baby (for local-first caching)
export const getAllTimelineItems = query({
  args: {
    babyId: v.id("babies"),
  },
  handler: async (ctx, args) => {
    // Get all items from all tables
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

    // Transform all items to TimelineItems format
    const allItems: TimelineItem[] = [];
    
    // Add photos
    photos.forEach(photo => {
      allItems.push({
        _id: photo._id,
        _creationTime: photo._creationTime,
        type: 'photo',
        content: photo.caption || '',
        mediaUrl: photo.mediaUrls?.[0],
        mediaUrls: photo.mediaUrls,
        mediaTypes: photo.mediaTypes,
        localMediaPaths: photo.localMediaPaths,
        tags: [],
        date: photo.date,
        createdAt: photo.createdAt,
        updatedAt: photo.updatedAt || photo.createdAt,
      });
    });

    // Add journal entries
    journalEntries.forEach(entry => {
      allItems.push({
        _id: entry._id,
        _creationTime: entry._creationTime,
        type: 'journal',
        content: entry.content,
        tags: entry.tags || [],
        date: entry.date,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt || entry.createdAt,
      });
    });

    // Add firsts
    firsts.forEach(first => {
      allItems.push({
        _id: first._id,
        _creationTime: first._creationTime,
        type: 'first',
        content: first.description,
        firstType: first.type,
        tags: [],
        date: first.date,
        createdAt: first.createdAt,
        updatedAt: first.updatedAt || first.createdAt,
      });
    });

    // Add growth logs with full data
    growthLogs.forEach(log => {
      allItems.push({
        _id: log._id,
        _creationTime: log._creationTime,
        type: 'growth',
        content: log.notes || '',
        tags: [],
        date: log.date,
        createdAt: log.createdAt,
        updatedAt: log.updatedAt || log.createdAt,
        growthLogId: log._id,
        // Include actual growth measurements
        weight: log.weight,
        weightUnit: log.weightUnit,
        height: log.height,
        heightUnit: log.heightUnit,
        headCircumference: log.headCircumference,
        headCircumferenceUnit: log.headCircumferenceUnit,
      });
    });

    // Add milestone entries
    milestoneEntries.forEach(entry => {
      allItems.push({
        _id: entry._id,
        _creationTime: entry._creationTime,
        type: 'milestone',
        content: entry.notes || '',
        mediaUrl: entry.photoUrl,
        milestoneId: entry.milestoneId,
        tags: [],
        date: entry.achievedDate,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt || entry.createdAt,
      });
    });

    // Sort by date descending (newest first)
    allItems.sort((a, b) => b.date - a.date);

    return allItems;
  },
});

// Get new items since a specific timestamp (for syncing)
export const getNewTimelineItems = query({
  args: {
    babyId: v.id("babies"),
    sinceTimestamp: v.number(),
  },
  handler: async (ctx, args) => {
    // Get all items created or updated after the timestamp
    const [photos, journalEntries, firsts, growthLogs, milestoneEntries] = await Promise.all([
      ctx.db.query("photos")
        .withIndex("by_baby_date", q => q.eq("babyId", args.babyId))
        .filter(q => q.gt(q.field("updatedAt"), args.sinceTimestamp))
        .order("desc")
        .collect(),
      ctx.db.query("journalEntries")
        .withIndex("by_baby_date", q => q.eq("babyId", args.babyId))
        .filter(q => q.gt(q.field("updatedAt"), args.sinceTimestamp))
        .order("desc")
        .collect(),
      ctx.db.query("firsts")
        .withIndex("by_baby_date", q => q.eq("babyId", args.babyId))
        .filter(q => q.gt(q.field("updatedAt"), args.sinceTimestamp))
        .order("desc")
        .collect(),
      ctx.db.query("growthLogs")
        .withIndex("by_baby_date", q => q.eq("babyId", args.babyId))
        .filter(q => q.gt(q.field("createdAt"), args.sinceTimestamp))
        .order("desc")
        .collect(),
      ctx.db.query("milestoneEntries")
        .withIndex("by_baby_date", q => q.eq("babyId", args.babyId))
        .filter(q => q.gt(q.field("createdAt"), args.sinceTimestamp))
        .order("desc")
        .collect(),
    ]);

    return {
      photos,
      journalEntries,
      firsts,
      growthLogs,
      milestoneEntries,
      timestamp: Date.now(),
    };
  },
});