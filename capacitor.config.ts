import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'team.fitple.sideproject',
  appName: 'FitPle',
  webDir: 'dist',
  server: {
    // iOS WebView가 standalone PWA처럼 동작하게 함
    androidScheme: 'https',
  },
};

export default config;
