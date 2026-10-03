import * as Location from 'expo-location';

export const checkLocation = async (): Promise<{
  success: boolean;
  latitude?: number;
  longitude?: number;
  error?: string;
}> => {
  try {
    console.log('📍 Requesting location...');
    
    let { status } = await Location.getForegroundPermissionsAsync();
    
    if (status !== 'granted') {
  
      const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
      if (newStatus !== 'granted') {
        return {
          success: false,
          error: 'Location permission denied. Please enable location access.',
        };
      }
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      timeInterval: 5000, 
      distanceInterval: 5, 
    }).catch(async (err) => {
      console.warn(' GPS location failed, trying network location...', err);
      
      try {
        
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

export const checkLocationTestMode = async (): Promise<{
  success: boolean;
  latitude: number;
  longitude: number;
}> => {
  
  console.warn(' TEST MODE: Using fake location');
  return {
    success: true,
    latitude: 31.5204, 
    longitude: 74.3587,
  };
};