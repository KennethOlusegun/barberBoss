import type { CapacitorConfig } from '@capacitor/cli';


const config: CapacitorConfig = {
  appId: 'com.barberboss.app',
  appName: 'Barber Boss',
  webDir: 'www',
  bundledWebRuntime: false,

  server: {
    allowNavigation: [
      'edacious-closer-catrice.ngrok-free.dev',
      '*.ngrok-free.dev',
      '*.ngrok.io',
      'localhost',
    ],
    androidScheme: 'https',
    cleartext: false, // Apenas HTTPS
  },

  android: {
    allowMixedContent: false,
    webContentsDebuggingEnabled: true, // Para debug
    loggingBehavior: 'debug',
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#1e293b',
      showSpinner: false,
    },
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
