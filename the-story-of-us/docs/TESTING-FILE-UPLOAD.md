# Testing File Upload in The Story of Us

## Current Implementation

The app now supports uploading photos to Convex cloud storage, ensuring that your memories are safely backed up and accessible across devices.

### How It Works

1. **Photo Selection**: When you select a photo from your gallery or take a new photo, it's first cached locally for fast loading.

2. **Cloud Upload**: When you save a memory, the app:
   - Uploads each photo to Convex storage
   - Gets a permanent URL for the photo
   - Saves both the cloud URL and local path in the database

3. **Fallback**: If upload fails, the app falls back to using the local URI to ensure your memory is still saved.

## Testing Steps

### Using Expo Go (Limited Features)
```bash
npm run expo
```
- ✅ Single photo selection
- ✅ Camera capture
- ✅ Basic file upload
- ❌ Multiple photo selection (requires development build)

### Using Development Build (Full Features)
```bash
# First time setup
npm run dev:ios

# Subsequent runs
npm run ios
```
- ✅ Multiple photo selection (up to 15)
- ✅ Full camera integration
- ✅ Video support
- ✅ All native features

## Debugging

### Check Console Logs
When uploading, you'll see detailed logs:
```
Starting upload to Convex: file:///...
Getting upload URL...
Got upload URL: https://...
Fetching file as blob...
Blob size: 1234567 Type: image/jpeg
Uploading to Convex storage...
Upload response status: 200
File stored, URL: https://...
```

### Common Issues

1. **"Network request failed"**: Check internet connection and Convex server status.
2. **Upload timeout**: Files have a 2-minute upload timeout. Very large files may fail.
3. **Photos not showing**: Check if Convex URLs are being properly saved and fetched.

### Convex File Storage Limits

- **File Size**: No hard limit when using upload URLs (our approach)
- **Upload Timeout**: 2 minutes per file
- **HTTP Actions**: 20MB limit (not used in our implementation)
- **Optimization**: Images >5MB are automatically compressed to improve upload speed

## Verifying Cloud Storage

1. Open Convex Dashboard: https://dashboard.convex.dev
2. Navigate to your project
3. Go to "Files" section
4. You should see uploaded images listed there

## Performance Notes

- Local caching ensures fast loading even with cloud storage
- Uploads happen in the background while saving
- Failed uploads fall back to local storage gracefully