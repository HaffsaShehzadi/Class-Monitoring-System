import * as Location from 'expo-location';

export const checkLocation = async (): Promise<{
  success: boolean;
  latitude?: number;
  longitude?: number;
  error?: string;
}> => {
  try {
    console.log('📍 Requesting location...');
    
    // ✅ Step 1: Check permissions
    let { status } = await Location.getForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      // Request permission
      const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
      if (newStatus !== 'granted') {
        return {
          success: false,
          error: 'Location permission denied. Please enable location access.',
        };
      }
    }

    // ✅ Step 2: Get location with TIMEOUT and FALLBACK options
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced, // ✅ Faster than HighAccuracy
      timeInterval: 5000, // ✅ Max wait time: 5 seconds
      distanceInterval: 10, // ✅ Update every 10 meters
    }).catch(async (err) => {
      console.warn('⚠️ GPS location failed, trying network location...', err);
      
      // ✅ Fallback: Use network-based location (faster but less accurate)
      try {
        // ❌ REMOVED: accuracy parameter (getLastKnownPositionAsync doesn't accept it)
        const networkLocation = await Location.getLastKnownPositionAsync();
        
        if (networkLocation) {
          console.log('📡 Using last known network location');
          return networkLocation;
        }
      } catch (networkErr) {
        console.error('❌ Network location also failed');
      }
      
      throw err;
    });

    if (!location) {
      return {
        success: false,
        error: 'Failed to get location. Please check if GPS is enabled.',
      };
    }

    console.log('✅ Location obtained:', {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      accuracy: location.coords.accuracy,
    });

    return {
      success: true,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

  } catch (error: any) {
    console.error('❌ Location error:', error.message);
    return {
      success: false,
      error: error.message || 'Unable to get your location',
    };
  }
};

// ✅ TESTING MODE: Bypass location check (VIVA/DEMO ke liye)
export const checkLocationTestMode = async (): Promise<{
  success: boolean;
  latitude: number;
  longitude: number;
}> => {
  // ⚠️ TESTING KE LIYE - Fake location return karein
  console.warn('⚠️ TEST MODE: Using fake location');
  return {
    success: true,
    latitude: 31.5204, // Example: Lahore coordinates
    longitude: 74.3587,
  };
};