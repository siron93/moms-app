import { useEffect, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { processPendingUploads, getPendingUploadCount } from '../services/backgroundUpload';

export const useBackgroundUpload = () => {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const storeFileUrl = useMutation(api.files.storeFileUrl);
  const updateMemoryMediaUrl = useMutation(api.memories.updateMemoryMediaUrl);
  const updateMilestoneEntry = useMutation(api.milestoneEntries.updateMilestoneEntry);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const processUploads = async () => {
    try {
      const pendingCount = await getPendingUploadCount();
      if (pendingCount > 0) {
        console.log(`Processing ${pendingCount} pending uploads...`);
        await processPendingUploads(
          generateUploadUrl,
          storeFileUrl,
          updateMemoryMediaUrl,
          updateMilestoneEntry
        );
      }
    } catch (error) {
      console.error('Error processing uploads:', error);
    }
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
    // Start processing when component mounts
    startBackgroundProcessing();

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