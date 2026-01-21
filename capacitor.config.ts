import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.trey.clientdatamanager',
  appName: 'إدخال بيانات عملاء تري',
  server: {
    url: 'http://localhost:9002',
    cleartext: true,
  }
};

export default config;
