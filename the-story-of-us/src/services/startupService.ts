import { processPendingUploads, getPendingUploadCount } from './backgroundUpload';
import { api } from '../../convex/_generated/api';
import { initializeMediaCache } from './mediaCacheInitializer';

export const initializeApp = async (convexClient: any) => {
  try {
    // Disable media cache initialization to reduce startup bandwidth
    // Media cache will be populated as images are viewed
    // await initializeMediaCache(convexClient);
    
    // Don't process uploads here - the useBackgroundUpload hook handles this
    // Just log if there are pending uploads
    const pendingCount = await getPendingUploadCount();
    if (pendingCount > 0) {
      console.log(`Found ${pendingCount} pending uploads - will be processed by background service`);
    }
  } catch (error) {
    console.error('Error initializing app:', error);
  }
};

// Upload monitoring is now handled by useBackgroundUpload hook
export const startUploadMonitor = (convexClient: any) => {
  // Disabled - uploads are processed by the useBackgroundUpload hook
  // which runs every 30 seconds in TimelineScreen
  console.log('Upload monitoring is handled by useBackgroundUpload hook');
};