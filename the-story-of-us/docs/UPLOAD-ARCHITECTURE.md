# Upload Architecture

## Current Implementation

### Save Flow:
1. User selects photos and taps Save
2. App uploads each photo to Convex sequentially
3. UI is blocked with loading spinner during upload
4. Memory is created only after all uploads complete
5. User sees memory in timeline immediately

### Display Flow:
1. Timeline loads memories from Convex
2. Images are loaded from stored URLs (mix of cloud/local)
3. Now uses OptimizedImage component that:
   - Checks local cache first
   - Falls back to cloud URL
   - Shows loading state

## Recommended Improvements

### Option 1: Background Upload (Better UX)
```typescript
// Save Flow:
1. User taps Save
2. Save memory immediately with local URIs
3. Queue uploads in background
4. Update memory with cloud URLs as uploads complete
5. User can continue using app immediately
```

**Pros:**
- Instant save experience
- Works offline
- No timeout issues
- Better perceived performance

**Cons:**
- More complex implementation
- Need to handle upload status

### Option 2: Parallel Upload (Current approach, optimized)
```typescript
// Optimize current implementation:
1. Upload all photos in parallel (not sequential)
2. Show progress (3/5 uploaded)
3. Add timeout handling per file
```

**Pros:**
- Simpler implementation
- All uploads complete before save
- Easier to handle errors

**Cons:**
- Still blocks UI
- Risk of timeout with many files

## Storage Strategy

### Local First:
- Always cache images locally for fast loading
- Upload to cloud for backup/sync
- Use OptimizedImage component everywhere

### Cloud URLs:
- Permanent backup
- Cross-device sync
- Shareable links

## Implementation Status

✅ Completed:
- OptimizedImage component for smart loading
- Local caching with expo-file-system
- Cloud upload to Convex
- Fallback handling

🚧 Ready but not integrated:
- Background upload service
- Upload queue with retry
- Progress tracking

❌ Not implemented:
- Upload progress UI
- Background upload integration
- Parallel upload optimization