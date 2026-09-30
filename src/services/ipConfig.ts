import Constants from 'expo-constants';
import { Platform } from 'react-native';

const BACKEND_PORT = '5000';
// ✅ Real Live Server IP
const STATIC_IP = '169.58.9.166'; 
const LIVE_BACKEND_URL = `http://${STATIC_IP}:${BACKEND_PORT}`;

export const detectBackend = async (): Promise<string> => {
  // 1️⃣ Priority: app.json extra.backendUrl
  const configuredUrl = Constants.expoConfig?.extra?.backendUrl;
  if (configuredUrl) {
    return configuredUrl;
  }

  // 2️⃣ Live server fallback
  return LIVE_BACKEND_URL;
};