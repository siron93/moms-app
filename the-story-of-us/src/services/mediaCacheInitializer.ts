import { ConvexReactClient } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { mapConvexUrlsToLocalPaths } from './localMediaCache';
import { getOrCreateAnonymousId } from '../utils/anonymousId';

/**
 * Initialize media cache by mapping existing photos' cloud URLs to their local paths
 */
export async function initializeMediaCache(convex: ConvexReactClient) {
  try {
    console.log('Initializing media cache...');
    
    // Get anonymous ID
    const anonymousId = await getOrCreateAnonymousId();
    if (!anonymousId) return;
    
    // Get all babies for this user
    const babies = await convex.query(api.babies.getBabies, { anonymousId });
    if (!babies || babies.length === 0) return;
    
    // For each baby, get recent photos and map their URLs
    for (const baby of babies) {
      try {
        // Get only the most recent photos to map URLs
        // Reduce from 50 to 10 to minimize startup bandwidth
        const timelineData = await convex.query(api.timelinePaginated.getTimelinePaginated, {
          babyId: baby._id,
          limit: 10, // Only map the most recent items at startup
        });
        
        if (!timelineData || !timelineData.items) continue;
        
        // Process each timeline item
        for (const item of timelineData.items) {
          if (item.type === 'photo' && item.mediaUrls && item.localMediaPaths) {
            // Map cloud URLs to local paths
            await mapConvexUrlsToLocalPaths(
              item.mediaUrls,
              item.localMediaPaths,
              item.mediaTypes
            );
          }
        }
        
        console.log(`Initialized media cache for baby: ${baby.name}`);
      } catch (error) {
        console.error(`Error initializing cache for baby ${baby.name}:`, error);
      }
    }
    
    console.log('Media cache initialization complete');
  } catch (error) {
    console.error('Error initializing media cache:', error);
  }
}