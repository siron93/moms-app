# Deleted/Backup Files

This folder contains files that were removed from the main project during refactoring.

## Reason for Removal

The app was refactored from using a single `memories` table to separate tables for different content types:
- `photos`
- `journalEntries`
- `firsts`
- `milestoneEntries`
- `growthLogs`

This change required removing the old memories system and related files.

## Contents

### /convex
- `memories.ts` - Original memories table implementation (replaced by separate tables)
- `memories_old.ts` - Older backup of memories implementation
- `schema_backup.ts` - Old schema before refactoring
- `timelinePaginated.old.ts` - Old pagination implementation with complex cursor logic

### /hooks
- `useLocalFirstTimeline.ts` - Local-first timeline implementation (no longer used)
- `useInfiniteTimeline.ts` - Infinite scroll with caching (replaced by Convex pagination)

### /services
- `timelineCache.ts` - Timeline caching service (no longer needed with Convex)

### /docs
- `LOCAL-FIRST-ARCHITECTURE.md` - Documentation for local-first approach
- `LOCAL_FIRST_SUMMARY.md` - Summary of local-first implementation

## Current Implementation

The app now uses:
- Separate tables for each content type
- `timelinePaginated.ts` for merging and paginating content
- `useConvexPaginatedTimeline` hook with Convex's built-in pagination
- Individual card components for each content type

## Date: 2025-07-08