import { useEffect, useState } from 'react';
import {
  fetchNearbyTrips,
  searchTripsByDestination,
  type Trip,
} from '../api/trips';
import { TripCard } from '../components/trips/TripCard';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

export function ExploreTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function loadNearbyTrips() {
    try {
      setLoading(true);
      setError(null);

      let lat: number | undefined;
      let lng: number | undefined;

      if ('geolocation' in navigator) {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              lat = pos.coords.latitude;
              lng = pos.coords.longitude;
              resolve();
            },
            () => resolve(),
            { timeout: 5000 },
          );
        });
      }

      const data = await fetchNearbyTrips({ lat, lng, radiusKm: 50 });
      setTrips(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!destination.trim()) {
      loadNearbyTrips();
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await searchTripsByDestination(destination.trim());
      setTrips(data);
    } catch (err: any) {
      setError(err.message || 'Failed to search trips');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNearbyTrips();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-1">
            Discover Trips
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Trips are the primary way to find travel partners. Explore nearby
            trips or search by destination.
          </p>
        </div>
        <form onSubmit={handleSearch} className="flex w-full max-w-md gap-2">
          <Input
            placeholder="Search destination (e.g., Manali)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
          <Button type="submit">Search</Button>
        </form>
      </div>

      {loading && (
        <div className="py-12 text-center text-muted-foreground">
          Loading trips...
        </div>
      )}

      {error && (
        <div className="py-4 text-center text-red-500 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && trips.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          No trips found. Try posting a new trip or adjusting your search.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trips.map((trip) => (
          <TripCard key={trip._id} trip={trip} />
        ))}
      </div>
    </div>
  );
}

