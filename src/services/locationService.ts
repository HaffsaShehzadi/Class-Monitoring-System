import * as Location from 'expo-location';
import { detectBackend } from './ipConfig';       // ✅ Clean static import
import { tokenStorage } from './tokenStorage';    // ✅ Clean static import

// Govt. Graduate College, Civil Lines, Sheikhupura coordinates
const COLLEGE_LOCATION = {
  latitude: 31.7167,
  longitude: 73.9833,
  radius: 99999999999, // TODO: Testing ke liye yehi rahne do, baad mein Production ke liye 50 meters set karna hai
};

// ✅ YEH WO EXPORTED FUNCTION HAI JO AAPKI SCREEN DHUNDH RAHI HAI (Bilkul same jaisa aapka tha)
export const checkLocation = async (): Promise<{
  success: boolean;
  latitude?: number;
  longitude?: number;
  error?: string;
}> => {
  try {
    // Permission check
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return { success: false, error: 'Location permission denied' };
    }

    // Get current location
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const { latitude, longitude } = location.coords;

    // Calculate distance using Haversine formula
    const distance = getDistance(
      latitude,
      longitude,
      COLLEGE_LOCATION.latitude,
      COLLEGE_LOCATION.longitude
    );

    if (distance <= COLLEGE_LOCATION.radius) {
      return { success: true, latitude, longitude };
    } else {
      return {
        success: false,
        error: `You are ${Math.round(distance)}m away from college. Must be within ${COLLEGE_LOCATION.radius}m.`,
      };
    }
  } catch (error) {
    return { success: false, error: 'Failed to get location' };
  }
};

// Haversine formula - calculate distance between 2 points
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371000; // Earth radius in meters
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ✅ INTEGRATION: Backend ko location update karne ke liye (Clean & Simple)
export const updateLocationToBackend = async (latitude: number, longitude: number) => {
  try {
    // ✅ Yahan clean static imports use kiye hain (dynamic import ki jagah)
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();

    console.log('📡 [locationService] Sending location to backend...');

    const response = await fetch(`${BACKEND_URL}/api/location/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        latitude,
        longitude
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.log('⚠️ Location update failed:', data.message);
    } else {
      console.log('✅ Location updated successfully on server');
    }
  } catch (error) {
    console.log('⚠️ Location sync error (offline?):', error);
  }
};