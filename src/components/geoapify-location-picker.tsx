import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner@2.0.3';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Crosshair,
  AlertCircle,
  Loader2,
  CheckCircle,
  Clock
} from 'lucide-react';

interface LocationPickerProps {
  onLocationChange: (location: string) => void;
  onDestinationChange: (destination: string) => void;
  onLocationCoordinatesChange: (location: { lat: number; lng: number; address: string }) => void;
}

interface LocationSuggestion {
  properties: {
    formatted: string;
    name?: string;
    place_id?: string;
  };
  geometry: {
    coordinates: [number, number];
  };
}

export function GeoapifyLocationPicker({
  onLocationChange,
  onDestinationChange,
  onLocationCoordinatesChange
}: LocationPickerProps) {
  const [currentLocation, setCurrentLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [currentLocationSuggestions, setCurrentLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<LocationSuggestion[]>([]);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingCurrentSuggestions, setIsLoadingCurrentSuggestions] = useState(false);
  const [isLoadingDestinationSuggestions, setIsLoadingDestinationSuggestions] = useState(false);

  const GEOAPIFY_API_KEY = '166b2d3cb4674416a65583283b3086c1';

  // Search for places using Geoapify Autocomplete API
  const searchPlaces = useCallback(async (query: string, isDestination: boolean = false) => {
    if (!query.trim() || query.length < 3) {
      if (isDestination) {
        setDestinationSuggestions([]);
      } else {
        setCurrentLocationSuggestions([]);
      }
      return;
    }

    try {
      if (isDestination) {
        setIsLoadingDestinationSuggestions(true);
      } else {
        setIsLoadingCurrentSuggestions(true);
      }

      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&apiKey=${GEOAPIFY_API_KEY}&limit=5&filter=countrycode:in&format=json&type=street,amenity,building`
      );
      
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      const suggestions = data.features || [];

      if (isDestination) {
        setDestinationSuggestions(suggestions);
      } else {
        setCurrentLocationSuggestions(suggestions);
      }
    } catch (error) {
      console.error('Places search error:', error);
      if (isDestination) {
        setDestinationSuggestions([]);
      } else {
        setCurrentLocationSuggestions([]);
      }
    } finally {
      if (isDestination) {
        setIsLoadingDestinationSuggestions(false);
      } else {
        setIsLoadingCurrentSuggestions(false);
      }
    }
  }, [GEOAPIFY_API_KEY]);

  // Debounced search for current location
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchPlaces(currentLocation, false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [currentLocation, searchPlaces]);

  // Debounced search for destination
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchPlaces(destination, true);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [destination, searchPlaces]);

  // Select a suggestion
  const selectSuggestion = useCallback((suggestion: LocationSuggestion, isDestination: boolean = false) => {
    const [lng, lat] = suggestion.geometry.coordinates;
    const address = suggestion.properties.formatted;

    if (isDestination) {
      setDestination(address);
      setDestinationSuggestions([]);
      onDestinationChange(address);
    } else {
      setCurrentLocation(address);
      setCurrentLocationSuggestions([]);
      onLocationChange(address);
      onLocationCoordinatesChange({ lat, lng, address });
      setLocationDetected(true);
    }

    toast.success(`${isDestination ? 'Destination' : 'Location'} selected: ${address}`);
  }, [onLocationChange, onDestinationChange, onLocationCoordinatesChange]);

  // Auto-detect current location using GPS
  const detectCurrentLocation = useCallback(async () => {
    setIsDetectingLocation(true);
    setError(null);

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      // Check if user has denied location permissions previously
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        if (permission.state === 'denied') {
          throw new Error('Location access denied. Please enable location services and reload the page.');
        }
      }

      // Get current position with high accuracy
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (error) => {
            console.error('Geolocation error:', error);
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 60000
          }
        );
      });

      const { latitude: lat, longitude: lng } = position.coords;

      // Use Geoapify reverse geocoding to get detailed address
      try {
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&lang=en&limit=1&type=street&apiKey=${GEOAPIFY_API_KEY}`
        );
        
        if (!response.ok) throw new Error('Reverse geocoding failed');
        
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          const result = data.results[0];
          
          // Create detailed address from components
          let address = '';
          if (result.housenumber && result.street) {
            address = `${result.housenumber} ${result.street}`;
          } else if (result.street) {
            address = result.street;
          } else if (result.suburb) {
            address = result.suburb;
          }
          
          if (result.city && result.city !== result.suburb) {
            address += address ? `, ${result.city}` : result.city;
          }
          
          if (result.state) {
            address += address ? `, ${result.state}` : result.state;
          }
          
          if (result.country) {
            address += address ? `, ${result.country}` : result.country;
          }
          
          // Fallback to formatted if no components
          if (!address) {
            address = result.formatted || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          }
          
          setCurrentLocation(address);
          onLocationChange(address);
          onLocationCoordinatesChange({ lat, lng, address });
          setLocationDetected(true);
          setCurrentLocationSuggestions([]);
          toast.success('📍 Location detected with full address!');
        } else {
          throw new Error('No address found');
        }
      } catch (geocodeError) {
        console.error('Geocoding error:', geocodeError);
        // Use coordinates as fallback
        const coordinateAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setCurrentLocation(coordinateAddress);
        onLocationChange(coordinateAddress);
        onLocationCoordinatesChange({ lat, lng, address: coordinateAddress });
        setLocationDetected(true);
        toast.success('Location detected (coordinates only)');
      }

    } catch (error: any) {
      console.error('Location detection error:', error);
      let errorMessage = 'Failed to detect location';
      
      if (error.code === 1) {
        errorMessage = 'Location access denied. Please enable location services and reload the page.';
      } else if (error.code === 2) {
        errorMessage = 'Location unavailable. Please check your GPS signal.';
      } else if (error.code === 3) {
        errorMessage = 'Location request timed out. Please try again.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsDetectingLocation(false);
    }
  }, [onLocationChange, onLocationCoordinatesChange, GEOAPIFY_API_KEY]);

  // Try IP-based location detection as fallback
  const detectLocationByIP = useCallback(async () => {
    try {
      const response = await fetch(`https://api.geoapify.com/v1/ipinfo?&apiKey=${GEOAPIFY_API_KEY}`);
      
      if (!response.ok) throw new Error('IP location failed');
      
      const data = await response.json();
      
      if (data.location && data.location.latitude && data.location.longitude) {
        const { latitude: lat, longitude: lng } = data.location;
        const address = `${data.city || ''}, ${data.state || ''}, ${data.country || ''}`.replace(/^,\s*|,\s*$/g, '');
        
        setCurrentLocation(address);
        onLocationChange(address);
        onLocationCoordinatesChange({ lat, lng, address });
        setLocationDetected(true);
        toast.success('Location detected using IP address');
      }
    } catch (error) {
      console.error('IP location detection failed:', error);
      toast.error('Could not detect location automatically');
    }
  }, [onLocationChange, onLocationCoordinatesChange, GEOAPIFY_API_KEY]);

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="link" 
              size="sm" 
              onClick={detectLocationByIP}
              className="ml-2 p-0 h-auto"
            >
              Try IP detection
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Current Location */}
      <div className="space-y-2">
        <Label htmlFor="current-location" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Current Location
          {locationDetected && <CheckCircle className="h-4 w-4 text-green-500" />}
        </Label>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="current-location"
              type="text"
              placeholder="Enter your current location..."
              value={currentLocation}
              onChange={(e) => {
                setCurrentLocation(e.target.value);
                setLocationDetected(false);
              }}
              className="pr-10"
            />
            {isLoadingCurrentSuggestions && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
            
            {currentLocationSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                {currentLocationSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => selectSuggestion(suggestion, false)}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-muted focus:bg-muted focus:outline-none border-b border-border last:border-b-0"
                  >
                    <div className="font-medium text-foreground">
                      {suggestion.properties.name || suggestion.properties.formatted.split(',')[0]}
                    </div>
                    <div className="text-muted-foreground text-xs mt-1">
                      {suggestion.properties.formatted}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <Button
            onClick={detectCurrentLocation}
            disabled={isDetectingLocation}
            variant="outline"
            size="icon"
            className="shrink-0"
          >
            {isDetectingLocation ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Crosshair className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {isDetectingLocation && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Detecting your location...
          </div>
        )}
      </div>

      {/* Destination */}
      <div className="space-y-2">
        <Label htmlFor="destination" className="flex items-center gap-2">
          <Navigation className="h-4 w-4" />
          Destination
        </Label>
        
        <div className="relative">
          <Input
            id="destination"
            type="text"
            placeholder="Where do you want to go?"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="pr-10"
          />
          {isLoadingDestinationSuggestions && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
          
          {destinationSuggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
              {destinationSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => selectSuggestion(suggestion, true)}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-muted focus:bg-muted focus:outline-none border-b border-border last:border-b-0"
                >
                  <div className="font-medium text-foreground">
                    {suggestion.properties.name || suggestion.properties.formatted.split(',')[0]}
                  </div>
                  <div className="text-muted-foreground text-xs mt-1">
                    {suggestion.properties.formatted}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex flex-wrap gap-2">
        {locationDetected && (
          <Badge variant="secondary" className="text-xs">
            <CheckCircle className="h-3 w-3 mr-1" />
            Location Detected
          </Badge>
        )}
        {destination && (
          <Badge variant="secondary" className="text-xs">
            <Navigation className="h-3 w-3 mr-1" />
            Destination Set
          </Badge>
        )}
      </div>

      {/* Quick Actions */}
      <div className="pt-2">
        <p className="text-xs text-muted-foreground mb-2">Quick tips:</p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Click the crosshair button for GPS location detection</li>
          <li>• Type at least 3 characters to see suggestions</li>
          <li>• Select from suggestions for accurate coordinates</li>
          <li>• Enable location services for best results</li>
        </ul>
      </div>
    </div>
  );
}