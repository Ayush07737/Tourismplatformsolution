import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { MapPin, Star, Clock } from 'lucide-react';

interface DestinationCardProps {
  destination: {
    id: string;
    name: string;
    image: string;
    rating: number;
    location: string;
    duration: string;
    description: string;
    highlights: string[];
    price: string;
  };
  onClick: (destinationId: string) => void;
}

export function DestinationCard({ destination, onClick }: DestinationCardProps) {
  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onClick(destination.id)}
    >
      <div className="relative h-48">
        <ImageWithFallback
          src={destination.image}
          alt={destination.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          <Badge className="bg-black/70 text-white">
            {destination.price}
          </Badge>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium">{destination.name}</h3>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-sm">{destination.rating}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
          <MapPin className="h-3 w-3" />
          <span>{destination.location}</span>
        </div>
        
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <Clock className="h-3 w-3" />
          <span>{destination.duration}</span>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {destination.description}
        </p>
        
        <div className="flex flex-wrap gap-1">
          {destination.highlights.slice(0, 3).map((highlight) => (
            <Badge key={highlight} variant="outline" className="text-xs">
              {highlight}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}