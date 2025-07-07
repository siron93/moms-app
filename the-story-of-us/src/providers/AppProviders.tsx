import React, { useEffect } from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { initializeApp, startUploadMonitor } from '../services/startupService';

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  useEffect(() => {
    // Initialize app and process pending uploads
    initializeApp(convex).then(() => {
      console.log('App initialized, starting upload monitor...');
      startUploadMonitor(convex);
    });
  }, []);

  // For now, use ConvexProvider without Clerk
  // We'll add Clerk integration later
  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  );
};