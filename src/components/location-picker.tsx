import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { LocationStatus } from './location-status';
import { MapPin, Navigation, Loader2, AlertCircle } from 'lucide-react';

interface LocationPickerProps {
  onLocationChange: (location: string) => void;
  onDestinationChange: (destination: string) => void;
  onLocationCoordinatesChange?: (coords: { lat: number; lng: number; address: string }) => void;
}

const popularCities = [
  'Mumbai, India',
  'Delhi, India',
  'Bangalore, India',
  'Chennai, India',
  'Kolkata, India',
  'Hyderabad, India',
  'Pune, India',
  'Ahmedabad, India',
  'Jaipur, India',
  'Kochi, India'
];

const popularDestinations = [
  'Goa',
  'Kerala',
  'Rajasthan',
  'Himachal Pradesh',
  'Uttarakhand',
  'Kashmir',
  'Andaman & Nicobar',
  'Sikkim',
  'Northeast India',
  'Karnataka',
  'Tamil Nadu',
  'Gujarat'
];

export function LocationPicker({ onLocationChange, onDestinationChange, onLocationCoordinatesChange }: LocationPickerProps) {
  const [currentLocation, setCurrentLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'detecting' | 'success' | 'error' | 'fallback' | null>(null);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);

  const detectLocation = async () => {
    setIsDetecting(true);
    setLocationStatus('detecting');
    
    if (!navigator.geolocation) {
      setIsDetecting(false);
      setLocationStatus('fallback');
      setCurrentLocation('Mumbai, India');
      onLocationChange('Mumbai, India');
      
      // Clear status after 5 seconds
      setTimeout(() => setLocationStatus(null), 5000);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 60000
    };

    try {
      // Use Promise-based approach for better error handling
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });

      const { latitude, longitude, accuracy } = position.coords;
      console.log(`GPS Location: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`);
      
      try {
        // Enhanced reverse geocoding with better error handling
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&extratags=1`,
          {
            headers: {
              'User-Agent': 'YatraConnect/1.0'
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`Geocoding failed: ${response.status}`);
        }
        
        const data = await response.json();
        let address = '';
        
        if (data && data.display_name) {
          // Format address nicely
          const parts = data.display_name.split(',');
          if (parts.length > 3) {
            address = parts.slice(0, 3).join(', ').trim();
          } else {
            address = data.display_name;
          }
        } else {
          address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        }
        
        setCurrentLocation(address);
        onLocationChange(address);
        
        // Pass coordinates to parent component for map
        if (onLocationCoordinatesChange) {
          onLocationCoordinatesChange({ lat: latitude, lng: longitude, address });
        }
        
        setLocationStatus('success');
        console.log('Location successfully detected:', address);
        
      } catch (geocodingError) {
        console.error('Geocoding error:', geocodingError);
        const fallbackAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        setCurrentLocation(fallbackAddress);
        onLocationChange(fallbackAddress);
        
        if (onLocationCoordinatesChange) {
          onLocationCoordinatesChange({ lat: latitude, lng: longitude, address: fallbackAddress });
        }
        
        setLocationStatus('success');
      }
      
    } catch (error: any) {
      console.error('Geolocation error:', error);
      
      let errorMessage = 'Unable to detect location';
      let fallbackLocation = 'Mumbai, India';
      
      // Handle GeolocationPositionError with proper numeric codes
      if (error && typeof error.code === 'number') {
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            errorMessage = 'Location access denied. Please enable location permissions in your browser settings.';
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMessage = 'Location information is unavailable. Please check your GPS and internet connection.';
            break;
          case 3: // TIMEOUT
            errorMessage = 'Location request timed out. Please try again or enter location manually.';
            break;
          default:
            errorMessage = `Geolocation error (code ${error.code}): ${error.message || 'Unknown error'}`;
        }
      } else if (error && error.message) {
        errorMessage = `Location error: ${error.message}`;
      } else {
        errorMessage = 'Location detection failed. Please try again or enter your location manually.';
      }
      
      setCurrentLocation(fallbackLocation);
      onLocationChange(fallbackLocation);
      setLocationStatus('error');
      
      // Show error for longer time
      setTimeout(() => setLocationStatus(null), 8000);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleLocationSubmit = (value: string) => {
    setCurrentLocation(value);
    onLocationChange(value);
  };

  const handleDestinationSubmit = (value: string) => {
    setDestination(value);
    onDestinationChange(value);
  };

  return (
    <div className="space-y-4">
      {/* Location Status */}
      <LocationStatus status={locationStatus} />
      
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Your Location
        </Label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder={isDetecting ? "Detecting..." : "Enter your current location"}
              value={currentLocation}
              onChange={(e) => handleLocationSubmit(e.target.value)}
              onFocus={() => setShowLocationSuggestions(true)}
              className="flex-1"
              disabled={isDetecting}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={detectLocation}
              disabled={isDetecting}
              title="Auto-detect location"
            >
              {isDetecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {!currentLocation && (
            <div className="text-sm">
              <p className="text-muted-foreground mb-2">Popular cities:</p>
              <div className="flex flex-wrap gap-1">
                {popularCities.slice(0, 4).map((city) => (
                  <Button
                    key={city}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      setCurrentLocation(city);
                      onLocationChange(city);
                    }}
                  >
                    {city.split(',')[0]}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Destination
        </Label>
        <div className="space-y-2">
          <Input
            placeholder="Where do you want to go?"
            value={destination}
            onChange={(e) => handleDestinationSubmit(e.target.value)}
            onFocus={() => setShowDestinationSuggestions(true)}
          />
          
          {!destination && (
            <div className="text-sm">
              <p className="text-muted-foreground mb-2">Popular destinations:</p>
              <div className="flex flex-wrap gap-1">
                {popularDestinations.slice(0, 6).map((dest) => (
                  <Button
                    key={dest}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      setDestination(dest);
                      onDestinationChange(dest);
                    }}
                  >
                    {dest}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}