import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.trey.clientdatamanager',
  appName: 'إدخال بيانات عملاء تري',
  webDir: 'out',
  android: {
    allowMixedContent: true
  }
};

export default config;
