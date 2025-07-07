import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - stores authenticated user info from Clerk
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    anonymousId: v.optional(v.string()), // Links to previous anonymous session
    createdAt: v.number(),
  })
    .index("by_clerk", ["clerkId"])
    .index("by_anonymous", ["anonymousId"]),

  // Babies table - each child being tracked
  babies: defineTable({
    userId: v.optional(v.id("users")), // Optional for anonymous users
    anonymousId: v.optional(v.string()),
    name: v.string(),
    birthDate: v.number(),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"), v.literal("other"))),
    profilePictureUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_anonymous", ["anonymousId"]),

  // Memories table - timeline entries
  memories: defineTable({
    babyId: v.id("babies"),
    userId: v.optional(v.id("users")),
    anonymousId: v.optional(v.string()),
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
    date: v.number(), // Date of the memory
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_baby_date", ["babyId", "date"])
    .index("by_type", ["type"])
    .index("by_anonymous", ["anonymousId"]),

  // Milestones table - predefined developmental milestones
  milestones: defineTable({
    category: v.string(), // "0-3 months", "4-7 months", etc.
    name: v.string(),
    description: v.optional(v.string()),
    iconUrl: v.optional(v.string()),
    order: v.number(),
  })
    .index("by_category", ["category", "order"]),

  // Milestone entries - when a baby achieves a milestone
  milestoneEntries: defineTable({
    babyId: v.id("babies"),
    milestoneId: v.id("milestones"),
    userId: v.optional(v.id("users")),
    anonymousId: v.optional(v.string()),
    achievedDate: v.number(),
    notes: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    photoLocalPath: v.optional(v.string()),
    metadata: v.optional(v.any()), // For milestone-specific data (e.g., first word)
    createdAt: v.number(),
  })
    .index("by_baby", ["babyId"])
    .index("by_anonymous", ["anonymousId"]),

  // Feeding logs
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

  // Sleep logs
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

  // Diaper logs
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

  // Growth logs
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

  // Sanctuary content - meditations, breathing exercises, journal prompts
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

  // User sanctuary progress
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