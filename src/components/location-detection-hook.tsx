import { useState, useCallback } from 'react';

interface LocationResult {
  lat: number;
  lng: number;
  address: string;
  accuracy?: number;
}

interface UseLocationDetectionReturn {
  detectLocation: () => Promise<LocationResult | null>;
  isDetecting: boolean;
  error: string | null;
  clearError: () => void;
}

export function useLocationDetection(): UseLocationDetectionReturn {
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const detectLocation = useCallback(async (): Promise<LocationResult | null> => {
    setIsDetecting(true);
    setError(null);

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      const errorMsg = 'Geolocation is not supported by this browser. Please enter your location manually.';
      setError(errorMsg);
      setIsDetecting(false);
      return null;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 25000, // Increased timeout for better reliability
      maximumAge: 60000 // Cache location for 1 minute
    };

    try {
      // Use Promise-based approach with proper error handling
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            console.log('GPS Position acquired:', {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              timestamp: new Date(pos.timestamp).toISOString()
            });
            resolve(pos);
          },
          (err) => {
            console.error('Geolocation error:', {
              code: err.code,
              message: err.message,
              PERMISSION_DENIED: err.PERMISSION_DENIED,
              POSITION_UNAVAILABLE: err.POSITION_UNAVAILABLE,
              TIMEOUT: err.TIMEOUT
            });
            reject(err);
          },
          options
        );
      });

      const { latitude, longitude, accuracy } = position.coords;

      // Validate coordinates
      if (!isValidCoordinate(latitude, longitude)) {
        throw new Error('Invalid coordinates received from GPS');
      }

      try {
        // Attempt reverse geocoding with retry logic
        const address = await reverseGeocode(latitude, longitude);
        
        const result: LocationResult = {
          lat: latitude,
          lng: longitude,
          address,
          accuracy
        };

        console.log('Location detection successful:', result);
        setIsDetecting(false);
        return result;

      } catch (geocodingError) {
        console.error('Reverse geocoding failed:', geocodingError);
        
        // Use coordinates as fallback address
        const fallbackAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        
        const result: LocationResult = {
          lat: latitude,
          lng: longitude,
          address: fallbackAddress,
          accuracy
        };

        setIsDetecting(false);
        return result;
      }

    } catch (geoError: any) {
      console.error('Geolocation failed:', geoError);
      
      let errorMessage = 'Unable to detect your location.';
      
      // Handle different types of geolocation errors
      if (geoError && typeof geoError.code === 'number') {
        switch (geoError.code) {
          case 1: // PERMISSION_DENIED
            errorMessage = 'Location access denied. Please enable location permissions in your browser settings and refresh the page.';
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMessage = 'Your location is unavailable. Please check your GPS settings and internet connection.';
            break;
          case 3: // TIMEOUT
            errorMessage = 'Location request timed out. Please try again or enter your location manually.';
            break;
          default:
            errorMessage = `Geolocation error (${geoError.code}): ${geoError.message || 'Unknown error'}`;
        }
      } else if (geoError && geoError.message) {
        errorMessage = `Location error: ${geoError.message}`;
      }
      
      setError(errorMessage);
      setIsDetecting(false);
      return null;
    }
  }, []);

  return {
    detectLocation,
    isDetecting,
    error,
    clearError
  };
}

// Helper function to validate coordinates
function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

// Helper function for reverse geocoding with retry logic
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Reverse geocoding attempt ${attempt}/${maxRetries}`);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&extratags=1`,
        {
          headers: {
            'User-Agent': 'YatraConnect/1.0 (Travel Social Platform)'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data && data.display_name) {
        // Format address nicely by taking first 3 components
        const addressParts = data.display_name.split(',');
        if (addressParts.length > 3) {
          return addressParts.slice(0, 3).join(', ').trim();
        }
        return data.display_name;
      }
      
      throw new Error('No address found in response');
      
    } catch (error) {
      console.error(`Reverse geocoding attempt ${attempt} failed:`, error);
      lastError = error as Error;
      
      // Wait before retry (except on last attempt)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  throw lastError || new Error('Reverse geocoding failed after all attempts');
}