import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { TravelStories } from './travel-stories';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Star,
  Coins,
  Award,
  Settings,
  MessageCircle,
  UserPlus,
  Heart,
  Camera,
  Clock,
  TrendingUp,
  Globe,
  Map
} from 'lucide-react';

interface FullProfilePageProps {
  user: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    level: string;
    followers: number;
    following?: number;
    yatraCoins: number;
    bio: string;
    location: string;
    joinDate: string;
    tripCount: number;
    interests: string[];
    gallery: Array<{
      url: string;
      likes?: number;
      timestamp?: string;
      location?: string;
    } | string>;
    experiences: Array<{
      id: string;
      destination: string;
      date: string;
      rating: number;
      photos: string[];
      description: string;
      likes?: number;
      timestamp?: string;
      duration?: string;
      travelWith?: string[];
    }>;
    reviews: Array<{
      id: string;
      reviewer: string;
      reviewerAvatar?: string;
      rating: number;
      comment: string;
      date: string;
      timestamp?: string;
      tripDestination?: string;
    }>;
    stories?: Array<{
      id: string;
      image: string;
      location: string;
      timestamp: string;
      caption?: string;
    }>;
    badges?: Array<{
      id: string;
      name: string;
      icon: string;
      description: string;
    }>;
    travelStats?: {
      countriesVisited: number;
      citiesExplored: number;
      totalDistance: string;
      favTransport: string;
    };
  };
  isOwnProfile?: boolean;
  onBack: () => void;
  onEdit?: () => void;
  onConnect?: (userId: string) => void;
  onMessage?: (userId: string) => void;
}

