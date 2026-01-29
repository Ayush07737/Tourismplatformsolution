import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
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
  Star, 
  Users, 
  Calendar,
  Crosshair,
  Route,
  Layers,
  Map as MapIcon,
  AlertCircle,
  Target
} from 'lucide-react';

interface Traveler {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  destination: string;
  travelDate: string;
  groupSize: number;
  distance: string;
  bio: string;
  tripCount: number;
  interests: string[];
  lat: number;
  lng: number;
}

interface GoogleMapsTravelMapProps {
  travelers: Traveler[];
  userLocation: { lat: number; lng: number } | null;
  onTravelerClick: (travelerId: string) => void;
  onLocationDetected: (location: { lat: number; lng: number; address: string }) => void;
  onTravelersUpdate: (updatedTravelers: Traveler[]) => void;
  currentLocation: string;
  destination: string;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export function GoogleMapsTravelMap({
  travelers,
  userLocation,
  onTravelerClick,
  onLocationDetected,
  onTravelersUpdate,
  currentLocation,
  destination
}: GoogleMapsTravelMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');
  const [routeVisible, setRouteVisible] = useState(false);
  const directionsServiceRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);

  const GOOGLE_MAPS_API_KEY = 'AIzaSyCBGpgtM-w8QOMnUrOMv09pU1HSHU2nyaU';
  const GEOAPIFY_API_KEY = '166b2d3cb4674416a65583283b3086c1';

