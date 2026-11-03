import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.brainvibe.goal',
  appName: 'BrainVibe',
  webDir: 'dist',
  server: {
    // Load the published BrainVibe app so Firebase and existing web features stay in sync.
    url: 'https://brainvibe-goal.ai.studio/',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
