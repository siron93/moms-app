import { useFonts } from 'expo-font';

export const useCustomFonts = () => {
  const [fontsLoaded] = useFonts({
    // Nunito Sans
    'NunitoSans-Light': require('../../assets/fonts/NunitoSans-Light.ttf'),
    'NunitoSans-Regular': require('../../assets/fonts/NunitoSans-Regular.ttf'),
    'NunitoSans-Bold': require('../../assets/fonts/NunitoSans-Bold.ttf'),
    
    // Playfair Display
    'PlayfairDisplay-Regular': require('../../assets/fonts/PlayfairDisplay-Regular.ttf'),
    'PlayfairDisplay-Bold': require('../../assets/fonts/PlayfairDisplay-Bold.ttf'),
    'PlayfairDisplay-Black': require('../../assets/fonts/PlayfairDisplay-Black.ttf'),
    
    // Caveat
    'Caveat-Medium': require('../../assets/fonts/Caveat-Medium.ttf'),
  });

  return fontsLoaded;
};

// Font family names for easy reference
export const fonts = {
  // Nunito Sans
  nunitoLight: 'NunitoSans-Light',
  nunito: 'NunitoSans-Regular',
  nunitoBold: 'NunitoSans-Bold',
  
  // Playfair Display
  playfair: 'PlayfairDisplay-Regular',
  playfairBold: 'PlayfairDisplay-Bold',
  playfairBlack: 'PlayfairDisplay-Black',
  
  // Caveat
  caveat: 'Caveat-Medium',
};