import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
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
  User,
  Satellite,
  Building,
  Car,
  Navigation2,
  Locate,
  Shield,
  CheckCircle
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

interface ProfessionalTravelMapProps {
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

export function ProfessionalTravelMap({
  travelers,
  userLocation,
  onTravelerClick,
  onLocationDetected,
  onTravelersUpdate,
  currentLocation,
  destination
}: ProfessionalTravelMapProps) {
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
  const [mapType, setMapType] = useState<'standard' | 'hybrid'>('standard');
  const [routeVisible, setRouteVisible] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const routeLayerRef = useRef<any>(null);
  const currentTileLayerRef = useRef<any>(null);
  const hybridOverlayRef = useRef<any>(null);
  const buildingOverlayRef = useRef<any>(null);
  const roofOverlayRef = useRef<any>(null);

  // API key for Geoapify services
  const GEOAPIFY_API_KEY = '166b2d3cb4674416a65583283b3086c1';

  // Enhanced map style configurations with ultra-detailed building visibility
  const mapStyles = {
    standard: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      buildingOverlayUrl: 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
      roofOverlayUrl: 'https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors',
      name: 'Standard',
      maxZoom: 20
    },
    hybrid: {
      url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      labelOverlayUrl: 'https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}',
      attribution: '© Google | © Satellite imagery providers',
      name: 'Hybrid',
      maxZoom: 22
    }
  };

  // Check location permission status
  const checkLocationPermission = useCallback(async () => {
    if (!navigator.permissions || !navigator.permissions.query) {
      setLocationPermission('unknown');
      return 'unknown';
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      setLocationPermission(permission.state as any);
      return permission.state;
    } catch (error) {
      console.error('Error checking location permission:', error);
      setLocationPermission('unknown');
      return 'unknown';
    }
  }, []);

  // Load Leaflet library with better error handling
  const loadLeaflet = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (window.L) {
        resolve();
        return;
      }

      // Load CSS first
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      cssLink.crossOrigin = '';
      document.head.appendChild(cssLink);

