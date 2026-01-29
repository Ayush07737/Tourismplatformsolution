import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { TravelerCard } from './traveler-card';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TravelerData {
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

interface ResponsiveTravelerListProps {
  travelers: TravelerData[];
  onConnect: (travelerId: string) => void;
  onViewProfile: (travelerId: string) => void;
}

export function ResponsiveTravelerList({ travelers, onConnect, onViewProfile }: ResponsiveTravelerListProps) {
  const [showAll, setShowAll] = useState(false);
  
  // Show 3 travelers initially, rest on "Show More"
  const initialCount = 3;
  const visibleTravelers = showAll ? travelers : travelers.slice(0, initialCount);
  const hasMoreTravelers = travelers.length > initialCount;

  if (travelers.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="space-y-2">
          <p className="text-muted-foreground">No travelers found in your area</p>
          <p className="text-sm text-muted-foreground">
            Try detecting your location to find nearby travel partners
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop/Tablet View: Scrollable for more than 3 */}
      <div className="hidden md:block">
        <div className={`space-y-6 ${travelers.length > 3 ? 'max-h-[500px] overflow-y-auto pr-2' : ''}`}>
          {travelers.map((traveler) => (
            <TravelerCard
              key={traveler.id}
              traveler={traveler}
              onConnect={onConnect}
              onViewProfile={onViewProfile}
            />
          ))}
        </div>
      </div>

      {/* Mobile View: Show More/Less functionality */}
      <div className="block md:hidden">
        <div className="space-y-4">
          {visibleTravelers.map((traveler) => (
            <TravelerCard
              key={traveler.id}
              traveler={traveler}
              onConnect={onConnect}
              onViewProfile={onViewProfile}
            />
          ))}
          
          {hasMoreTravelers && (
            <Card className="p-4">
              <Button
                variant="outline"
                onClick={() => setShowAll(!showAll)}
                className="w-full flex items-center justify-center gap-2"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Show More ({travelers.length - initialCount} more travelers)
                  </>
                )}
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Traveler Count Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
        <span>
          Showing {visibleTravelers.length} of {travelers.length} travelers
        </span>
        {travelers.length > 0 && (
          <span>
            Within 10km radius
          </span>
        )}
      </div>
    </div>
  );
}