export function FullProfilePage({ 
  user, 
  isOwnProfile = false,
  onBack,
  onEdit,
  onConnect,
  onMessage
}: FullProfilePageProps) {
  const [activeTab, setActiveTab] = useState('experiences');
  const [showAllGallery, setShowAllGallery] = useState(false);

  const galleryItemsToShow = showAllGallery ? user.gallery.length : 12;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">{user.name}</h1>
              <p className="text-sm text-muted-foreground">@{user.name.toLowerCase().replace(' ', '')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-8 mb-6">
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="mt-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  <Award className="h-3 w-3 mr-1" />
                  {user.level}
                </Badge>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{user.rating}</span>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>{user.location}</span>
                  </div>
                </div>
                {isOwnProfile ? (
                  <Button onClick={onEdit}>
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={() => onConnect?.(user.id)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                    <Button variant="outline" onClick={() => onMessage?.(user.id)}>
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{user.tripCount}</div>
                  <div className="text-xs text-muted-foreground">Trips</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{user.followers}</div>
                  <div className="text-xs text-muted-foreground">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{user.following || 184}</div>
                  <div className="text-xs text-muted-foreground">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold flex items-center justify-center gap-1">
                    <Coins className="h-5 w-5 text-yellow-500" />
                    {user.yatraCoins}
                  </div>
                  <div className="text-xs text-muted-foreground">YatraCoins</div>
                </div>
              </div>

              {/* Bio */}
              <p className="text-sm mb-4">{user.bio}</p>

              {/* Interests */}
              <div className="flex flex-wrap gap-2 mb-4">
                {user.interests.map((interest) => (
                  <Badge key={interest} variant="outline">
                    {interest}
                  </Badge>
                ))}
              </div>

              {/* Member Since */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Member since {user.joinDate}</span>
              </div>
            </div>
          </div>

          {/* Travel Stories */}
          {user.stories && user.stories.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Travel Stories</h3>
              <TravelStories
                stories={user.stories}
                userAvatar={user.avatar}
                userName={user.name}
                isOwnProfile={isOwnProfile}
              />
            </div>
          )}

          {/* Travel Stats */}
          {user.travelStats && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Travel Stats
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Globe className="h-8 w-8 text-blue-500" />
                    <div>
                      <div className="font-semibold">{user.travelStats.countriesVisited}</div>
                      <div className="text-xs text-muted-foreground">Countries</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Map className="h-8 w-8 text-green-500" />
                    <div>
                      <div className="font-semibold">{user.travelStats.citiesExplored}</div>
                      <div className="text-xs text-muted-foreground">Cities</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-8 w-8 text-orange-500" />
                    <div>
                      <div className="font-semibold">{user.travelStats.totalDistance}</div>
                      <div className="text-xs text-muted-foreground">Traveled</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-8 w-8 text-purple-500" />
                    <div>
                      <div className="font-semibold">{user.travelStats.favTransport}</div>
                      <div className="text-xs text-muted-foreground">Transport</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Badges */}
          {user.badges && user.badges.length > 0 && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  Travel Badges
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {user.badges.map((badge) => (
                    <div key={badge.id} className="text-center">
                      <div className="text-3xl mb-1">{badge.icon}</div>
                      <div className="text-xs font-medium">{badge.name}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="experiences">
              Experiences ({user.experiences.length})
            </TabsTrigger>
            <TabsTrigger value="gallery">
              Gallery ({user.gallery.length})
            </TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews ({user.reviews.length})
            </TabsTrigger>
          </TabsList>

          {/* Experiences Tab */}
          <TabsContent value="experiences" className="space-y-4 mt-6">
            {user.experiences.length > 0 ? (
              user.experiences.map((experience) => (
                <Card key={experience.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{experience.destination}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {experience.date}
                          </div>
                          {experience.duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {experience.duration}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {experience.likes && (
                          <div className="flex items-center gap-1 text-sm">
                            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                            <span>{experience.likes}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{experience.rating}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm mb-4">{experience.description}</p>

                    {experience.travelWith && experience.travelWith.length > 0 && (
                      <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Traveled with {experience.travelWith.join(', ')}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2">
                      {experience.photos.map((photo, index) => (
                        <ImageWithFallback
                          key={index}
                          src={photo}
                          alt={`${experience.destination} photo ${index + 1}`}
                          className="aspect-square object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center bg-muted/30">
                <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium mb-2">No travel experiences yet</h3>
                <p className="text-sm text-muted-foreground">
                  {isOwnProfile 
                    ? "Start sharing your amazing travel adventures!"
                    : `${user.name.split(' ')[0]} hasn't shared any experiences yet.`
                  }
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="mt-6">
            {user.gallery.length > 0 ? (
              <>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {user.gallery.slice(0, galleryItemsToShow).map((photo, index) => {
                    const photoUrl = typeof photo === 'string' ? photo : photo.url;
                    const likes = typeof photo === 'string' ? 0 : photo.likes || 0;
                    const location = typeof photo === 'string' ? '' : photo.location || '';

                    return (
                      <div key={index} className="relative group aspect-square">
                        <ImageWithFallback
                          src={photoUrl}
                          alt={`Gallery photo ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <div className="text-white text-center">
                            {likes > 0 && (
                              <div className="flex items-center gap-1 justify-center mb-1">
                                <Heart className="h-4 w-4 fill-white" />
                                <span className="text-sm font-medium">{likes}</span>
                              </div>
                            )}
                            {location && (
                              <div className="flex items-center gap-1 justify-center text-xs">
                                <MapPin className="h-3 w-3" />
                                <span>{location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {user.gallery.length > 12 && !showAllGallery && (
                  <div className="text-center">
                    <Button variant="outline" onClick={() => setShowAllGallery(true)}>
                      Show All {user.gallery.length} Photos
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card className="p-12 text-center bg-muted/30">
                <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium mb-2">No photos yet</h3>
                <p className="text-sm text-muted-foreground">
                  {isOwnProfile 
                    ? "Upload your travel photos to build your gallery!"
                    : `${user.name.split(' ')[0]} hasn't uploaded any photos yet.`
                  }
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-4 mt-6">
            {user.reviews.length > 0 ? (
              user.reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.reviewerAvatar} alt={review.reviewer} />
                        <AvatarFallback>{review.reviewer.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{review.reviewer}</h4>
                            {review.tripDestination && (
                              <p className="text-xs text-muted-foreground">
                                Trip to {review.tripDestination}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm mb-2">{review.comment}</p>
                        <p className="text-xs text-muted-foreground">{review.date}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center bg-muted/30">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium mb-2">No reviews yet</h3>
                <p className="text-sm text-muted-foreground">
                  {isOwnProfile 
                    ? "Travel with others to receive reviews!"
                    : `${user.name.split(' ')[0]} hasn't received any reviews yet.`
                  }
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}