import { useEffect, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { processPendingUploads, getPendingUploadCount } from '../services/backgroundUpload';
import { migrateUploadQueue } from '../services/uploadQueueMigration';

export const useBackgroundUpload = () => {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const storeFileUrl = useMutation(api.files.storeFileUrl);
  const updatePhotoMediaUrl = useMutation(api.photos.updatePhotoMediaUrl);
  const updateMilestoneEntry = useMutation(api.milestoneEntries.updateMilestoneEntry);
  const updateMemoryMediaUrl = useMutation(api.memories.updateMemoryMediaUrl);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Wrapper function to match the expected signature
  const updateMilestonePhoto = async (args: { entryId: string; photoUrl: string }) => {
    return updateMilestoneEntry({
      entryId: args.entryId as any,
      photoUrl: args.photoUrl,
    });
  };

  const processUploads = async () => {
    // DISABLED: No uploads to Convex
    console.log('Convex uploads disabled - using local storage only');
    return;
    
    // try {
    //   const pendingCount = await getPendingUploadCount();
    //   if (pendingCount > 0) {
    //     console.log(`Processing ${pendingCount} pending uploads...`);
    //     await processPendingUploads(
    //       generateUploadUrl,
    //       storeFileUrl,
    //       updatePhotoMediaUrl,
    //       updateMilestonePhoto,
    //       updateMemoryMediaUrl
    //     );
    //   }
    // } catch (error) {
    //   console.error('Error processing uploads:', error);
    // }
  };

  const startBackgroundProcessing = () => {
    // Process immediately
    processUploads();

    // Then process every 30 seconds while the component is mounted
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(processUploads, 30000); // 30 seconds
  };

  const stopBackgroundProcessing = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    // Run migration first
    const initializeBackgroundUploads = async () => {
      await migrateUploadQueue();
      // Start processing when component mounts
      startBackgroundProcessing();
    };
    
    initializeBackgroundUploads();

    // Cleanup on unmount
    return () => {
      stopBackgroundProcessing();
    };
  }, []);

  return {
    processUploads,
    startBackgroundProcessing,
    stopBackgroundProcessing,
  };
};