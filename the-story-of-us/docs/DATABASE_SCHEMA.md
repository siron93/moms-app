# The Story of Us - Database Schema Design

## Overview
The database is designed to support both authenticated and anonymous usage. All data created while anonymous will be linked to the user account upon authentication.

## Key Design Principles
1. **Anonymous First**: Users can use the app without authentication
2. **Data Portability**: Anonymous data seamlessly transfers to authenticated accounts
3. **Multi-Baby Support**: One account can track multiple babies
4. **Flexible Memory Types**: Supports photos, videos, journal entries, milestones, etc.

## Core Tables

### users
Stores authenticated user information from Clerk
```typescript
{
  _id: Id<"users">,
  clerkId: string,           // Clerk user ID
  email: string,
  name?: string,
  createdAt: number,
  anonymousId?: string,      // Links to previous anonymous session
}
```

### babies
Each baby/child being tracked
```typescript
{
  _id: Id<"babies">,
  userId?: Id<"users">,      // Optional for anonymous users
  anonymousId?: string,      // For anonymous users
  name: string,
  birthDate: number,         // Unix timestamp
  gender?: "male" | "female" | "other",
  profilePictureUrl?: string,
  createdAt: number,
}
```

### memories
Timeline entries (photos, videos, journal entries, milestones)
```typescript
{
  _id: Id<"memories">,
  babyId: Id<"babies">,
  userId?: Id<"users">,
  anonymousId?: string,
  type: "photo" | "video" | "journal" | "milestone" | "first" | "growth",
  title?: string,
  content?: string,          // Journal text or description
  mediaUrl?: string,         // Photo/video URL
  mediaUrls?: string[],      // Multiple photos
  milestoneId?: Id<"milestones">, // If type is milestone
  firstType?: string,        // For "first" memories (e.g., "first_smile")
  tags?: string[],
  date: number,              // Date of the memory (not creation date)
  createdAt: number,
  updatedAt: number,
}
```

### milestones
Predefined developmental milestones
```typescript
{
  _id: Id<"milestones">,
  category: string,          // "0-3 months", "4-7 months", etc.
  name: string,              // "First Smile", "Rolls Over", etc.
  description?: string,
  iconUrl?: string,
  order: number,             // Display order within category
}
```

### milestoneEntries
Tracks when a baby achieves a milestone
```typescript
{
  _id: Id<"milestoneEntries">,
  babyId: Id<"babies">,
  milestoneId: Id<"milestones">,
  userId?: Id<"users">,
  anonymousId?: string,
  achievedDate: number,
  notes?: string,
  photoUrl?: string,
  createdAt: number,
}
```

### feedingLogs
Tracks feeding sessions
```typescript
{
  _id: Id<"feedingLogs">,
  babyId: Id<"babies">,
  userId?: Id<"users">,
  anonymousId?: string,
  type: "breast" | "bottle" | "solids",
  startTime: number,
  endTime?: number,          // For breastfeeding sessions
  duration?: number,         // In minutes
  side?: "left" | "right" | "both", // For breastfeeding
  amount?: number,           // In oz/ml for bottle
  unit?: "oz" | "ml",
  foodType?: string,         // For solids
  notes?: string,
  createdAt: number,
}
```

### sleepLogs
Tracks sleep sessions
```typescript
{
  _id: Id<"sleepLogs">,
  babyId: Id<"babies">,
  userId?: Id<"users">,
  anonymousId?: string,
  startTime: number,
  endTime?: number,          // Null if currently sleeping
  duration?: number,         // Calculated in minutes
  type: "nap" | "night",
  location?: string,         // "crib", "car", etc.
  notes?: string,
  createdAt: number,
}
```

### diaperLogs
Tracks diaper changes
```typescript
{
  _id: Id<"diaperLogs">,
  babyId: Id<"babies">,
  userId?: Id<"users">,
  anonymousId?: string,
  type: "wet" | "dirty" | "both",
  time: number,
  notes?: string,
  createdAt: number,
}
```

### growthLogs
Tracks weight, height, and head circumference
```typescript
{
  _id: Id<"growthLogs">,
  babyId: Id<"babies">,
  userId?: Id<"users">,
  anonymousId?: string,
  date: number,
  weight?: number,
  weightUnit?: "lb" | "kg",
  height?: number,
  heightUnit?: "in" | "cm",
  headCircumference?: number,
  headUnit?: "in" | "cm",
  notes?: string,
  createdAt: number,
}
```

### sanctuaryContent
Meditation, breathing exercises, and journal prompts
```typescript
{
  _id: Id<"sanctuaryContent">,
  type: "meditation" | "breathing" | "journalPrompt",
  title: string,
  description?: string,
  duration?: number,         // In minutes
  audioUrl?: string,         // For meditations
  instructions?: string[],   // For breathing exercises
  prompt?: string,           // For journal prompts
  category?: string,         // "stress", "sleep", "gratitude", etc.
  order: number,
}
```

### userSanctuaryProgress
Tracks user's sanctuary activities
```typescript
{
  _id: Id<"userSanctuaryProgress">,
  userId?: Id<"users">,
  anonymousId?: string,
  contentId: Id<"sanctuaryContent">,
  completedAt: number,
  duration?: number,         // Actual time spent
  notes?: string,
}
```

## Anonymous to Authenticated Migration Strategy

When a user signs up/logs in:
1. Check if there's an `anonymousId` in local storage
2. Update all records with matching `anonymousId` to include the new `userId`
3. Link any babies created anonymously to the new user account
4. Clear the `anonymousId` from local storage

## Indexes
- babies: by userId, by anonymousId
- memories: by babyId + date (descending), by type, by tags
- feedingLogs: by babyId + startTime (descending)
- sleepLogs: by babyId + startTime (descending)
- growthLogs: by babyId + date (descending)
- All tables with anonymousId: index by anonymousId for migration