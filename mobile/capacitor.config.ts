import type { CapacitorConfig } from '@capacitor/cli';


const config: CapacitorConfig = {
  appId: 'com.barberboss.app',
  appName: 'Barber Boss',
  webDir: 'www',
  // allowNavigation moved to server property
  server: {
    allowNavigation: [
      '*',
      'https://*.ngrok-free.app',
      'https://*.ngrok.io'
    ],
    cleartext: true,
    androidScheme: 'https'
  },

  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: true
  },
  // plugins removed: CapacitorHttp não será mais usado
};

export default config;
