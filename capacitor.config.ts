import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'gr.uowm.sek2app',
  appName: 'sek2-app',
  webDir: 'build',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
	PushNotifications: {
    presentationOptions: ["badge", "sound", "alert"]
  },
    App: {
      // 👇 Register custom deep link scheme
      urlSchemes: ['sek2app'],
    },
  },
};

export default config;


