import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // Must match the package name of the Android app registered in Firebase project goal-dd3ee
  appId: 'com.brainvibe.goal',
  appName: 'BrainVibe',
  webDir: 'dist',
  plugins: {
    FirebaseAuthentication: {
      // Native layer only fetches the Google credential; the Firebase JS SDK signs in with it,
      // so auth state and Firestore security rules work the same on web and Android.
      skipNativeAuth: true,
      providers: ['google.com'],
    },
  },
};

export default config;