      // Load JS with integrity check
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.onload = () => {
        // Fix Leaflet default marker icons
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

  // Initialize map with enhanced error handling
  const initializeMap = useCallback(async () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    try {
      setIsLoading(true);
      setError(null);

      await loadLeaflet();

      // Default location (Mumbai, India) with better fallback
      const defaultCenter: [number, number] = [19.076, 72.8777];
      const center: [number, number] = userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter;

      const map = window.L.map(mapRef.current, {
        center,
        zoom: userLocation ? 16 : 12, // Higher zoom for better building visibility
        zoomControl: false,
        attributionControl: true,
        preferCanvas: false,
        renderer: window.L.canvas ? window.L.canvas() : undefined
      });

      // Add custom zoom controls
      const customZoomControl = window.L.control.zoom({
        position: 'bottomright'
      });
      customZoomControl.addTo(map);

      // Add scale control
      window.L.control.scale({
        position: 'bottomleft',
        metric: true,
        imperial: false
      }).addTo(map);

      // Add initial tile layer with enhanced error handling and fallbacks
      const currentStyle = mapStyles[mapType];
      
      const createTileLayer = (url: string, options: any) => {
        const layer = window.L.tileLayer(url, {
          ...options,
          errorTileUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2Y5ZmFmYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNHB4IiBmaWxsPSIjNmI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TG9hZGluZy4uLjwvdGV4dD48L3N2Zz4=',
          detectRetina: true
        });
        
        // Add error recovery
        layer.on('tileerror', (e: any) => {
          console.warn(`Tile load error for ${mapType}:`, e);
        });
        
        return layer;
      };

      // Create main tile layer
      currentTileLayerRef.current = createTileLayer(currentStyle.url, {
        maxZoom: currentStyle.maxZoom,
        attribution: currentStyle.attribution,
        subdomains: ['a', 'b', 'c']
      });

      currentTileLayerRef.current.addTo(map);
      
      // Add professional overlays for ultra-detailed building visibility
      if (mapType === 'hybrid') {
        // High-quality label overlay for hybrid view
        hybridOverlayRef.current = window.L.tileLayer(currentStyle.labelOverlayUrl, {
          maxZoom: 22,
          attribution: '© Google Labels',
          opacity: 0.8,
          className: 'hybrid-label-overlay'
        });
        
        // Professional styling for hybrid maps
        const style = document.createElement('style');
        style.textContent = `
          .hybrid-label-overlay {
            filter: contrast(1.3) brightness(1.1) saturate(1.1);
          }
          .building-detail-overlay {
            mix-blend-mode: multiply;
            filter: contrast(1.6) brightness(0.7) saturate(0.9);
          }
          .roof-outline-overlay {
            mix-blend-mode: overlay;
            filter: contrast(2.0) brightness(0.6) saturate(0.5);
            opacity: 0.4;
          }
        `;
        document.head.appendChild(style);
        
        hybridOverlayRef.current.addTo(map);
      } else if (mapType === 'standard') {
        // Multi-layer building enhancement for ultra-detailed standard view
        
        // Layer 1: Detailed building outlines
        if (currentStyle.buildingOverlayUrl) {
          buildingOverlayRef.current = window.L.tileLayer(currentStyle.buildingOverlayUrl, {
            maxZoom: 20,
            attribution: '© OpenStreetMap France',
            opacity: 0.4,
            className: 'building-detail-overlay'
          });
          buildingOverlayRef.current.addTo(map);
        }
        
        // Layer 2: Enhanced roof and structure visibility
        if (currentStyle.roofOverlayUrl) {
          roofOverlayRef.current = window.L.tileLayer(currentStyle.roofOverlayUrl, {
            maxZoom: 20,
            attribution: '© Wikimedia',
            opacity: 0.3,
            className: 'roof-outline-overlay'
          });
          roofOverlayRef.current.addTo(map);
        }
      }

      mapInstanceRef.current = map;

      // Add click listener for location pinning with improved accuracy
      map.on('click', async (e: any) => {
        const { lat, lng } = e.latlng;
        setSelectedLocation({ lat, lng });
        
        // Create accurate pin marker
        const pinIcon = window.L.divIcon({
          html: `
            <div style="
              background: linear-gradient(45deg, #3b82f6, #1d4ed8);
              width: 16px;
              height: 16px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
              position: relative;
            ">
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 6px;
                height: 6px;
                background: white;
                border-radius: 50%;
              "></div>
            </div>
          `,
          className: 'custom-pin-marker',
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });
        
        const tempMarker = window.L.marker([lat, lng], { 
          icon: pinIcon,
          zIndexOffset: 1000 
        }).addTo(map);
        
        // Enhanced reverse geocoding with better accuracy for precise addresses
        try {
          const response = await fetch(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&lang=en&limit=1&type=street&apiKey=${GEOAPIFY_API_KEY}`
          );
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            const result = data.results[0];
            
            // Create more accurate address from components
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
            
            // Fallback to formatted if no components
            if (!address) {
              address = result.formatted || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            }
            
            onLocationDetected({ lat, lng, address });
            toast.success(`📍 Location pinned: ${address}`);
            
            // Enhanced popup with precise details
            tempMarker.bindPopup(`
              <div style="padding: 12px; min-width: 240px; max-width: 320px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                  <div style="width: 12px; height: 12px; background: #3b82f6; border-radius: 50%;"></div>
                  <h4 style="font-weight: 600; font-size: 14px; color: #1f2937; margin: 0;">📍 Pinned Location</h4>
                </div>
                <p style="font-size: 13px; color: #4b5563; margin-bottom: 8px; line-height: 1.4; margin-top: 0;">${address}</p>
                <div style="font-size: 11px; color: #6b7280; line-height: 1.3;">
                  <div>📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}</div>
                  ${result.housenumber ? `<div>🏠 ${result.housenumber}</div>` : ''}
                  ${result.street ? `<div>🛣️ ${result.street}</div>` : ''}
                  ${result.suburb && result.suburb !== result.city ? `<div>🏘️ ${result.suburb}</div>` : ''}
                  ${result.city ? `<div>🏙️ ${result.city}</div>` : ''}
                </div>
              </div>
            `, {
              maxWidth: 350,
              className: 'location-popup'
            }).openPopup();
          } else {
            const address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            onLocationDetected({ lat, lng, address });
            toast.success('📍 Location pinned (coordinates)');
          }
        } catch (error) {
          console.error('Error getting address:', error);
          const address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          onLocationDetected({ lat, lng, address });
          toast.success('📍 Location pinned');
        }
        
        markersRef.current.push(tempMarker);
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

  // Auto-center map when user location changes from hero section
  useEffect(() => {
    if (mapInstanceRef.current && userLocation && mapLoaded) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 16, {
        duration: 2.5,
        easeLinearity: 0.25
      });
    }
  }, [userLocation, mapLoaded]);

  // Enhanced professional markers
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

  // Enhanced map markers update
  const updateMapMarkers = useCallback(async () => {
    if (!mapInstanceRef.current || !window.L || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      try {
        mapInstanceRef.current.removeLayer(marker);
      } catch (error) {
        console.warn('Error removing marker:', error);
      }
    });
    markersRef.current = [];

    // Add user location marker
    if (userLocation) {
      const userIcon = createProfessionalMarker('user');
      if (userIcon) {
        const userMarker = window.L.marker([userLocation.lat, userLocation.lng], { 
          icon: userIcon,
          zIndexOffset: 1000
        })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div class="p-4 min-w-72 max-w-sm">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                <h3 class="font-bold text-green-600 text-lg">Your Current Location</h3>
              </div>
              <p class="text-sm text-gray-700 mb-3 leading-relaxed">${currentLocation || 'Current Position'}</p>
              <div class="bg-gray-50 rounded-lg p-3 space-y-1 text-xs text-gray-600">
                <div class="flex justify-between">
                  <span class="font-semibold">Latitude:</span>
                  <span class="font-mono">${userLocation.lat.toFixed(6)}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-semibold">Longitude:</span>
                  <span class="font-mono">${userLocation.lng.toFixed(6)}</span>
                </div>
              </div>
              <div class="mt-3 pt-3 border-t border-gray-200">
                <div class="flex items-center gap-2 text-xs text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  <span class="font-semibold">Location verified with GPS</span>
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

    // Add traveler markers with enhanced popups
    travelers.forEach((traveler) => {
      const travelerIcon = createProfessionalMarker('traveler', traveler);
      if (travelerIcon) {
        const marker = window.L.marker([traveler.lat, traveler.lng], { 
          icon: travelerIcon,
          zIndexOffset: 500
        })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div style="padding: 16px; max-width: 320px; background: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
              <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px;">
                <img src="${traveler.avatar}" alt="${traveler.name}" 
                     style="width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 3px solid #dbeafe; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
                     onerror="this.src='https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'">
                <div style="flex: 1;">
                  <h3 style="font-weight: bold; color: #1f2937; font-size: 16px; margin-bottom: 4px;">${traveler.name}</h3>
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <span style="color: #f59e0b; font-size: 14px;">★</span>
                      <span style="font-size: 14px; font-weight: 600; color: #374151;">${traveler.rating}</span>
                    </div>
                    <span style="font-size: 12px; color: #6b7280;">•</span>
                    <span style="font-size: 12px; color: #6b7280;">${traveler.tripCount} trips</span>
                  </div>
                  <div style="font-size: 12px; font-weight: 600; color: #059669; background: #ecfdf5; padding: 4px 8px; border-radius: 9999px; display: inline-block;">
                    📍 ${traveler.distance} away
                  </div>
                </div>
              </div>
              
              <div style="margin-bottom: 16px;">
                <div style="background: #eff6ff; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
                  <div style="display: flex; align-items: center; gap: 8px; font-size: 14px; margin-bottom: 4px;">
                    <span>🎯</span>
                    <span style="font-weight: 600; color: #1e40af;">Destination</span>
                  </div>
                  <p style="color: #1d4ed8; font-weight: 500; margin: 0;">${traveler.destination}</p>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                  <div style="text-align: center; background: #f9fafb; border-radius: 8px; padding: 8px;">
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">📅 Travel Date</div>
                    <div style="font-size: 12px; font-weight: 600; color: #1f2937;">${traveler.travelDate}</div>
                  </div>
                  <div style="text-align: center; background: #f9fafb; border-radius: 8px; padding: 8px;">
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">👥 Group Size</div>
                    <div style="font-size: 12px; font-weight: 600; color: #1f2937;">${traveler.groupSize} people</div>
                  </div>
                </div>
              </div>
              
              <p style="font-size: 12px; color: #6b7280; margin-bottom: 16px; line-height: 1.5; margin-top: 0;">${traveler.bio.substring(0, 120)}${traveler.bio.length > 120 ? '...' : ''}</p>
              
              <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 16px;">
                ${traveler.interests.slice(0, 3).map(interest => 
                  `<span style="background: #dbeafe; color: #1e40af; font-size: 12px; padding: 4px 8px; border-radius: 9999px; font-weight: 500;">${interest}</span>`
                ).join('')}
                ${traveler.interests.length > 3 ? `<span style="font-size: 12px; color: #6b7280;">+${traveler.interests.length - 3} more</span>` : ''}
              </div>
              
              <div style="display: flex; gap: 8px;">
                <button onclick="window.handleTravelerClick('${traveler.id}')" 
                        style="flex: 1; background: #3b82f6; color: white; font-size: 12px; padding: 10px 12px; border-radius: 8px; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 4px rgba(59,130,246,0.2);"
                        onmouseover="this.style.background='#2563eb'; this.style.boxShadow='0 4px 6px rgba(59,130,246,0.3)';"
                        onmouseout="this.style.background='#3b82f6'; this.style.boxShadow='0 2px 4px rgba(59,130,246,0.2)';">
                  👤 View Profile
                </button>
                <button onclick="window.handleTravelerMessage('${traveler.id}')" 
                        style="flex: 1; background: #10b981; color: white; font-size: 12px; padding: 10px 12px; border-radius: 8px; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 4px rgba(16,185,129,0.2);"
                        onmouseover="this.style.background='#059669'; this.style.boxShadow='0 4px 6px rgba(16,185,129,0.3)';"
                        onmouseout="this.style.background='#10b981'; this.style.boxShadow='0 2px 4px rgba(16,185,129,0.2)';">
                  💬 Message
                </button>
              </div>
            </div>
          `, {
            maxWidth: 360,
            className: 'traveler-popup'
          });

        markersRef.current.push(marker);
      }
    });

    // Make handlers globally available
    (window as any).handleTravelerClick = (travelerId: string) => {
      onTravelerClick(travelerId);
    };

    (window as any).handleTravelerMessage = (travelerId: string) => {
      toast.success(`💬 Opening chat with traveler ${travelerId}`);
    };

  }, [travelers, userLocation, currentLocation, onTravelerClick, createProfessionalMarker, mapLoaded]);

