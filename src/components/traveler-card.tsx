import { Card } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Star, MapPin, Calendar, Users } from 'lucide-react';

interface TravelerCardProps {
  traveler: {
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
  };
  onConnect: (travelerId: string) => void;
  onViewProfile: (travelerId: string) => void;
}

export function TravelerCard({ traveler, onConnect, onViewProfile }: TravelerCardProps) {
  return (
    <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={traveler.avatar} alt={traveler.name} />
          <AvatarFallback>{traveler.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium truncate">{traveler.name}</h3>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-sm">{traveler.rating}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <MapPin className="h-3 w-3" />
            <span>{traveler.destination}</span>
            <span>•</span>
            <span>{traveler.distance}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{traveler.travelDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{traveler.groupSize} spots</span>
            </div>
          </div>
          
          <p className="text-sm mt-2 line-clamp-2">{traveler.bio}</p>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {traveler.interests.slice(0, 3).map((interest) => (
              <Badge key={interest} variant="secondary" className="text-xs">
                {interest}
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              onClick={() => onConnect(traveler.id)}
              className="flex-1"
            >
              Connect
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewProfile(traveler.id)}
            >
              View Profile
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}