# Bugs and Issues

## Fixed Issues

### 1. Milestone Upload Error (Fixed)
**Issue**: `TypeError: generateUploadUrl is not a function (it is undefined)`
**Cause**: Missing mutations import in MilestoneLogModal
**Fix**: 
- Added `generateUploadUrl` and `storeFileUrl` mutations from `api.files`
- Updated `uploadMediaToConvex` call to pass required parameters
- Removed duplicate `storage.ts` file

### 2. Milestone Modal Design (Fixed)
**Issue**: Modal was too minimal and didn't match HTML design
**Fix**: 
- Redesigned as full-screen modal with proper styling
- Added milestone image at top
- Updated all inputs and buttons to match HTML mockup
- Added proper date display ("Today" when appropriate)

### 3. Milestone Photo Removal (Fixed)
**Issue**: Removing a photo from milestone and saving didn't actually remove it
**Cause**: Not handling null photoUri state properly
**Fix**:
- Added explicit check for `photoUri === null` to clear both URL and local path
- Update both milestone entry and associated memory in timeline
- Added `updateMemoryForMilestone` mutation to sync changes

### 4. Milestone Updates Not Syncing (Fixed)
**Issue**: Photo removal and note updates not persisting for existing milestones
**Cause**: 
- Convex mutations not handling undefined vs null properly
- Some old milestones don't have associated memories in timeline
**Fix**:
- Changed mutations to explicitly handle undefined as null
- Updated `updateMemoryForMilestone` to create memory if it doesn't exist
- Ensured all photo removal passes null instead of undefined

## Known Issues

### 1. Native Module Dependencies
**Issue**: `@react-native-community/datetimepicker` requires native rebuild
**Workaround**: Run `npx expo run:ios` to rebuild with native modules

### 2. Large File Uploads
**Issue**: Files over 20MB may timeout during upload
**Status**: Warning logged, but upload proceeds (2-minute timeout limit)