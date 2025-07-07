import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  Dimensions,
  ScrollView,
  StyleSheet,
  Animated,
  PanResponder
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts } from '../hooks/useFonts';

const { height } = Dimensions.get('window');

interface AddMemoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectOption: (option: string) => void;
}

// Icon components
const CameraIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="1.5">
    <Path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
    <Path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008v-.008z" />
  </Svg>
);

const MilestoneIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 20 20" fill="#0EA5E9">
    <Path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </Svg>
);

const JournalIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5">
    <Path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </Svg>
);

const FirstIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.5">
    <Path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.5 21.75l-.398-1.178a3.375 3.375 0 00-2.455-2.456L12.75 18l1.178-.398a3.375 3.375 0 002.455-2.456L16.5 14.25l.398 1.178a3.375 3.375 0 002.455 2.456L20.25 18l-1.178.398a3.375 3.375 0 00-2.455 2.456z" />
  </Svg>
);

const GrowthIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FB923C" strokeWidth="1.5">
    <Path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12M3.75 3h16.5M3.75 3v-1.5A2.25 2.25 0 016 0h12a2.25 2.25 0 012.25 2.25v1.5M12 16.5h3.375m-3.375 0h-3.375M12 16.5V21m0 0V16.5m0 0h3.375M12 21h3.375m-3.375 0h-3.375" />
  </Svg>
);

interface MemoryOption {
  id: string;
  title: string;
  description: string;
  icon: () => JSX.Element;
  bgColor: string;
}

const memoryOptions: MemoryOption[] = [
  {
    id: 'photo',
    title: 'Photo or Video',
    description: 'The quickest way to save a moment.',
    icon: CameraIcon,
    bgColor: 'bg-rose-100',
  },
  {
    id: 'milestone',
    title: 'Log Milestone',
    description: 'First steps, first smile, and more.',
    icon: MilestoneIcon,
    bgColor: 'bg-sky-100',
  },
  {
    id: 'journal',
    title: 'Journal Entry',
    description: 'For longer thoughts and stories.',
    icon: JournalIcon,
    bgColor: 'bg-amber-100',
  },
  {
    id: 'first',
    title: "New 'First'",
    description: 'First bath, first food, first laugh.',
    icon: FirstIcon,
    bgColor: 'bg-violet-100',
  },
  {
    id: 'growth',
    title: 'Track Growth',
    description: 'Add weight, height, and head size.',
    icon: GrowthIcon,
    bgColor: 'bg-orange-100',
  },
];

const bgColors: { [key: string]: string } = {
  'bg-rose-100': '#FFE4E6',
  'bg-sky-100': '#E0F2FE',
  'bg-amber-100': '#FEF3C7',
  'bg-violet-100': '#EDE9FE',
  'bg-orange-100': '#FED7AA',
};

export const AddMemoryModal: React.FC<AddMemoryModalProps> = ({ visible, onClose, onSelectOption }) => {
  const insets = useSafeAreaInsets();
  
  const handleOptionPress = (optionId: string) => {
    onSelectOption(optionId);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[
              styles.modalContent,
              {
                maxHeight: height * 0.7,
                paddingBottom: insets.bottom,
              }
            ]}>
              {/* Handle bar */}
              <View style={styles.handleBar} />
              
              {/* Title */}
              <Text style={styles.modalTitle}>Add a new memory</Text>
              
              {/* Options */}
              <ScrollView style={styles.optionsContainer}>
                {memoryOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => handleOptionPress(option.id)}
                    style={styles.optionCard}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.optionIcon, { backgroundColor: bgColors[option.bgColor] }]}>
                      <option.icon />
                    </View>
                    <View style={styles.optionText}>
                      <Text style={styles.optionTitle}>{option.title}</Text>
                      <Text style={styles.optionDescription}>{option.description}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
                
                {/* Cancel button */}
                <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FDFBF8',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleBar: {
    width: 48,
    height: 6,
    backgroundColor: '#D1D5DB',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: fonts.playfairBold,
    textAlign: 'center',
    color: '#1F2937',
    marginBottom: 24,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  optionIcon: {
    padding: 12,
    borderRadius: 8,
  },
  optionText: {
    flex: 1,
    marginLeft: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: fonts.nunitoBold,
    color: '#1F2937',
  },
  optionDescription: {
    fontSize: 14,
    fontFamily: fonts.nunito,
    color: '#6B7280',
    marginTop: 4,
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 12,
  },
  cancelText: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: fonts.nunitoBold,
    color: '#6B7280',
  },
});