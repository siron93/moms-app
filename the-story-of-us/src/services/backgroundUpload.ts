import { api } from '../../convex/_generated/api';
import { Doc, Id } from '../../convex/_generated/dataModel';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UPLOAD_QUEUE_KEY = 'pending_uploads';

export interface UploadQueueItem {
  entryId: string;
  entryType: 'photo' | 'milestone' | 'first';
  localUri: string;
  index: number; // For multi-media items
  type: 'image' | 'video';
  retryCount: number;
}

// Add upload to queue
export const addUploadToQueue = async (upload: UploadQueueItem) => {
  try {
    const queueJson = await AsyncStorage.getItem(UPLOAD_QUEUE_KEY);
    const queue: UploadQueueItem[] = queueJson ? JSON.parse(queueJson) : [];
    queue.push(upload);
    await AsyncStorage.setItem(UPLOAD_QUEUE_KEY, JSON.stringify(queue));
    console.log(`Added upload to queue: ${upload.entryType} ${upload.entryId}, index ${upload.index}`);
  } catch (error) {
    console.error('Error queuing upload:', error);
  }
};

// Process pending uploads in background
export const processPendingUploads = async (
  generateUploadUrl: () => Promise<string>,
  storeFileUrl: (args: any) => Promise<any>,
  updateMemoryMedia: (args: any) => Promise<void>,
  updateMilestoneMedia: (args: any) => Promise<void>
) => {
  try {
    const queueJson = await AsyncStorage.getItem(UPLOAD_QUEUE_KEY);
    if (!queueJson) return;

    const queue: UploadQueueItem[] = JSON.parse(queueJson);
    const remaining: UploadQueueItem[] = [];

    for (const upload of queue) {
      try {
        // Try to upload
        const { uploadMediaToConvex } = await import('./mediaService');
        const cloudUrl = await uploadMediaToConvex(
          upload.localUri,
          upload.type,
          generateUploadUrl,
          storeFileUrl
        );

        if (cloudUrl) {
          // Update the appropriate table based on entry type
          switch (upload.entryType) {
            case 'memory':
            case 'photo': // Support legacy entries
              await updateMemoryMedia({
                memoryId: upload.entryId,
                index: upload.index,
                cloudUrl,
              });
              console.log(`Successfully uploaded memory media ${upload.index + 1} for ${upload.entryId}`);
              break;
              
            case 'milestone':
              // For milestones, we update the single photo field
              await updateMilestoneMedia({
                entryId: upload.entryId,
                photoUrl: cloudUrl,
              });
              console.log(`Successfully uploaded milestone photo for ${upload.entryId}`);
              break;
              
            default:
              console.warn(`Unknown entry type: ${upload.entryType}`);
              // Remove from queue if unknown type
              break;
          }
        } else {
          throw new Error('Upload returned null');
        }
      } catch (error) {
        console.error(`Failed to upload media for ${upload.entryType} ${upload.entryId}:`, error);
        upload.retryCount++;
        
        // Keep in queue if haven't exceeded retry limit
        if (upload.retryCount < 3) {
          remaining.push(upload);
        }
      }
    }

    // Update queue with remaining items
    if (remaining.length > 0) {
      await AsyncStorage.setItem(UPLOAD_QUEUE_KEY, JSON.stringify(remaining));
    } else {
      await AsyncStorage.removeItem(UPLOAD_QUEUE_KEY);
    }
  } catch (error) {
    console.error('Error processing upload queue:', error);
  }
};

// Get number of pending uploads
export const getPendingUploadCount = async (): Promise<number> => {
  try {
    const queueJson = await AsyncStorage.getItem(UPLOAD_QUEUE_KEY);
    if (!queueJson) return 0;
    const queue: UploadQueueItem[] = JSON.parse(queueJson);
    return queue.length;
  } catch (error) {
    console.error('Error getting upload count:', error);
    return 0;
  }
};

// Legacy support - redirect to new function
export const queueUpload = addUploadToQueue;