  // Switch map types
  const switchMapType = useCallback(async (type: 'standard' | 'hybrid') => {
    if (!mapInstanceRef.current || type === mapType) return;
    
    setMapType(type);
    
    const newStyle = mapStyles[type];
    
    // Remove current tile layer
    mapInstanceRef.current.removeLayer(currentTileLayerRef.current);
    
    // Remove all overlays
    if (hybridOverlayRef.current) {
      mapInstanceRef.current.removeLayer(hybridOverlayRef.current);
      hybridOverlayRef.current = null;
    }
    if (buildingOverlayRef.current) {
      mapInstanceRef.current.removeLayer(buildingOverlayRef.current);
      buildingOverlayRef.current = null;
    }
    if (roofOverlayRef.current) {
      mapInstanceRef.current.removeLayer(roofOverlayRef.current);
      roofOverlayRef.current = null;
    }
    
    // Add new tile layer
    currentTileLayerRef.current = window.L.tileLayer(newStyle.url, {
      maxZoom: newStyle.maxZoom,
      attribution: newStyle.attribution,
      subdomains: ['a', 'b', 'c', 'd']
    });
    
    currentTileLayerRef.current.addTo(mapInstanceRef.current);
    
    // Add professional overlays based on map type
    if (type === 'hybrid') {
      // High-quality label overlay for hybrid view
      hybridOverlayRef.current = window.L.tileLayer(newStyle.labelOverlayUrl, {
        maxZoom: 22,
        attribution: '© Google Labels',
        opacity: 0.8,
        className: 'hybrid-label-overlay'
      });
      hybridOverlayRef.current.addTo(mapInstanceRef.current);
    } else if (type === 'standard') {
      // Multi-layer building enhancement for ultra-detailed standard view
      
      // Layer 1: Detailed building outlines
      if (newStyle.buildingOverlayUrl) {
        buildingOverlayRef.current = window.L.tileLayer(newStyle.buildingOverlayUrl, {
          maxZoom: 20,
          attribution: '© OpenStreetMap France',
          opacity: 0.4,
          className: 'building-detail-overlay'
        });
        buildingOverlayRef.current.addTo(mapInstanceRef.current);
      }
      
      // Layer 2: Enhanced roof and structure visibility
      if (newStyle.roofOverlayUrl) {
        roofOverlayRef.current = window.L.tileLayer(newStyle.roofOverlayUrl, {
          maxZoom: 20,
          attribution: '© Wikimedia',
          opacity: 0.3,
          className: 'roof-outline-overlay'
        });
        roofOverlayRef.current.addTo(mapInstanceRef.current);
      }
    }
    
    toast.success(`🗺️ Switched to ${newStyle.name} view`);
  }, [mapType, mapStyles]);

