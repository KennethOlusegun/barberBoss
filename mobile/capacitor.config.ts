import type { CapacitorConfig } from '@capacitor/cli';


const config: CapacitorConfig = {
  appId: 'com.barberboss.app',
  appName: 'Barber Boss',
  webDir: 'www', // Detectado via package.json
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    allowNavigation: ['localhost', '*.barberboss.app'],
    iosScheme: 'ionic',
    hostname: 'localhost'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#1e293b',
      showSpinner: false,
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1e293b'
    }
  },
  android: {
    webContentsDebuggingEnabled: true,
    allowMixedContent: false,
    loggingBehavior: 'debug',
  },
  ios: {
    contentInset: 'automatic',
    webContentsDebuggingEnabled: true
  }
};

export default config;
