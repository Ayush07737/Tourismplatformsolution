import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner@2.0.3';
import { 
  MapPin, 
  Search, 
  Map as MapIcon,
  AlertCircle,
  Satellite,
  Building,
  CheckCircle,
  Loader2
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

interface EnhancedProfessionalMapProps {
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

export function EnhancedProfessionalMap({
  travelers,
  userLocation,
  onTravelerClick,
  onLocationDetected,
  onTravelersUpdate,
  currentLocation,
  destination
}: EnhancedProfessionalMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [mapType, setMapType] = useState<'standard' | 'hybrid'>('standard');
  const [isSearching, setIsSearching] = useState(false);
  const currentTileLayerRef = useRef<any>(null);
  const hybridOverlayRef = useRef<any>(null);

  // API key for Geoapify services
  const GEOAPIFY_API_KEY = '166b2d3cb4674416a65583283b3086c1';

  // Enhanced map style configurations
  const mapStyles = {
    standard: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors',
      name: 'Standard',
      maxZoom: 19
    },
    hybrid: {
      url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      labelOverlayUrl: 'https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}',
      attribution: '© Google | © Satellite imagery providers',
      name: 'Hybrid',
      maxZoom: 22
    }
  };

  // Load Leaflet library
  const loadLeaflet = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (window.L) {
        resolve();
        return;
      }

      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      cssLink.crossOrigin = '';
      document.head.appendChild(cssLink);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.onload = () => {
        if (window.L) {
          delete (window.L.Icon.Default.prototype as any)._getIconUrl;
          window.L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          });
        }
        resolve();
      };
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

      const defaultCenter: [number, number] = [19.076, 72.8777];
      const center: [number, number] = userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter;

      const map = window.L.map(mapRef.current, {
        center,
        zoom: userLocation ? 16 : 12,
        zoomControl: false,
        attributionControl: true,
        preferCanvas: false
      });

      window.L.control.zoom({
        position: 'bottomright'
      }).addTo(map);

      window.L.control.scale({
        position: 'bottomleft',
        metric: true,
        imperial: false
      }).addTo(map);

      const currentStyle = mapStyles[mapType];
      
      currentTileLayerRef.current = window.L.tileLayer(currentStyle.url, {
        maxZoom: currentStyle.maxZoom,
        attribution: currentStyle.attribution,
        subdomains: ['a', 'b', 'c'],
        detectRetina: true,
        errorTileUrl: '',
        noWrap: false,
        tileSize: 256,
        zoomOffset: 0
      });

      // Handle tile loading errors to prevent white squares
      currentTileLayerRef.current.on('tileerror', function(error: any) {
        console.warn('Tile loading error:', error);
        // Optionally retry with a different server
        if (error.tile && error.tile.src) {
          const originalSrc = error.tile.src;
          // Retry with a different subdomain if available
          if (originalSrc.includes('//a.')) {
            error.tile.src = originalSrc.replace('//a.', '//b.');
          } else if (originalSrc.includes('//b.')) {
            error.tile.src = originalSrc.replace('//b.', '//c.');
          } else if (originalSrc.includes('//c.')) {
            error.tile.src = originalSrc.replace('//c.', '//a.');
          }
        }
      });

      currentTileLayerRef.current.addTo(map);
      
      // Add overlays only for hybrid view to prevent white squares in standard view
      if (mapType === 'hybrid') {
        hybridOverlayRef.current = window.L.tileLayer(currentStyle.labelOverlayUrl, {
          maxZoom: 22,
          attribution: '© Google Labels',
          opacity: 0.8,
          className: 'hybrid-label-overlay'
        });
        
        // Add CSS for hybrid map styling only
        if (!document.getElementById('map-styles')) {
          const style = document.createElement('style');
          style.id = 'map-styles';
          style.textContent = `
            .hybrid-label-overlay {
              filter: contrast(1.3) brightness(1.1) saturate(1.1);
            }
            .leaflet-tile {
              max-width: none !important;
              max-height: none !important;
              opacity: 1 !important;
              transition: opacity 0.2s;
            }
            .leaflet-tile-container {
              overflow: hidden;
            }
            .leaflet-tile-loaded {
              opacity: 1 !important;
            }
            .leaflet-container {
              background: #f8fafc !important;
            }
          `;
          document.head.appendChild(style);
        }
        
        hybridOverlayRef.current.addTo(map);
      }

      mapInstanceRef.current = map;

      // Add click listener for location pinning
      map.on('click', async (e: any) => {
        const { lat, lng } = e.latlng;
        
        try {
          const response = await fetch(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&lang=en&limit=1&type=street&apiKey=${GEOAPIFY_API_KEY}`
          );
          
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            const result = data.results[0];
            
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
            
            if (!address) {
              address = result.formatted || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            }
            
            onLocationDetected({ lat, lng, address });
            toast.success(`📍 Location pinned: ${address}`);
          }
        } catch (error) {
          const address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          onLocationDetected({ lat, lng, address });
          toast.success('📍 Location pinned');
        }
      });

      setMapLoaded(true);
      await updateMapMarkers();
      
    } catch (error) {
      console.error('Error initializing map:', error);
      setError('Failed to initialize map. Please check your internet connection and try again.');
      toast.error('Map initialization failed');
    } finally {
      setIsLoading(false);
    }
  }, [userLocation, mapType, onLocationDetected, loadLeaflet, GEOAPIFY_API_KEY]);

  // Switch map types
  const switchMapType = useCallback(async (type: 'standard' | 'hybrid') => {
    if (!mapInstanceRef.current || type === mapType) return;
    
    setMapType(type);
    
    const newStyle = mapStyles[type];
    
    mapInstanceRef.current.removeLayer(currentTileLayerRef.current);
    
    // Remove existing overlays
    if (hybridOverlayRef.current) {
      mapInstanceRef.current.removeLayer(hybridOverlayRef.current);
      hybridOverlayRef.current = null;
    }
    
    currentTileLayerRef.current = window.L.tileLayer(newStyle.url, {
      maxZoom: newStyle.maxZoom,
      attribution: newStyle.attribution,
      subdomains: ['a', 'b', 'c'],
      detectRetina: true,
      errorTileUrl: '',
      noWrap: false,
      tileSize: 256,
      zoomOffset: 0
    });
    
    currentTileLayerRef.current.addTo(mapInstanceRef.current);
    
    // Add overlays only for hybrid view to prevent white squares in standard view
    if (type === 'hybrid') {
      hybridOverlayRef.current = window.L.tileLayer(newStyle.labelOverlayUrl, {
        maxZoom: 22,
        attribution: '© Google Labels',
        opacity: 0.8,
        className: 'hybrid-label-overlay'
      });
      hybridOverlayRef.current.addTo(mapInstanceRef.current);
    }
    
    toast.success(`🗺️ Switched to ${newStyle.name} view`);
  }, [mapType, mapStyles]);

  // Create professional markers
  const createProfessionalMarker = useCallback((type: 'user' | 'traveler', traveler?: Traveler) => {
    if (!window.L) return null;
    
    if (type === 'user') {
      return window.L.divIcon({
        html: `
          <div style="
            background: linear-gradient(45deg, #10b981, #059669);
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 4px solid white;
            box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
            position: relative;
            animation: pulse 2s infinite;
          ">
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 10px;
              height: 10px;
              background: white;
              border-radius: 50%;
            "></div>
          </div>
          <style>
            @keyframes pulse {
              0% { box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4); }
              50% { box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6); }
              100% { box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4); }
            }
          </style>
        `,
        className: 'user-location-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
    } else {
      const colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#f97316', '#06b6d4'];
      const colorIndex = traveler?.name.charCodeAt(0) % colors.length || 0;
      const color = colors[colorIndex];
      
      return window.L.divIcon({
        html: `
          <div style="
            background: ${color};
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            cursor: pointer;
            transition: transform 0.2s ease;
          "
          onmouseover="this.style.transform='scale(1.1)'"
          onmouseout="this.style.transform='scale(1)'"
          >
            <div style="
              background: white;
              width: 22px;
              height: 22px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              font-weight: bold;
              color: ${color};
            ">
              ${traveler?.name.charAt(0).toUpperCase() || 'T'}
            </div>
            <div style="
              position: absolute;
              bottom: -10px;
              left: 50%;
              transform: translateX(-50%);
              background: ${color};
              color: white;
              padding: 2px 6px;
              border-radius: 10px;
              font-size: 9px;
              font-weight: bold;
              white-space: nowrap;
              box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            ">
              ★${traveler?.rating || '4.8'}
            </div>
          </div>
        `,
        className: 'traveler-marker',
        iconSize: [42, 52],
        iconAnchor: [21, 26]
      });
    }
  }, []);

  // Update map markers
  const updateMapMarkers = useCallback(async () => {
    if (!mapInstanceRef.current || !window.L || !mapLoaded) return;

    markersRef.current.forEach(marker => {
      try {
        mapInstanceRef.current.removeLayer(marker);
      } catch (error) {
        console.warn('Error removing marker:', error);
      }
    });
    markersRef.current = [];

    if (userLocation) {
      const userIcon = createProfessionalMarker('user');
      if (userIcon) {
        const userMarker = window.L.marker([userLocation.lat, userLocation.lng], { 
          icon: userIcon,
          zIndexOffset: 1000
        })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div style="padding: 16px; min-width: 240px; max-width: 320px;">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <div style="width: 16px; height: 16px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite;"></div>
                <h3 style="font-weight: bold; color: #10b981; font-size: 16px; margin: 0;">Your Current Location</h3>
              </div>
              <p style="font-size: 14px; color: #4b5563; margin-bottom: 12px; line-height: 1.5; margin-top: 0;">${currentLocation || 'Current Position'}</p>
              <div style="background: #f3f4f6; border-radius: 8px; padding: 12px; font-size: 12px; color: #6b7280;">
                <div style="display: flex; justify-between; margin-bottom: 4px;">
                  <span style="font-weight: 600;">Latitude:</span>
                  <span style="font-family: monospace;">${userLocation.lat.toFixed(6)}</span>
                </div>
                <div style="display: flex; justify-between;">
                  <span style="font-weight: 600;">Longitude:</span>
                  <span style="font-family: monospace;">${userLocation.lng.toFixed(6)}</span>
                </div>
              </div>
            </div>
          `, {
            maxWidth: 350,
            className: 'user-location-popup'
          });

        markersRef.current.push(userMarker);
      }
    }

    travelers.forEach((traveler) => {
      const travelerIcon = createProfessionalMarker('traveler', traveler);
      if (travelerIcon) {
        const marker = window.L.marker([traveler.lat, traveler.lng], { 
          icon: travelerIcon,
          zIndexOffset: 500
        })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div style="padding: 16px; max-width: 300px; background: white; border-radius: 12px;">
              <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
                <img src="${traveler.avatar}" alt="${traveler.name}" 
                     style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 3px solid #dbeafe;"
                     onerror="this.src='https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'">
                <div style="flex: 1;">
                  <h3 style="font-weight: bold; color: #1f2937; font-size: 16px; margin-bottom: 4px;">${traveler.name}</h3>
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                    <span style="color: #f59e0b; font-size: 14px;">★${traveler.rating}</span>
                    <span style="font-size: 12px; color: #6b7280;">• ${traveler.tripCount} trips</span>
                  </div>
                  <div style="font-size: 12px; font-weight: 600; color: #059669; background: #ecfdf5; padding: 4px 8px; border-radius: 9999px; display: inline-block;">
                    📍 ${traveler.distance} away
                  </div>
                </div>
              </div>
              
              <div style="background: #eff6ff; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
                <div style="font-size: 14px; margin-bottom: 4px;">
                  <span style="font-weight: 600; color: #1e40af;">🎯 ${traveler.destination}</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; color: #6b7280;">
                  <div>📅 ${traveler.travelDate}</div>
                  <div>👥 ${traveler.groupSize} people</div>
                </div>
              </div>
              
              <div style="display: flex; gap: 8px;">
                <button onclick="window.handleTravelerClick('${traveler.id}')" 
                        style="flex: 1; background: #3b82f6; color: white; font-size: 12px; padding: 8px 12px; border-radius: 6px; font-weight: 600; border: none; cursor: pointer;">
                  👤 View Profile
                </button>
                <button onclick="window.handleTravelerMessage('${traveler.id}')" 
                        style="flex: 1; background: #10b981; color: white; font-size: 12px; padding: 8px 12px; border-radius: 6px; font-weight: 600; border: none; cursor: pointer;">
                  💬 Message
                </button>
              </div>
            </div>
          `, {
            maxWidth: 340,
            className: 'traveler-popup'
          });

        markersRef.current.push(marker);
      }
    });

    (window as any).handleTravelerClick = (travelerId: string) => {
      onTravelerClick(travelerId);
    };

  }, [travelers, userLocation, currentLocation, onTravelerClick, createProfessionalMarker, mapLoaded]);

  // Search functionality
  const searchLocation = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&limit=6&filter=countrycode:in&format=json&lang=en&type=street,amenity,building&apiKey=${GEOAPIFY_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }
      
      const data = await response.json();
      setSuggestions(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }, [GEOAPIFY_API_KEY]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchLocation(searchValue);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchValue, searchLocation]);

  // Select search suggestion
  const selectSuggestion = useCallback((suggestion: any) => {
    const lat = suggestion.lat;
    const lng = suggestion.lon;
    
    let address = '';
    if (suggestion.housenumber && suggestion.street) {
      address = `${suggestion.housenumber} ${suggestion.street}`;
    } else if (suggestion.street) {
      address = suggestion.street;
    } else if (suggestion.name) {
      address = suggestion.name;
    }
    
    if (suggestion.city && suggestion.city !== suggestion.suburb) {
      address += address ? `, ${suggestion.city}` : suggestion.city;
    }
    
    if (suggestion.state) {
      address += address ? `, ${suggestion.state}` : suggestion.state;
    }

    if (!address) {
      address = suggestion.formatted || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }

    setSearchValue('');
    setSuggestions([]);
    onLocationDetected({ lat, lng, address });
    
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 16);
    }
    
    toast.success(`📍 Location selected: ${address}`);
  }, [onLocationDetected]);

  // Initialize map on mount
  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  // Update markers when travelers or user location change
  useEffect(() => {
    if (mapLoaded) {
      updateMapMarkers();
    }
  }, [travelers, userLocation, mapLoaded, updateMapMarkers]);

  // Auto-center map when user location changes
  useEffect(() => {
    if (mapInstanceRef.current && userLocation && mapLoaded) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 16, {
        duration: 2.5,
        easeLinearity: 0.25
      });
    }
  }, [userLocation, mapLoaded]);

  return (
    <Card className="w-full h-[620px] flex flex-col overflow-hidden">
      <CardHeader className="space-y-3 flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapIcon className="h-5 w-5" />
            Professional Travel Map
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant={mapType === 'standard' ? 'default' : 'ghost'}
              onClick={() => switchMapType('standard')}
              className="px-2 py-1 text-xs h-7"
            >
              <Building className="h-3 w-3 mr-1" />
              Standard
            </Button>
            <Button
              size="sm"
              variant={mapType === 'hybrid' ? 'default' : 'ghost'}
              onClick={() => switchMapType('hybrid')}
              className="px-2 py-1 text-xs h-7"
            >
              <Satellite className="h-3 w-3 mr-1" />
              Hybrid
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for places, addresses, landmarks..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10 pr-10 h-9"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          
          {suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => selectSuggestion(suggestion)}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-muted focus:bg-muted focus:outline-none border-b border-border last:border-b-0"
                >
                  <div className="font-medium text-foreground">
                    {suggestion.name || suggestion.street || suggestion.formatted?.split(',')[0]}
                  </div>
                  <div className="text-muted-foreground text-xs mt-1">
                    {suggestion.formatted}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 relative">
        {error ? (
          <Alert className="m-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground">Loading professional map...</p>
            </div>
          </div>
        )}

        <div 
          ref={mapRef} 
          className="w-full h-full"
          style={{ background: '#f8fafc' }}
        />
      </CardContent>
    </Card>
  );
}