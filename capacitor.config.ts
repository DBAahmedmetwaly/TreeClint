import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.trey.clientdatamanager',
  appName: 'إدخال بيانات عملاء تري',
  server: {
    // هام: قم بتغيير عنوان IP هذا إلى عنوان IP الخاص بالكمبيوتر
    // الذي سيقوم بتشغيل خادم التطبيق على شبكتك.
    url: 'http://192.168.1.100:9002',
    cleartext: true,
  }
};

export default config;