  // Initialize Google Maps
  const initializeMap = useCallback(async () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    try {
      setIsLoading(true);
      setError(null);

      // Default location (Mumbai, India)
      const defaultCenter = { lat: 19.076, lng: 72.8777 };
      const center = userLocation || defaultCenter;

      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 13,
        center,
        mapTypeId: mapType,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: window.google.maps.ControlPosition.TOP_CENTER,
        },
        zoomControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        gestureHandling: 'cooperative',
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          },
          {
            featureType: 'transit',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          }
        ]
      });

      mapInstanceRef.current = map;

      // Initialize directions service and renderer
      directionsServiceRef.current = new window.google.maps.DirectionsService();
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        suppressMarkers: false,
        draggable: true
      });
      directionsRendererRef.current.setMap(map);

      // Add click listener for location pinning
      map.addListener('click', async (event: any) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        
        setSelectedLocation({ lat, lng });
        
        // Get address using Google Geocoding
        try {
          const geocoder = new window.google.maps.Geocoder();
          const response = await new Promise((resolve, reject) => {
            geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
              if (status === 'OK' && results[0]) {
                resolve(results[0]);
              } else {
                reject(new Error('Geocoding failed'));
              }
            });
          });
          
          const address = (response as any).formatted_address;
          onLocationDetected({ lat, lng, address });
          toast.success(`Location pinned: ${address}`);
        } catch (error) {
          console.error('Error getting address:', error);
          onLocationDetected({ lat, lng, address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` });
        }
      });

      setMapLoaded(true);
      await updateMapMarkers();
      
    } catch (error) {
      console.error('Error initializing map:', error);
      setError('Failed to initialize map. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  }, [userLocation, mapType, onLocationDetected]);

  // Update map markers
  const updateMapMarkers = useCallback(async () => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add user location marker
    if (userLocation) {
      const userMarker = new window.google.maps.Marker({
        position: userLocation,
        map: mapInstanceRef.current,
        title: 'Your Location',
        icon: {
          url: `https://api.geoapify.com/v1/icon?type=awesome&color=%2352b74c&size=x-large&icon=home&noWhiteCircle=true&scaleFactor=2&apiKey=${GEOAPIFY_API_KEY}`,
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 40)
        },
        zIndex: 1000
      });

      markersRef.current.push(userMarker);

      // Create info window for user location
      const userInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-bold text-green-600">Your Location</h3>
            <p class="text-sm">${currentLocation || 'Current Position'}</p>
          </div>
        `
      });

      userMarker.addListener('click', () => {
        userInfoWindow.open(mapInstanceRef.current, userMarker);
      });
    }

    // Add traveler markers
    travelers.forEach((traveler, index) => {
      const marker = new window.google.maps.Marker({
        position: { lat: traveler.lat, lng: traveler.lng },
        map: mapInstanceRef.current,
        title: traveler.name,
        icon: {
          url: `https://api.geoapify.com/v1/icon?type=awesome&color=%23bb3f73&size=large&icon=user&noWhiteCircle=true&scaleFactor=2&apiKey=${GEOAPIFY_API_KEY}`,
          scaledSize: new window.google.maps.Size(35, 35),
          anchor: new window.google.maps.Point(17.5, 35)
        },
        zIndex: 100 + index
      });

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-3 max-w-xs">
            <div class="flex items-center gap-2 mb-2">
              <img src="${traveler.avatar}" alt="${traveler.name}" class="w-8 h-8 rounded-full object-cover">
              <div>
                <h3 class="font-semibold text-sm">${traveler.name}</h3>
                <div class="flex items-center gap-1">
                  <span class="text-yellow-500 text-xs">★</span>
                  <span class="text-xs">${traveler.rating}</span>
                </div>
              </div>
            </div>
            <p class="text-xs text-gray-600 mb-2">${traveler.bio.substring(0, 100)}...</p>
            <div class="flex flex-wrap gap-1 mb-2">
              ${traveler.interests.slice(0, 2).map(interest => 
                `<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${interest}</span>`
              ).join('')}
            </div>
            <div class="flex justify-between items-center text-xs">
              <span>${traveler.destination}</span>
              <span class="text-green-600">${traveler.distance}</span>
            </div>
            <button onclick="handleTravelerClick('${traveler.id}')" 
                    class="w-full mt-2 bg-blue-500 text-white text-xs py-1 px-2 rounded hover:bg-blue-600">
              View Profile
            </button>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
    });

    // Make traveler click handler globally available
    (window as any).handleTravelerClick = (travelerId: string) => {
      onTravelerClick(travelerId);
    };

  }, [travelers, userLocation, currentLocation, onTravelerClick, GEOAPIFY_API_KEY]);

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      script.onerror = () => {
        setError('Failed to load Google Maps API. Please check your API key.');
        setIsLoading(false);
      };
      
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, [initializeMap, GOOGLE_MAPS_API_KEY]);

  // Update markers when travelers change
  useEffect(() => {
    if (mapLoaded) {
      updateMapMarkers();
    }
  }, [mapLoaded, updateMapMarkers]);

  // Auto-detect location
  const detectCurrentLocation = useCallback(async () => {
    setIsDetectingLocation(true);
    setError(null);

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
          }
        );
      });

      const { latitude: lat, longitude: lng } = position.coords;
      
      // Get address using Google Geocoding
      try {
        const geocoder = new window.google.maps.Geocoder();
        const response = await new Promise((resolve, reject) => {
          geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
            if (status === 'OK' && results[0]) {
              resolve(results[0]);
            } else {
              reject(new Error('Geocoding failed'));
            }
          });
        });
        
        const address = (response as any).formatted_address;
        onLocationDetected({ lat, lng, address });
        
        // Center map on detected location
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter({ lat, lng });
          mapInstanceRef.current.setZoom(15);
        }
        
        toast.success('Location detected successfully!');
      } catch (geocodeError) {
        console.error('Geocoding error:', geocodeError);
        onLocationDetected({ lat, lng, address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` });
        toast.success('Location detected (coordinates only)');
      }

    } catch (error: any) {
      console.error('Location detection error:', error);
      let errorMessage = 'Failed to detect location';
      
      if (error.code === 1) {
        errorMessage = 'Location access denied. Please enable location services.';
      } else if (error.code === 2) {
        errorMessage = 'Location unavailable. Please try again.';
      } else if (error.code === 3) {
        errorMessage = 'Location request timed out. Please try again.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsDetectingLocation(false);
    }
  }, [onLocationDetected]);

  // Search with Geoapify Autocomplete
  const searchLocation = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&apiKey=${GEOAPIFY_API_KEY}&limit=5`
      );
      
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setSuggestions(data.features || []);
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
    }
  }, [GEOAPIFY_API_KEY]);

  // Handle search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchLocation(searchValue);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchValue, searchLocation]);

  // Select search suggestion
  const selectSuggestion = useCallback((feature: any) => {
    const [lng, lat] = feature.geometry.coordinates;
    const address = feature.properties.formatted;
    
    setSearchValue(address);
    setSuggestions([]);
    onLocationDetected({ lat, lng, address });
    
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter({ lat, lng });
      mapInstanceRef.current.setZoom(15);
    }
    
    toast.success(`Location set: ${address}`);
  }, [onLocationDetected]);

  // Show route between current location and destination
  const showRoute = useCallback(async () => {
    if (!userLocation || !selectedLocation || !directionsServiceRef.current || !directionsRendererRef.current) {
      toast.error('Please select both current location and destination');
      return;
    }

    try {
      const request = {
        origin: userLocation,
        destination: selectedLocation,
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
      };

      directionsServiceRef.current.route(request, (result: any, status: any) => {
        if (status === 'OK') {
          directionsRendererRef.current.setDirections(result);
          setRouteVisible(true);
          toast.success('Route calculated successfully!');
        } else {
          console.error('Directions request failed:', status);
          toast.error('Could not calculate route');
        }
      });
    } catch (error) {
      console.error('Route calculation error:', error);
      toast.error('Error calculating route');
    }
  }, [userLocation, selectedLocation]);

  // Clear route
  const clearRoute = useCallback(() => {
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setDirections({ routes: [] });
      setRouteVisible(false);
      toast.info('Route cleared');
    }
  }, []);

  // Change map type
  const changeMapType = useCallback((type: 'roadmap' | 'satellite' | 'hybrid' | 'terrain') => {
    setMapType(type);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setMapTypeId(type);
    }
  }, []);

  if (error) {
    return (
      <Card className="w-full h-[600px]">
        <CardContent className="flex items-center justify-center h-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <MapIcon className="h-5 w-5" />
          Travel Map
          <Badge variant="secondary" className="ml-2">
            {travelers.length} travelers nearby
          </Badge>
        </CardTitle>
        
        {/* Search and Controls */}
        <div className="space-y-3">
          <div className="relative">
            <Label htmlFor="location-search">Search Location</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="location-search"
                type="text"
                placeholder="Search for a place..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => selectSuggestion(suggestion)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-muted focus:bg-muted focus:outline-none"
                  >
                    <div className="font-medium">{suggestion.properties.name}</div>
                    <div className="text-muted-foreground text-xs">
                      {suggestion.properties.formatted}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={detectCurrentLocation}
              disabled={isDetectingLocation}
              size="sm"
              variant="outline"
            >
              <Crosshair className="h-4 w-4 mr-2" />
              {isDetectingLocation ? 'Detecting...' : 'Detect Location'}
            </Button>

            <Button
              onClick={showRoute}
              disabled={!userLocation || !selectedLocation}
              size="sm"
              variant="outline"
            >
              <Route className="h-4 w-4 mr-2" />
              Show Route
            </Button>

            {routeVisible && (
              <Button
                onClick={clearRoute}
                size="sm"
                variant="outline"
              >
                Clear Route
              </Button>
            )}
          </div>

          {/* Map Type Controls */}
          <div className="flex flex-wrap gap-1">
            {(['roadmap', 'satellite', 'hybrid', 'terrain'] as const).map((type) => (
              <Button
                key={type}
                onClick={() => changeMapType(type)}
                size="sm"
                variant={mapType === type ? 'default' : 'outline'}
                className="text-xs"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 z-10 bg-background/80 flex items-center justify-center">
              <div className="text-center">
                <Skeleton className="w-8 h-8 rounded-full mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            </div>
          )}
          
          <div
            ref={mapRef}
            className="w-full h-[600px] rounded-lg overflow-hidden"
            style={{ minHeight: '600px' }}
          />
          
          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
            <h4 className="font-semibold text-sm mb-2">Map Legend</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Your Location</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                <span>Travel Partners</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-3 w-3 text-blue-500" />
                <span>Pinned Location</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}