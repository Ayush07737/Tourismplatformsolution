import { supabase } from '../lib/supabase';

// Temporary localStorage implementation for testing
const USE_LOCAL_STORAGE = false;

export type LocationInput = {
  city: string;
  lat: number;
  lng: number;
};

export type TripPayload = {
  startLocation: LocationInput;
  destination: LocationInput;
  startDate: string; // ISO date
  endDate: string; // ISO date
  budget: { min: number; max: number };
  tripType: string;
  maxTravelers: number;
  preferences: string[];
  genderPreference: string;
  visibility: 'public' | 'invite-only';
  description?: string;
};

export type Trip = TripPayload & {
  id: string;
  createdBy: string;
  currentTravelers: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

// Local storage helpers
function getStoredTrips(): Trip[] {
  const stored = localStorage.getItem('trips');
  return stored ? JSON.parse(stored) : [];
}

function saveTrips(trips: Trip[]) {
  localStorage.setItem('trips', JSON.stringify(trips));
}

export async function createTrip(
  payload: TripPayload,
  userId: string,
): Promise<Trip> {
  if (USE_LOCAL_STORAGE) {
    const trips = getStoredTrips();
    const newTrip: Trip = {
      ...payload,
      id: Date.now().toString(),
      createdBy: userId,
      currentTravelers: 1,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    trips.push(newTrip);
    saveTrips(trips);
    return newTrip;
  }

  const tripData = {
    ...payload,
    createdBy: userId,
    currentTravelers: 1,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('trips')
    .insert([tripData])
    .select()
    .single();

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(error.message || 'Failed to create trip');
  }

  return data;
}

export async function fetchNearbyTrips(params: {
  lat?: number;
  lng?: number;
  radiusKm?: number;
} = {}): Promise<Trip[]> {
  if (USE_LOCAL_STORAGE) {
    const trips = getStoredTrips();
    return trips.filter(t => t.visibility === 'public');
  }

  try {
    let query = supabase
      .from('trips')
      .select('*')
      .eq('visibility', 'public');

    // For now, skip location filtering as it requires PostGIS or similar
    // In a real app, you'd use PostGIS functions for distance calculation

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      // If table doesn't exist, return empty array
      if (error.code === 'PGRST116') {
        console.warn('Trips table not found. Please run the SQL setup script.');
        return [];
      }
      throw new Error(error.message || 'Failed to fetch nearby trips');
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching trips:', err);
    return []; // Return empty array on error
  }
}

export async function searchTripsByDestination(
  destination: string,
): Promise<Trip[]> {
  if (USE_LOCAL_STORAGE) {
    const trips = getStoredTrips();
    return trips.filter(t => 
      t.visibility === 'public' && 
      t.destination.city.toLowerCase().includes(destination.toLowerCase())
    );
  }

  try {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('visibility', 'public')
      .ilike('destination->>city', `%${destination}%`);

    if (error) {
      console.error('Supabase error:', error);
      if (error.code === 'PGRST116') {
        console.warn('Trips table not found. Please run the SQL setup script.');
        return [];
      }
      throw new Error(error.message || 'Failed to search trips');
    }

    return data || [];
  } catch (err) {
    console.error('Error searching trips:', err);
    return [];
  }
}

export async function fetchUserTrips(userId: string): Promise<Trip[]> {
  if (USE_LOCAL_STORAGE) {
    const trips = getStoredTrips();
    return trips.filter(t => t.createdBy === userId);
  }

  try {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('createdBy', userId);

    if (error) {
      console.error('Supabase error:', error);
      if (error.code === 'PGRST116') {
        console.warn('Trips table not found. Please run the SQL setup script.');
        return [];
      }
      throw new Error(error.message || 'Failed to fetch user trips');
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching user trips:', err);
    return [];
  }
}

export async function deleteTrip(tripId: string): Promise<void> {
  if (USE_LOCAL_STORAGE) {
    const trips = getStoredTrips();
    const filtered = trips.filter(t => t.id !== tripId);
    saveTrips(filtered);
    return;
  }

  try {
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', tripId);

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(error.message || 'Failed to delete trip');
    }
  } catch (err) {
    console.error('Error deleting trip:', err);
    throw err;
  }
}
