import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  Search, 
  UserSearch as UserSearchIcon, 
  Star, 
  MapPin, 
  Users,
  MessageCircle,
  UserPlus,
  Loader2,
  X
} from 'lucide-react';

interface SearchedUser {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  level: string;
  location: string;
  mutualFriends: number;
  isOnline: boolean;
  bio: string;
  tripCount: number;
}

interface UserSearchProps {
  onUserSelect: (userId: string) => void;
  onConnect: (userId: string) => void;
  onMessage: (userId: string) => void;
}

// Mock search data - in real app this would come from an API
const mockUsers: SearchedUser[] = [
  {
    id: 'search-1',
    name: 'Amit Kumar',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    rating: 4.7,
    level: 'Explorer',
    location: 'Delhi, India',
    mutualFriends: 3,
    isOnline: true,
    bio: 'Adventure enthusiast and photographer',
    tripCount: 15
  },
  {
    id: 'search-2',
    name: 'Neha Sharma',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
    rating: 4.9,
    level: 'Wanderer',
    location: 'Mumbai, India',
    mutualFriends: 5,
    isOnline: false,
    bio: 'Food lover and culture explorer',
    tripCount: 22
  },
  {
    id: 'search-3',
    name: 'Rajesh Patel',
    avatar: 'https://images.unsplash.com/photo-1558730739-c69d33b2b5c3?w=150&h=150&fit=crop&crop=face',
    rating: 4.5,
    level: 'Adventurer',
    location: 'Bangalore, India',
    mutualFriends: 1,
    isOnline: true,
    bio: 'Mountain lover and trekking guide',
    tripCount: 18
  },
  {
    id: 'search-4',
    name: 'Kavya Singh',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face',
    rating: 4.8,
    level: 'Explorer',
    location: 'Chennai, India',
    mutualFriends: 2,
    isOnline: true,
    bio: 'Beach enthusiast and water sports lover',
    tripCount: 12
  },
  {
    id: '1', // Sarah Chen from nearby travelers
    name: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b17d0cd3?w=150&h=150&fit=crop&crop=face',
    rating: 4.8,
    level: 'Explorer',
    location: 'Goa, India',
    mutualFriends: 0,
    isOnline: true,
    bio: 'Adventure seeker who loves beaches',
    tripCount: 12
  },
  {
    id: '2', // Rahul Sharma from nearby travelers
    name: 'Rahul Sharma',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    rating: 4.6,
    level: 'Wanderer',
    location: 'Manali, India',
    mutualFriends: 1,
    isOnline: false,
    bio: 'Mountain lover planning winter trips',
    tripCount: 8
  },
  {
    id: '3', // Priya Patel from nearby travelers
    name: 'Priya Patel',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    rating: 4.9,
    level: 'Explorer',
    location: 'Kerala, India',
    mutualFriends: 4,
    isOnline: true,
    bio: 'Culture enthusiast exploring backwaters',
    tripCount: 15
  }
];

export function UserSearch({ onUserSelect, onConnect, onMessage }: UserSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchedUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const results = mockUsers.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.bio.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSearchResults(results);
      setIsSearching(false);
    }, 600);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Compact Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search travelers by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={!searchQuery.trim() || isSearching}
          size="icon"
          className="shrink-0"
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Search Results */}
      {isSearching && (
        <div className="text-center py-8 bg-muted/30 rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
          <p className="text-sm text-muted-foreground">Searching for travelers...</p>
        </div>
      )}

      {hasSearched && !isSearching && (
        <div className="space-y-3">
          {searchResults.length > 0 ? (
            <>
              <div className="flex items-center justify-between px-1">
                <p className="text-sm text-muted-foreground">
                  {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} found
                </p>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={clearSearch}
                  className="h-7 text-xs"
                >
                  Clear search
                </Button>
              </div>
              
              <div className="space-y-3">
                {searchResults.map((user) => (
                  <Card key={user.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="relative shrink-0">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          {user.isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-background" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium truncate text-sm">{user.name}</h4>
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">
                              {user.level}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <div className="flex items-center gap-0.5">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs">{user.rating}</span>
                            </div>
                            <span className="text-muted-foreground text-xs">•</span>
                            <span className="text-xs text-muted-foreground">{user.tripCount} trips</span>
                            {user.mutualFriends > 0 && (
                              <>
                                <span className="text-muted-foreground text-xs">•</span>
                                <div className="flex items-center gap-0.5">
                                  <Users className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">{user.mutualFriends} mutual</span>
                                </div>
                              </>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 mb-1.5">
                            <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="text-xs text-muted-foreground truncate">{user.location}</span>
                          </div>
                          
                          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                            {user.bio}
                          </p>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => onUserSelect(user.id)}
                              className="flex-1 h-8 text-xs"
                            >
                              View Profile
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onConnect(user.id)}
                              className="h-8 px-2"
                            >
                              <UserPlus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onMessage(user.id)}
                              className="h-8 px-2"
                            >
                              <MessageCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="p-6 text-center">
                <UserSearchIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h4 className="font-medium mb-1.5">No travelers found</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  We couldn't find anyone matching "{searchQuery}"
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearSearch}
                >
                  Try Different Search
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}