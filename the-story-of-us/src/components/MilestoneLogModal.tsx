import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Doc, Id } from '../../convex/_generated/dataModel';
import { fonts } from '../hooks/useFonts';
import Svg, { Path } from 'react-native-svg';
import { getOrCreateAnonymousId } from '../utils/anonymousId';
import { saveMediaPermanently, uploadMediaToConvex } from '../services/mediaService';
import { queueMediaUpload } from '../services/uploadHelpers';
import { formatLocalDate } from '../utils/dateUtils';
import { MILESTONE_IMAGES } from '../utils/milestoneImages';
import { appEventEmitter, APP_EVENTS } from '../utils/eventEmitter';

const { height: screenHeight } = Dimensions.get('window');

// Icons
const CalendarIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
    <Path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </Svg>
);

const CameraIcon = () => (
  <Svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
    <Path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.158 0a.002.002 0 01-.002.002.002.002 0 01-.002-.002.002.002 0 01.002-.002.002.002 0 01.002.002z" />
  </Svg>
);

const CloseIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
    <Path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </Svg>
);

// Special milestone configurations
const SPECIAL_MILESTONES: Record<string, { fields: Array<{ key: string; label: string; placeholder: string }> }> = {
  'First Word': {
    fields: [{
      key: 'word',
      label: 'What was the word?',
      placeholder: 'Enter the first word',
    }],
  },
};

interface MilestoneLogModalProps {
  visible: boolean;
  milestone: Doc<"milestones">;
  baby: Doc<"babies">;
  existingEntry?: Doc<"milestoneEntries">;
  onClose: () => void;
  onSuccess: () => void;
}

