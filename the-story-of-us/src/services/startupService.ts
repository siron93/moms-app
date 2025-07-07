import { processPendingUploads, getPendingUploadCount } from './backgroundUpload';
import { api } from '../../convex/_generated/api';

export const initializeApp = async (convexClient: any) => {
  try {
    // Check for pending uploads
    const pendingCount = await getPendingUploadCount();
    
    if (pendingCount > 0) {
      console.log(`Found ${pendingCount} pending uploads, processing...`);
      
      // Get Convex functions
      const generateUploadUrl = () => convexClient.mutation(api.files.generateUploadUrl)();
      const storeFileUrl = (args: any) => convexClient.mutation(api.files.storeFileUrl)(args);
      const updateMemoryMediaUrl = (args: any) => convexClient.mutation(api.memories.updateMemoryMediaUrl)(args);
      
      // Process uploads in background
      processPendingUploads(
        generateUploadUrl,
        storeFileUrl,
        updateMemoryMediaUrl
      ).catch(console.error);
    }
  } catch (error) {
    console.error('Error initializing app:', error);
  }
};

// Check and process uploads periodically
export const startUploadMonitor = (convexClient: any) => {
  // Check every 5 minutes
  setInterval(async () => {
    const pendingCount = await getPendingUploadCount();
    if (pendingCount > 0) {
      console.log(`Upload monitor: ${pendingCount} uploads pending`);
      
      const generateUploadUrl = () => convexClient.mutation(api.files.generateUploadUrl)();
      const storeFileUrl = (args: any) => convexClient.mutation(api.files.storeFileUrl)(args);
      const updateMemoryMediaUrl = (args: any) => convexClient.mutation(api.memories.updateMemoryMediaUrl)(args);
      
      processPendingUploads(
        generateUploadUrl,
        storeFileUrl,
        updateMemoryMediaUrl
      ).catch(console.error);
    }
  }, 5 * 60 * 1000); // 5 minutes
};