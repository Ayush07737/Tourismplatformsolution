import { Calendar, MapPin, Users } from 'lucide-react';
import type { Trip } from '../../api/trips';

type TripCardProps = {
  trip: Trip;
};

export function TripCard({ trip }: TripCardProps) {
  const seatsLeft = trip.maxTravelers - trip.currentTravelers;

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase text-muted-foreground">
            Destination
          </p>
          <p className="text-lg font-semibold">
            {trip.destination.city}
          </p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">
          {trip.tripType || 'trip'}
        </span>
      </div>

      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-2">
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          <span>
            {trip.startLocation.city} → {trip.destination.city}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>
            {new Date(trip.startDate).toLocaleDateString()} -{' '}
            {new Date(trip.endDate).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>
            {trip.currentTravelers}/{trip.maxTravelers} travelers (
            {seatsLeft} seats left)
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mt-2 text-sm">
        <span className="font-medium text-primary">
          ₹{trip.budget.min.toLocaleString()} - ₹
          {trip.budget.max.toLocaleString()}
        </span>
        <span className="text-xs text-muted-foreground capitalize">
          {trip.genderPreference === 'any'
            ? 'Any gender'
            : trip.genderPreference}
        </span>
      </div>

      {trip.description && (
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {trip.description}
        </p>
      )}
    </div>
  );
}