export const MilestoneLogModal: React.FC<MilestoneLogModalProps> = ({
  visible,
  milestone,
  baby,
  existingEntry,
  onClose,
  onSuccess,
}) => {
  const [achievedDate, setAchievedDate] = useState(new Date(existingEntry?.achievedDate || Date.now()));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState(existingEntry?.notes || '');
  const [photoUri, setPhotoUri] = useState<string | null>(existingEntry?.photoLocalPath || existingEntry?.photoUrl || null);
  const [saving, setSaving] = useState(false);
  const [specialData, setSpecialData] = useState<Record<string, string>>(
    existingEntry?.metadata || {}
  );

  const createMilestoneEntry = useMutation(api.milestoneEntries.createMilestoneEntry);
  const updateMilestoneEntry = useMutation(api.milestoneEntries.updateMilestoneEntry);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const storeFileUrl = useMutation(api.files.storeFileUrl);

  const specialConfig = SPECIAL_MILESTONES[milestone.name];

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const anonymousId = await getOrCreateAnonymousId();
      let photoUrl: string | undefined;
      let photoLocalPath: string | undefined;

      // Handle photo upload/removal
      console.log('Photo handling - photoUri:', photoUri);
      console.log('Existing entry photo:', existingEntry?.photoUrl, existingEntry?.photoLocalPath);
      
      if (photoUri === null) {
        // User removed the photo - clear both URL and local path
        photoUrl = null;
        photoLocalPath = null;
        console.log('User removed photo - clearing all photo data');
      } else if (photoUri && photoUri.startsWith('file://') && photoUri !== existingEntry?.photoLocalPath) {
        // Save new photo permanently
        console.log('Saving new photo...');
        photoLocalPath = await saveMediaPermanently(photoUri, 'image');
        
        if (photoLocalPath) {
          // DISABLED: No upload to Convex - use local path as URL
          console.log('Convex upload disabled - using local path as URL');
          photoUrl = photoLocalPath;
          
          // Original upload code (disabled)
          // const uploadResult = await uploadMediaToConvex(
          //   photoLocalPath, 
          //   'image',
          //   generateUploadUrl,
          //   storeFileUrl
          // );
          // if (uploadResult) {
          //   photoUrl = uploadResult;
          // }
        }
      } else if (photoUri) {
        // Keep existing photo
        photoUrl = existingEntry?.photoUrl;
        photoLocalPath = existingEntry?.photoLocalPath;
        console.log('Keeping existing photo');
      }

      const metadata = specialConfig ? specialData : undefined;

      if (existingEntry) {
        // Update existing entry
        console.log('Updating milestone entry with:', {
          photoUrl,
          photoLocalPath,
          notes: notes.trim(),
        });
        
        await updateMilestoneEntry({
          entryId: existingEntry._id,
          achievedDate: achievedDate.getTime(),
          notes: notes.trim(),
          photoUrl: photoUrl !== undefined ? photoUrl : undefined,
          photoLocalPath: photoLocalPath !== undefined ? photoLocalPath : undefined,
          metadata,
          anonymousId,
        });
      } else {
        // Create new entry
        const entryId = await createMilestoneEntry({
          babyId: baby._id,
          milestoneId: milestone._id,
          achievedDate: achievedDate.getTime(),
          notes: notes.trim(),
          photoUrl,
          photoLocalPath,
          metadata,
          anonymousId,
        });

        // If photo upload failed but we have a local path, queue it for background upload
        if (photoLocalPath && !photoUrl) {
          await queueMediaUpload(entryId, 'milestone', photoLocalPath, 'image');
        }
      }

      // Emit event to refresh timeline
      appEventEmitter.emit(APP_EVENTS.TIMELINE_REFRESH_NEEDED);
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving milestone:', error);
      Alert.alert('Error', 'Failed to save milestone');
    } finally {
      setSaving(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setAchievedDate(selectedDate);
    }
  };

  const milestoneImage = MILESTONE_IMAGES[milestone.name];
  const isToday = achievedDate.toDateString() === new Date().toDateString();
  const dateText = isToday ? 'Today' : formatLocalDate(achievedDate, { 
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#F59E0B" />
            ) : (
              <Text style={styles.saveButton}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Milestone Icon and Title */}
          <View style={styles.milestoneHeader}>
            {milestoneImage && (
              <Image source={milestoneImage} style={styles.milestoneImage} resizeMode="cover" />
            )}
            <Text style={styles.milestoneTitle}>{milestone.name}</Text>
          </View>

          {/* Date Picker */}
          <View style={styles.section}>
            <Text style={styles.label}>When did it happen?</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>{dateText}</Text>
              <CalendarIcon />
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={achievedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          {/* Special Fields */}
          {specialConfig?.fields.map((field) => (
            <View key={field.key} style={styles.section}>
              <Text style={styles.label}>{field.label}</Text>
              <TextInput
                style={styles.input}
                placeholder={field.placeholder}
                placeholderTextColor="#9CA3AF"
                value={specialData[field.key] || ''}
                onChangeText={(text) => setSpecialData({ ...specialData, [field.key]: text })}
              />
            </View>
          ))}

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.label}>Tell the story... (optional)</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder={milestone.name === 'First Smile' ? "e.g., It lit up your whole face and melted my heart..." : "Add any special notes about this milestone..."}
              placeholderTextColor="#9CA3AF"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Photo */}
          <View style={styles.section}>
            <Text style={styles.label}>Add a photo or video</Text>
            
            {photoUri ? (
              <View style={styles.photoPreviewContainer}>
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                <TouchableOpacity 
                  style={styles.removePhotoButton}
                  onPress={() => setPhotoUri(null)}
                >
                  <CloseIcon />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.addPhotoButton} onPress={handlePickImage}>
                <CameraIcon />
                <Text style={styles.addPhotoText}>Tap to upload</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.logButton, saving && styles.logButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.logButtonText}>Log this Milestone</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  cancelButton: {
    fontSize: 16,
    fontFamily: fonts.nunito,
    color: '#6B7280',
  },
  saveButton: {
    fontSize: 16,
    fontFamily: fonts.nunitoBold,
    color: '#F59E0B',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  milestoneHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  milestoneImage: {
    width: 112,
    height: 112,
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  milestoneTitle: {
    fontSize: 30,
    fontFamily: fonts.playfairBold,
    color: '#1F2937',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: fonts.nunitoBold,
    color: '#374151',
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 16,
    fontFamily: fonts.nunito,
    color: '#1F2937',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: fonts.nunito,
    color: '#1F2937',
  },
  notesInput: {
    minHeight: 128,
    paddingTop: 16,
    textAlignVertical: 'top',
  },
  addPhotoButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 32,
    alignItems: 'center',
    gap: 8,
  },
  addPhotoText: {
    fontSize: 16,
    fontFamily: fonts.nunitoBold,
    color: '#6B7280',
  },
  photoPreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FDFDFD',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  logButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logButtonDisabled: {
    opacity: 0.6,
  },
  logButtonText: {
    fontSize: 17,
    fontFamily: fonts.nunitoBold,
    color: '#FFFFFF',
  },
});