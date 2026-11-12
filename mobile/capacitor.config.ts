import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.girasoles.restaurant',
  appName: 'Girasoles Mobile',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#482813'
    },
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#482813',
      showSpinner: false
    }
  }
};

export default config;
