# New Database Architecture

## Overview

The app has been refactored to use separate tables for each content type instead of a single generic `memories` table. This eliminates data duplication and provides better type safety.

## Tables

### 1. **milestoneEntries**
- Stores when a baby achieves a milestone
- Fields: babyId, milestoneId, achievedDate, notes, photoUrl, photoLocalPath, metadata
- References the `milestones` catalog table

### 2. **photos**
- Stores photo and video uploads
- Fields: babyId, caption, mediaUrl(s), localMediaPath(s), mediaType(s), tags, date
- Supports multiple media items per entry

### 3. **journal**
- Stores journal entries
- Fields: babyId, title, content, mood, tags, date
- Mood options: happy, calm, tired, frustrated, worried, excited

### 4. **firsts**
- Stores special "first" experiences
- Fields: babyId, type, title, description, metadata, photoUrl, photoLocalPath, date
- Examples: first_word, first_food, first_tooth

### 5. **growthLogs**
- Stores growth measurements
- Fields: babyId, date, weight, height, headCircumference, notes

## Timeline

The timeline is built using a unified query (`timeline.getTimeline`) that:
1. Queries all content tables
2. Merges results into a single array
3. Sorts by date
4. Returns a unified `TimelineItem` type

```typescript
export type TimelineItem = {
  _id: string;
  type: "milestone" | "photo" | "journal" | "first" | "growth";
  date: number;
  babyId: string;
  createdAt: number;
  
  // Type-specific data
  milestoneEntry?: Doc<"milestoneEntries">;
  milestone?: Doc<"milestones">;
  photo?: Doc<"photos">;
  journal?: Doc<"journal">;
  first?: Doc<"firsts">;
  growthLog?: Doc<"growthLogs">;
};
```

## Benefits

1. **No Data Duplication**: Each piece of content exists in only one place
2. **Type Safety**: Each table has specific fields for its content type
3. **Better Performance**: Can query specific content types when needed
4. **Cleaner Code**: No need to sync between multiple tables
5. **Extensibility**: Easy to add new content types with their own tables

## Migration Notes

- The old `memories` table has been removed
- Background uploads now update the specific table based on entry type
- All UI components have been updated to work with the new structure