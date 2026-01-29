import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
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
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export function EnhancedLocationPicker({
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
  
  const autocompleteServiceRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

  const GOOGLE_MAPS_API_KEY = 'AIzaSyCBGpgtM-w8QOMnUrOMv09pU1HSHU2nyaU';
  const GEOAPIFY_API_KEY = '166b2d3cb4674416a65583283b3086c1';

  // Initialize Google Maps services
  useEffect(() => {
    const initializeServices = () => {
      if (window.google && window.google.maps) {
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        geocoderRef.current = new window.google.maps.Geocoder();
        
        // Create a temporary map for places service
        const tempMap = new window.google.maps.Map(document.createElement('div'));
        placesServiceRef.current = new window.google.maps.places.PlacesService(tempMap);
        return;
      }

      // Load Google Maps if not already loaded
      if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
        script.async = true;
        script.defer = true;
        script.onload = initializeServices;
        document.head.appendChild(script);
      }
    };

    initializeServices();
  }, [GOOGLE_MAPS_API_KEY]);

  // Search for places using Google Places API
  const searchPlaces = useCallback(async (query: string, isDestination: boolean = false) => {
    if (!query.trim() || query.length < 3 || !autocompleteServiceRef.current) {
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

      const request = {
        input: query,
        componentRestrictions: { country: 'in' }, // Restrict to India
        types: ['establishment', 'geocode'], // Include both places and addresses
      };

      autocompleteServiceRef.current.getPlacePredictions(request, (predictions: any, status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          const suggestions = predictions.map((prediction: any) => ({
            place_id: prediction.place_id,
            description: prediction.description,
            structured_formatting: prediction.structured_formatting
          }));

          if (isDestination) {
            setDestinationSuggestions(suggestions);
          } else {
            setCurrentLocationSuggestions(suggestions);
          }
        } else {
          if (isDestination) {
            setDestinationSuggestions([]);
          } else {
            setCurrentLocationSuggestions([]);
          }
        }
      });
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
  }, []);

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

  // Get place details and coordinates
  const getPlaceDetails = useCallback(async (placeId: string, isDestination: boolean = false) => {
    if (!placesServiceRef.current) return;

    try {
      const request = {
        placeId: placeId,
        fields: ['geometry', 'formatted_address', 'name']
      };

      placesServiceRef.current.getDetails(request, (place: any, status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const address = place.formatted_address;

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
        }
      });
    } catch (error) {
      console.error('Place details error:', error);
      toast.error('Failed to get place details');
    }
  }, [onLocationChange, onDestinationChange, onLocationCoordinatesChange]);

  // Auto-detect current location using GPS
  const detectCurrentLocation = useCallback(async () => {
    setIsDetectingLocation(true);
    setError(null);

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      // Get current position with high accuracy
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000
          }
        );
      });

      const { latitude: lat, longitude: lng } = position.coords;

      // Use Google Geocoding to get address
      if (geocoderRef.current) {
        geocoderRef.current.geocode(
          { location: { lat, lng } },
          (results: any, status: any) => {
            if (status === 'OK' && results[0]) {
              const address = results[0].formatted_address;
              setCurrentLocation(address);
              onLocationChange(address);
              onLocationCoordinatesChange({ lat, lng, address });
              setLocationDetected(true);
              setCurrentLocationSuggestions([]);
              toast.success('Location detected successfully!');
            } else {
              // Fallback to Geoapify reverse geocoding
              fetchAddressFromGeoapify(lat, lng);
            }
          }
        );
      } else {
        // Fallback to Geoapify if Google services not available
        fetchAddressFromGeoapify(lat, lng);
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
  }, [onLocationChange, onLocationCoordinatesChange]);

  // Fallback function using Geoapify reverse geocoding
  const fetchAddressFromGeoapify = useCallback(async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${GEOAPIFY_API_KEY}`
      );
      
      if (!response.ok) throw new Error('Reverse geocoding failed');
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const address = data.features[0].properties.formatted;
        setCurrentLocation(address);
        onLocationChange(address);
        onLocationCoordinatesChange({ lat, lng, address });
        setLocationDetected(true);
        toast.success('Location detected successfully!');
      } else {
        throw new Error('No address found');
      }
    } catch (error) {
      console.error('Geoapify reverse geocoding error:', error);
      // Use coordinates as fallback
      const coordinateAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setCurrentLocation(coordinateAddress);
      onLocationChange(coordinateAddress);
      onLocationCoordinatesChange({ lat, lng, address: coordinateAddress });
      setLocationDetected(true);
      toast.success('Location detected (coordinates only)');
    }
  }, [onLocationChange, onLocationCoordinatesChange, GEOAPIFY_API_KEY]);

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
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
                {currentLocationSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.place_id}
                    onClick={() => getPlaceDetails(suggestion.place_id, false)}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-muted focus:bg-muted focus:outline-none border-b border-border last:border-b-0"
                  >
                    <div className="font-medium text-foreground">
                      {suggestion.structured_formatting.main_text}
                    </div>
                    <div className="text-muted-foreground text-xs mt-1">
                      {suggestion.structured_formatting.secondary_text}
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
              {destinationSuggestions.map((suggestion) => (
                <button
                  key={suggestion.place_id}
                  onClick={() => getPlaceDetails(suggestion.place_id, true)}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-muted focus:bg-muted focus:outline-none border-b border-border last:border-b-0"
                >
                  <div className="font-medium text-foreground">
                    {suggestion.structured_formatting.main_text}
                  </div>
                  <div className="text-muted-foreground text-xs mt-1">
                    {suggestion.structured_formatting.secondary_text}
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