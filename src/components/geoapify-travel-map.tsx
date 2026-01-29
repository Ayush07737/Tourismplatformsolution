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
  Target,
  Home,
  User
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

interface GeoapifyTravelMapProps {
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
    L: any;
  }
}

export function GeoapifyTravelMap({
  travelers,
  userLocation,
  onTravelerClick,
  onLocationDetected,
  onTravelersUpdate,
  currentLocation,
  destination
}: GeoapifyTravelMapProps) {
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
  const [mapType, setMapType] = useState<'osm-bright' | 'osm-bright-grey' | 'osm-bright-smooth' | 'klokantech-basic' | 'osm-liberty' | 'maptiler-3d'>('osm-bright-smooth');
  const [routeVisible, setRouteVisible] = useState(false);
  const routeLayerRef = useRef<any>(null);

  const GEOAPIFY_API_KEY = '166b2d3cb4674416a65583283b3086c1';

  // Load Leaflet library
  const loadLeaflet = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (window.L) {
        resolve();
        return;
      }

      // Load CSS
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
      document.head.appendChild(cssLink);

      // Load JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Leaflet'));
      document.head.appendChild(script);
    });
  }, []);

  // Initialize map
  const initializeMap = useCallback(async () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    try {
      setIsLoading(true);
      setError(null);

      await loadLeaflet();

      // Default location (Mumbai, India)
      const defaultCenter: [number, number] = [19.076, 72.8777];
      const center: [number, number] = userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter;

      const map = window.L.map(mapRef.current, {
        center,
        zoom: 13,
        zoomControl: true,
      });

      // Add Geoapify tile layer
      const tileLayer = window.L.tileLayer(
        `https://maps.geoapify.com/v1/tile/${mapType}/{z}/{x}/{y}.png?&apiKey=${GEOAPIFY_API_KEY}`,
        {
          maxZoom: 20,
          attribution: '© Geoapify | © OpenStreetMap contributors'
        }
      );
      tileLayer.addTo(map);

      mapInstanceRef.current = map;

      // Add click listener for location pinning
      map.on('click', async (e: any) => {
        const { lat, lng } = e.latlng;
        setSelectedLocation({ lat, lng });
        
        // Get address using Geoapify reverse geocoding
        try {
          const response = await fetch(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${GEOAPIFY_API_KEY}`
          );
          
          if (!response.ok) throw new Error('Geocoding failed');
          
          const data = await response.json();
          
          if (data.features && data.features.length > 0) {
            const address = data.features[0].properties.formatted;
            onLocationDetected({ lat, lng, address });
            toast.success(`Location pinned: ${address}`);
          } else {
            onLocationDetected({ lat, lng, address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` });
            toast.success('Location pinned');
          }
        } catch (error) {
          console.error('Error getting address:', error);
          onLocationDetected({ lat, lng, address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` });
          toast.success('Location pinned');
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
  }, [userLocation, mapType, onLocationDetected, loadLeaflet, GEOAPIFY_API_KEY]);

  // Create custom marker icons
  const createMarkerIcon = useCallback((type: 'user' | 'traveler', color: string = '#52b74c') => {
    if (!window.L) return null;
    
    const iconUrl = type === 'user' 
      ? `https://api.geoapify.com/v1/icon?type=awesome&color=%2352b74c&size=x-large&icon=home&noWhiteCircle=true&scaleFactor=2&apiKey=${GEOAPIFY_API_KEY}`
      : `https://api.geoapify.com/v1/icon?type=awesome&color=%23bb3f73&size=large&icon=user&noWhiteCircle=true&scaleFactor=2&apiKey=${GEOAPIFY_API_KEY}`;
    
    return window.L.icon({
      iconUrl,
      iconSize: type === 'user' ? [40, 40] : [35, 35],
      iconAnchor: type === 'user' ? [20, 40] : [17.5, 35],
      popupAnchor: [0, -40]
    });
  }, [GEOAPIFY_API_KEY]);

  // Update map markers
  const updateMapMarkers = useCallback(async () => {
    if (!mapInstanceRef.current || !window.L) return;

    // Clear existing markers
    markersRef.current.forEach(marker => mapInstanceRef.current.removeLayer(marker));
    markersRef.current = [];

    // Add user location marker
    if (userLocation) {
      const userIcon = createMarkerIcon('user');
      if (userIcon) {
        const userMarker = window.L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-bold text-green-600 flex items-center gap-1">
                <span>🏠</span> Your Location
              </h3>
              <p class="text-sm">${currentLocation || 'Current Position'}</p>
            </div>
          `);

        markersRef.current.push(userMarker);
      }
    }

    // Add traveler markers
    travelers.forEach((traveler, index) => {
      const travelerIcon = createMarkerIcon('traveler');
      if (travelerIcon) {
        const marker = window.L.marker([traveler.lat, traveler.lng], { icon: travelerIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
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
              <div class="flex justify-between items-center text-xs mb-2">
                <span><strong>Destination:</strong> ${traveler.destination}</span>
                <span class="text-green-600">${traveler.distance}</span>
              </div>
              <div class="text-xs mb-2">
                <strong>Travel Date:</strong> ${traveler.travelDate}
              </div>
              <button onclick="window.handleTravelerClick('${traveler.id}')" 
                      class="w-full mt-2 bg-blue-500 text-white text-xs py-1 px-2 rounded hover:bg-blue-600">
                View Profile
              </button>
            </div>
          `);

        markersRef.current.push(marker);
      }
    });

    // Make traveler click handler globally available
    (window as any).handleTravelerClick = (travelerId: string) => {
      onTravelerClick(travelerId);
    };

  }, [travelers, userLocation, currentLocation, onTravelerClick, createMarkerIcon]);

  // Initialize map on mount
  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

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
      
      // Get address using Geoapify reverse geocoding
      try {
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${GEOAPIFY_API_KEY}`
        );
        
        if (!response.ok) throw new Error('Geocoding failed');
        
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          const address = data.features[0].properties.formatted;
          onLocationDetected({ lat, lng, address });
          
          // Center map on detected location
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([lat, lng], 15);
          }
          
          toast.success('Location detected successfully!');
        } else {
          throw new Error('No address found');
        }
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
  }, [onLocationDetected, GEOAPIFY_API_KEY]);

  // Search with Geoapify Autocomplete
  const searchLocation = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&apiKey=${GEOAPIFY_API_KEY}&limit=5&filter=countrycode:in`
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
      mapInstanceRef.current.setView([lat, lng], 15);
    }
    
    toast.success(`Location set: ${address}`);
  }, [onLocationDetected]);

  // Show route between current location and destination
  const showRoute = useCallback(async () => {
    if (!userLocation || !selectedLocation) {
      toast.error('Please select both current location and destination');
      return;
    }

    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/routing?waypoints=${userLocation.lat}%2C${userLocation.lng}%7C${selectedLocation.lat}%2C${selectedLocation.lng}&mode=drive&apiKey=${GEOAPIFY_API_KEY}`
      );
      
      if (!response.ok) throw new Error('Route calculation failed');
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0 && window.L && mapInstanceRef.current) {
        // Clear existing route
        if (routeLayerRef.current) {
          mapInstanceRef.current.removeLayer(routeLayerRef.current);
        }
        
        const route = data.features[0];
        const coordinates = route.geometry.coordinates[0].map((coord: [number, number]) => [coord[1], coord[0]]);
        
        routeLayerRef.current = window.L.polyline(coordinates, {
          color: '#3b82f6',
          weight: 4,
          opacity: 0.8
        }).addTo(mapInstanceRef.current);
        
        // Fit map to route bounds
        mapInstanceRef.current.fitBounds(routeLayerRef.current.getBounds(), { padding: [20, 20] });
        
        setRouteVisible(true);
        toast.success('Route calculated successfully!');
      } else {
        toast.error('Could not calculate route');
      }
    } catch (error) {
      console.error('Route calculation error:', error);
      toast.error('Error calculating route');
    }
  }, [userLocation, selectedLocation, GEOAPIFY_API_KEY]);

  // Clear route
  const clearRoute = useCallback(() => {
    if (routeLayerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
      setRouteVisible(false);
      toast.info('Route cleared');
    }
  }, []);

  // Change map type
  const changeMapType = useCallback((type: typeof mapType) => {
    setMapType(type);
    if (mapInstanceRef.current && window.L) {
      // Remove current tile layer
      mapInstanceRef.current.eachLayer((layer: any) => {
        if (layer.options && layer.options.attribution && layer.options.attribution.includes('Geoapify')) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });
      
      // Add new tile layer
      const tileLayer = window.L.tileLayer(
        `https://maps.geoapify.com/v1/tile/${type}/{z}/{x}/{y}.png?&apiKey=${GEOAPIFY_API_KEY}`,
        {
          maxZoom: 20,
          attribution: '© Geoapify | © OpenStreetMap contributors'
        }
      );
      tileLayer.addTo(mapInstanceRef.current);
    }
  }, [GEOAPIFY_API_KEY]);

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
                    <div className="font-medium">{suggestion.properties.name || suggestion.properties.formatted}</div>
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
            {([
              { key: 'osm-bright-smooth', label: 'Standard' },
              { key: 'osm-bright', label: 'Bright' },
              { key: 'osm-bright-grey', label: 'Grey' },
              { key: 'klokantech-basic', label: 'Basic' },
              { key: 'osm-liberty', label: 'Liberty' },
              { key: 'maptiler-3d', label: '3D' }
            ] as const).map((type) => (
              <Button
                key={type.key}
                onClick={() => changeMapType(type.key)}
                size="sm"
                variant={mapType === type.key ? 'default' : 'outline'}
                className="text-xs"
              >
                {type.label}
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
                <Home className="h-3 w-3 text-green-500" />
                <span>Your Location</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-pink-500" />
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