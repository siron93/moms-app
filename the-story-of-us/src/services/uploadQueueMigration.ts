import AsyncStorage from '@react-native-async-storage/async-storage';
import { UploadQueueItem } from './backgroundUpload';

const UPLOAD_QUEUE_KEY = 'pending_uploads';
const MIGRATION_VERSION_KEY = 'upload_queue_migration_version';
const CURRENT_VERSION = 2;

export const migrateUploadQueue = async () => {
  try {
    // Check if migration is needed
    const versionStr = await AsyncStorage.getItem(MIGRATION_VERSION_KEY);
    const version = versionStr ? parseInt(versionStr, 10) : 0;
    
    if (version >= CURRENT_VERSION) {
      return; // Already migrated
    }

    // Get existing queue
    const queueJson = await AsyncStorage.getItem(UPLOAD_QUEUE_KEY);
    if (!queueJson) {
      // No queue to migrate
      await AsyncStorage.setItem(MIGRATION_VERSION_KEY, CURRENT_VERSION.toString());
      return;
    }

    const queue: any[] = JSON.parse(queueJson);
    const migratedQueue: UploadQueueItem[] = [];

    // Migrate each item
    for (const item of queue) {
      // Skip if already has tableType (already migrated)
      if (item.tableType) {
        migratedQueue.push(item);
        continue;
      }

      // Migrate based on entryType
      const migratedItem: UploadQueueItem = {
        ...item,
        tableType: item.entryType === 'milestone' ? 'milestoneEntries' : 'photos',
      };

      // Handle legacy 'first' type
      if (item.entryType === 'first') {
        migratedItem.entryType = 'photo';
        migratedItem.tableType = 'photos';
      }

      migratedQueue.push(migratedItem);
    }

    // Save migrated queue
    await AsyncStorage.setItem(UPLOAD_QUEUE_KEY, JSON.stringify(migratedQueue));
    await AsyncStorage.setItem(MIGRATION_VERSION_KEY, CURRENT_VERSION.toString());
    
    console.log(`Migrated ${queue.length} upload queue items to version ${CURRENT_VERSION}`);
  } catch (error) {
    console.error('Error migrating upload queue:', error);
  }
};