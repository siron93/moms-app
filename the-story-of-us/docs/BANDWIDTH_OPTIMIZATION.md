# Bandwidth Optimization - Timeline Query

## Date: 2025-07-08

### Problem
The timeline query was fetching ALL records from 5 tables using `.collect()`, then paginating in memory. This caused massive bandwidth usage as the entire dataset was downloaded on every request.

### Solution Implemented
Replaced `.collect()` with `.take()` to limit data fetched at the database level.

### Changes Made

1. **Timeline Pagination Query** (`convex/timelinePaginated.ts`)
   - Changed from `.collect()` to `.take(fetchLimit)` for each table
   - Fetch limit = max(100, requested limit * 2) to ensure enough items after merging
   - Improved cursor-based pagination using date + ID for stable pagination
   - Limited milestone reference fetches to only needed items

2. **Get All Timeline Items Query**
   - Limited to 200 items per table instead of unlimited
   - Still provides enough data for caching while preventing bandwidth explosion

### Before vs After

**Before:**
```typescript
ctx.db.query("photos")
  .withIndex("by_baby_date", q => q.eq("babyId", args.babyId))
  .order("desc")
  .collect()  // ❌ Fetches ALL photos
```

**After:**
```typescript
ctx.db.query("photos")
  .withIndex("by_baby_date", q => q.eq("babyId", args.babyId))
  .order("desc")
  .take(fetchLimit)  // ✅ Only fetches what's needed
```

### Expected Results
- **Before:** ~1000+ items fetched per request (growing with data)
- **After:** ~100-200 items fetched per request (fixed limit)
- **Bandwidth Reduction:** 80-90%+ reduction

### Next Steps
1. Monitor bandwidth usage to confirm improvement
2. Consider implementing a denormalized timeline table for single-query access
3. Add caching layer to reduce repeated queries
4. Implement Convex's built-in `.paginate()` method for even better efficiency

### Notes
- Cursor pagination now uses date + ID for stable ordering
- Items with same date are sorted by ID to prevent duplicates
- Fetch limit is configurable but defaults to 2x requested items to account for merging