  // Enhanced search with better performance and precise results
  const searchLocation = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
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
    }
  }, [GEOAPIFY_API_KEY]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchLocation(searchValue);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchValue, searchLocation]);

  // Select search suggestion with precise addressing
  const selectSuggestion = useCallback((suggestion: any) => {
    const lat = suggestion.lat;
    const lng = suggestion.lon;
    
    // Create precise address from components
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
    
    // Fallback to formatted
    if (!address) {
      address = suggestion.formatted;
    }
    
    setSearchValue(address);
    setSuggestions([]);
    onLocationDetected({ lat, lng, address });
    
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 17, {
        duration: 2,
        easeLinearity: 0.25
      });
    }
    
    toast.success(`📍 Location set: ${address}`);
  }, [onLocationDetected]);

  // Enhanced route calculation
  const showRoute = useCallback(async () => {
    if (!userLocation || !selectedLocation) {
      toast.error('Please select both current location and destination');
      return;
    }

    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/routing?waypoints=${userLocation.lat}%2C${userLocation.lng}%7C${selectedLocation.lat}%2C${selectedLocation.lng}&mode=drive&format=json&apiKey=${GEOAPIFY_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`Route calculation failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0 && window.L && mapInstanceRef.current) {
        // Clear existing route
        if (routeLayerRef.current) {
          mapInstanceRef.current.removeLayer(routeLayerRef.current);
        }
        
        const route = data.features[0];
        const coordinates = route.geometry.coordinates[0].map((coord: [number, number]) => [coord[1], coord[0]]);
        
        // Create professional route styling
        routeLayerRef.current = window.L.polyline(coordinates, {
          color: '#3b82f6',
          weight: 6,
          opacity: 0.8,
          dashArray: '0',
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(mapInstanceRef.current);
        
        // Add route outline for better visibility
        const routeOutline = window.L.polyline(coordinates, {
          color: '#1e40af',
          weight: 8,
          opacity: 0.4,
          dashArray: '0',
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(mapInstanceRef.current);
        
        // Fit map to route bounds
        mapInstanceRef.current.fitBounds(routeLayerRef.current.getBounds(), { 
          padding: [30, 30] 
        });
        
        setRouteVisible(true);
        
        // Get route info
        const distance = (route.properties.distance / 1000).toFixed(1);
        const duration = Math.round(route.properties.time / 60);
        
        toast.success(`🗺️ Route calculated: ${distance}km, ${duration} min`);
        
        markersRef.current.push(routeOutline);
      } else {
        toast.error('Could not calculate route between selected points');
      }
    } catch (error) {
      console.error('Route calculation error:', error);
      toast.error('Error calculating route. Please try again.');
    }
  }, [userLocation, selectedLocation, GEOAPIFY_API_KEY]);

  // Clear route
  const clearRoute = useCallback(() => {
    if (routeLayerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
      setRouteVisible(false);
      toast.info('🗺️ Route cleared');
    }
  }, []);

  // Enhanced map type switching with hybrid overlay support
  const changeMapType = useCallback((type: typeof mapType) => {
    if (type === mapType) return;
    
    setMapType(type);
    if (mapInstanceRef.current && window.L && currentTileLayerRef.current) {
      const newStyle = mapStyles[type];
      
      // Remove current tile layer
      mapInstanceRef.current.removeLayer(currentTileLayerRef.current);
      
      // Remove hybrid overlay if it exists
      if (hybridOverlayRef.current) {
        mapInstanceRef.current.removeLayer(hybridOverlayRef.current);
        hybridOverlayRef.current = null;
      }
      
      // Create new tile layer with enhanced error handling
      const createTileLayer = (url: string, options: any) => {
        const layer = window.L.tileLayer(url, {
          ...options,
          errorTileUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2Y5ZmFmYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNHB4IiBmaWxsPSIjNmI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TWFwIExvYWRpbmc8L3RleHQ+PC9zdmc+',
          detectRetina: true
        });
        
        layer.on('tileerror', (e: any) => {
          console.warn(`Tile load error for ${type}:`, e);
        });
        
        return layer;
      };
      
      // Add new tile layer
      currentTileLayerRef.current = createTileLayer(newStyle.url, {
        maxZoom: newStyle.maxZoom,
        attribution: newStyle.attribution,
        subdomains: ['a', 'b', 'c']
      });
      
      currentTileLayerRef.current.addTo(mapInstanceRef.current);
      
      // Add street overlay for hybrid view with professional styling
      if (type === 'hybrid') {
        hybridOverlayRef.current = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors',
          opacity: 0.7,
          className: 'hybrid-street-overlay'
        });
        hybridOverlayRef.current.addTo(mapInstanceRef.current);
      }
      
      toast.info(`🗺️ Switched to ${newStyle.name} view`);
    }
  }, [mapType, mapStyles]);

  // Initialize map on mount
  useEffect(() => {
    initializeMap();
    
    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (error) {
          console.warn('Error cleaning up map:', error);
        }
      }
    };
  }, [initializeMap]);

  // Update markers when travelers change
  useEffect(() => {
    if (mapLoaded) {
      updateMapMarkers();
    }
  }, [mapLoaded, updateMapMarkers]);

  if (error) {
    return (
      <Card className="w-full h-[600px]">
        <CardContent className="flex items-center justify-center h-full">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
            <Button 
              onClick={() => {
                setError(null);
                initializeMap();
              }}
              className="mt-3 w-full"
              size="sm"
            >
              Try Again
            </Button>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-xl border-0 overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MapIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent text-lg">
              Travel Map
            </h3>
            <p className="text-sm text-gray-600 font-normal">Find and connect with nearby travelers</p>
          </div>
          <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-800 font-semibold">
            {travelers.length} travelers nearby
          </Badge>
        </CardTitle>
        
        {/* Enhanced Search and Controls */}
        <div className="space-y-4">
          <div className="relative">
            <Label htmlFor="location-search" className="text-sm font-semibold text-gray-700 mb-2 block">
              Search Location
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="location-search"
                type="text"
                placeholder="Search for places, addresses, landmarks..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10 pr-4 border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
              />
            </div>
            
            {suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => selectSuggestion(suggestion)}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="font-medium text-gray-800 mb-1">
                      {suggestion.address_line1 || suggestion.formatted?.split(',')[0]}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {suggestion.formatted}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={showRoute}
              disabled={!userLocation || !selectedLocation}
              size="sm"
              variant="outline"
              className="border-blue-200 text-blue-600 hover:bg-blue-50 font-semibold"
            >
              <Navigation2 className="h-4 w-4 mr-2" />
              Show Route
            </Button>

            {routeVisible && (
              <Button
                onClick={clearRoute}
                size="sm"
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                Clear Route
              </Button>
            )}
          </div>

          {/* Streamlined Map Type Controls */}
          <div className="flex flex-wrap gap-2">
            {([
              { key: 'standard', label: 'Standard', icon: MapIcon },
              { key: 'hybrid', label: 'Hybrid', icon: Layers }
            ] as const).map((type) => {
              const IconComponent = type.icon;
              return (
                <Button
                  key={type.key}
                  onClick={() => changeMapType(type.key)}
                  size="sm"
                  variant={mapType === type.key ? 'default' : 'outline'}
                  className={`text-xs font-semibold transition-all ${
                    mapType === type.key 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="h-3 w-3 mr-1" />
                  {type.label}
                </Button>
              );
            })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 relative">
        {isLoading && (
          <div className="absolute inset-0 z-30 bg-white/95 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-gray-600 font-medium">Loading professional map...</p>
              <p className="text-xs text-gray-500 mt-1">Please wait while we initialize the map</p>
            </div>
          </div>
        )}
        
        <div
          ref={mapRef}
          className="w-full h-[600px] bg-gray-100"
          style={{ minHeight: '600px' }}
        />
        
        {/* Enhanced Legend */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-3 shadow-lg">
          <h4 className="font-semibold text-sm mb-2 text-gray-800">Map Legend</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              <span className="text-gray-700">Your Location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
              <span className="text-gray-700">Travel Partners</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-400 rounded-full border-2 border-white shadow-sm"></div>
              <span className="text-gray-700">Pinned Location</span>
            </div>
          </div>
        </div>

        {/* Enhanced Instructions */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-3 shadow-lg">
          <div className="text-xs text-gray-600 space-y-1">
            <div className="font-semibold text-gray-800 mb-1">Map Controls</div>
            <div>• Click to pin locations</div>
            <div>• Scroll to zoom</div>
            <div>• Click markers for profiles</div>
            {userLocation && (
              <div className="pt-1 mt-2 border-t border-gray-200">
                <div className="text-green-600 font-medium">📍 Location Active</div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}