import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Keep existing tables
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    anonymousId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_clerk", ["clerkId"])
    .index("by_anonymous", ["anonymousId"]),

  babies: defineTable({
    userId: v.optional(v.id("users")),
    anonymousId: v.optional(v.string()),
    name: v.string(),
    birthDate: v.number(),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"), v.literal("other"))),
    profilePictureUrl: v.optional(v.string()),
    birthWeight: v.optional(v.number()),
    birthWeightUnit: v.optional(v.string()),
    birthLength: v.optional(v.number()),
    birthLengthUnit: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_anonymous", ["anonymousId"]),

  // NEW: Photos table for photo/video memories
  photos: defineTable({
    babyId: v.id("babies"),
    userId: v.optional(v.id("users")),
    anonymousId: v.optional(v.string()),
    caption: v.optional(v.string()),
    mediaUrls: v.array(v.string()), // Cloud URLs
    mediaTypes: v.array(v.union(v.literal("image"), v.literal("video"))),
    localMediaPaths: v.optional(v.array(v.string())), // Local paths for offline
    date: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_baby_date", ["babyId", "date"])
    .index("by_anonymous", ["anonymousId"]),

  // NEW: Journal entries table
  journalEntries: defineTable({
    babyId: v.id("babies"),
    userId: v.optional(v.id("users")),
    anonymousId: v.optional(v.string()),
    title: v.optional(v.string()),
    content: v.string(),
    date: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_baby_date", ["babyId", "date"])
    .index("by_anonymous", ["anonymousId"]),

  // NEW: Firsts table
  firsts: defineTable({
    babyId: v.id("babies"),
    userId: v.optional(v.id("users")),
    anonymousId: v.optional(v.string()),
    type: v.string(), // "first_smile", "first_laugh", etc.
    title: v.string(),
    description: v.optional(v.string()),
    date: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_baby_date", ["babyId", "date"])
    .index("by_anonymous", ["anonymousId"]),

  // Keep existing milestones reference table
  milestones: defineTable({
    category: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    iconUrl: v.optional(v.string()),
    order: v.number(),
  })
    .index("by_category", ["category", "order"]),

  // Keep existing milestone entries (already structured well)
  milestoneEntries: defineTable({
    babyId: v.id("babies"),
    milestoneId: v.id("milestones"),
    userId: v.optional(v.id("users")),
    anonymousId: v.optional(v.string()),
    achievedDate: v.number(),
    notes: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    photoLocalPath: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_baby", ["babyId"])
    .index("by_anonymous", ["anonymousId"])
    .index("by_baby_date", ["babyId", "achievedDate"]), // Add this for timeline query

  // Keep existing growth logs (already structured well)
  growthLogs: defineTable({
    babyId: v.id("babies"),
    userId: v.optional(v.id("users")),
    anonymousId: v.optional(v.string()),
    date: v.number(),
    weight: v.optional(v.number()),
    weightUnit: v.optional(v.union(v.literal("lb"), v.literal("kg"))),
    height: v.optional(v.number()),
    heightUnit: v.optional(v.union(v.literal("in"), v.literal("cm"))),
    headCircumference: v.optional(v.number()),
    headUnit: v.optional(v.union(v.literal("in"), v.literal("cm"))),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_baby_date", ["babyId", "date"])
    .index("by_anonymous", ["anonymousId"]),

  // Keep other tables as-is
  feedingLogs: defineTable({
    babyId: v.id("babies"),
    userId: v.optional(v.id("users")),
    anonymousId: v.optional(v.string()),
    type: v.union(v.literal("breast"), v.literal("bottle"), v.literal("solids")),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    duration: v.optional(v.number()),
    side: v.optional(v.union(v.literal("left"), v.literal("right"), v.literal("both"))),
    amount: v.optional(v.number()),
    unit: v.optional(v.union(v.literal("oz"), v.literal("ml"))),
    foodType: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_baby_time", ["babyId", "startTime"])
    .index("by_anonymous", ["anonymousId"]),

  sleepLogs: defineTable({
    babyId: v.id("babies"),
    userId: v.optional(v.id("users")),
    anonymousId: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    duration: v.optional(v.number()),
    type: v.union(v.literal("nap"), v.literal("night")),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_baby_time", ["babyId", "startTime"])
    .index("by_anonymous", ["anonymousId"]),

  diaperLogs: defineTable({
    babyId: v.id("babies"),
    userId: v.optional(v.id("users")),
    anonymousId: v.optional(v.string()),
    type: v.union(v.literal("wet"), v.literal("dirty"), v.literal("both")),
    time: v.number(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_baby_time", ["babyId", "time"])
    .index("by_anonymous", ["anonymousId"]),

  sanctuaryContent: defineTable({
    type: v.union(v.literal("meditation"), v.literal("breathing"), v.literal("journalPrompt")),
    title: v.string(),
    description: v.optional(v.string()),
    duration: v.optional(v.number()),
    audioUrl: v.optional(v.string()),
    instructions: v.optional(v.array(v.string())),
    prompt: v.optional(v.string()),
    category: v.optional(v.string()),
    order: v.number(),
  })
    .index("by_type", ["type", "order"]),

  userSanctuaryProgress: defineTable({
    userId: v.optional(v.id("users")),
    anonymousId: v.optional(v.string()),
    contentId: v.id("sanctuaryContent"),
    completedAt: v.number(),
    duration: v.optional(v.number()),
    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_anonymous", ["anonymousId"]),
});