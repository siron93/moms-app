import { addUploadToQueue } from './backgroundUpload';

export type ContentType = 'photo' | 'milestone' | 'journal' | 'first' | 'growth';
export type TableType = 'photos' | 'milestoneEntries' | 'journalEntries' | 'firsts' | 'growthLogs';

// Map content types to their corresponding table types
const contentTypeToTableMap: Record<ContentType, TableType> = {
  photo: 'photos',
  milestone: 'milestoneEntries',
  journal: 'journalEntries',
  first: 'firsts',
  growth: 'growthLogs',
};

export const queueMediaUpload = async (
  entryId: string,
  contentType: ContentType,
  localUri: string,
  mediaType: 'image' | 'video' = 'image',
  index: number = 0
) => {
  // DISABLED: No uploads to Convex
  console.log('Upload queue disabled - keeping files local only');
  return;
  
  // const tableType = contentTypeToTableMap[contentType];
  // 
  // await addUploadToQueue({
  //   entryId,
  //   entryType: contentType === 'milestone' ? 'milestone' : 'photo',
  //   tableType,
  //   localUri,
  //   index,
  //   type: mediaType,
  //   retryCount: 0,
  // });
};

// Queue multiple media uploads (for photo galleries)
export const queueMultipleMediaUploads = async (
  entryId: string,
  contentType: ContentType,
  mediaItems: Array<{ localUri: string; type: 'image' | 'video' }>
) => {
  // DISABLED: No uploads to Convex
  console.log('Multiple upload queue disabled - keeping files local only');
  return;
  
  // for (let i = 0; i < mediaItems.length; i++) {
  //   await queueMediaUpload(
  //     entryId,
  //     contentType,
  //     mediaItems[i].localUri,
  //     mediaItems[i].type,
  //     i
  //   );
  // }
};