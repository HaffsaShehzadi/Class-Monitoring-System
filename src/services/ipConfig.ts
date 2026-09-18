import Constants from 'expo-constants';
import { Platform } from 'react-native';

const BACKEND_PORT = '5000';
// ✅ Yeh aapka fallback IP hai (agar auto-detect kisi wajah se fail ho jaye)
const STATIC_IP = '192.168.100.14'; 

export const detectBackend = async (): Promise<string> => {
  
  // 1️⃣ Agar Web Browser (Chrome) mein test kar rahe hain
  if (Platform.OS === 'web') {
    console.log('🌐 Web Browser detected: Using localhost');
    return `http://localhost:${BACKEND_PORT}`;
  }

  // 2️⃣ Physical Device (Expo Go YA Development Build)
  if (Constants.isDevice) {
    
    // Method A: Expo Go ke liye (hostUri se IP nikalna)
    const hostUri = Constants.expoConfig?.hostUri || '';
    
    // Method B: Development Build ke liye (debuggerHost se IP nikalna)
    const debuggerHost = (Constants.manifest as any)?.debuggerHost || '';

    // Dono mein se jo bhi available ho, usay use karein
    const source = hostUri || debuggerHost;

    if (source && source.includes(':')) {
      const ip = source.split(':')[0]; // Port ko hata kar sirf IP le lo (e.g., "192.168.1.25")
      
      // Ensure karein ke yeh localhost na ho
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        const backendUrl = `http://${ip}:${BACKEND_PORT}`;
        console.log('📱 Physical Device: Auto-detected IP ->', ip);
        console.log('🎯 Connecting to Backend ->', backendUrl);
        return backendUrl;
      }
    }

    // Method C: Agar upar ke dono methods fail ho jayein, toh Static IP use karein
    console.log('⚠️ Auto-detect failed. Using Static IP ->', STATIC_IP);
    return `http://${STATIC_IP}:${BACKEND_PORT}`;
  }

  // 3️⃣ Ultimate Fallback (Agar kisi wajah se isDevice false aa jaye, lekin web na ho)
  // Yahan bhi hum localhost ki bajaye Static IP de rahe hain taake network fail na ho
  console.log('⚠️ Fallback triggered: Using Static IP ->', STATIC_IP);
  return `http://${STATIC_IP}:${BACKEND_PORT}`;
};