import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  Star, 
  MapPin, 
  Calendar, 
  MessageCircle, 
  Award, 
  Users, 
  Coins,
  Camera,
  Heart,
  MessageSquare,
  Clock,
  ArrowRight
} from 'lucide-react';

interface UserProfileModalProps {
  user: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    level: string;
    followers: number;
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
    }>;
    reviews: Array<{
      id: string;
      reviewer: string;
      rating: number;
      comment: string;
      date: string;
      timestamp?: string;
    }>;
  };
  isOpen: boolean;
  onClose: () => void;
  onConnect: (userId: string) => void;
  onMessage: (userId: string) => void;
  onNavigateToHome?: () => void;
  onViewFullProfile?: (userId: string) => void;
}

export function UserProfileModal({ 
  user, 
  isOpen, 
  onClose, 
  onConnect, 
  onMessage,
  onNavigateToHome,
  onViewFullProfile
}: UserProfileModalProps) {
  // Sort experiences by latest first (using timestamp or date)
  const sortedExperiences = [...user.experiences].sort((a, b) => {
    const dateA = new Date(a.timestamp || a.date).getTime();
    const dateB = new Date(b.timestamp || b.date).getTime();
    return dateB - dateA;
  });

  // Sort gallery: latest first, then by most liked
  const sortedGallery = [...user.gallery].sort((a, b) => {
    const itemA = typeof a === 'string' ? { url: a, likes: 0, timestamp: new Date().toISOString() } : a;
    const itemB = typeof b === 'string' ? { url: b, likes: 0, timestamp: new Date().toISOString() } : b;
    
    const dateA = new Date(itemA.timestamp || '').getTime();
    const dateB = new Date(itemB.timestamp || '').getTime();
    
    // First sort by timestamp (latest first)
    if (dateB !== dateA) {
      return dateB - dateA;
    }
    // Then by likes
    return (itemB.likes || 0) - (itemA.likes || 0);
  });

  // Sort reviews by latest first
  const sortedReviews = [...user.reviews].sort((a, b) => {
    const dateA = new Date(a.timestamp || a.date).getTime();
    const dateB = new Date(b.timestamp || b.date).getTime();
    return dateB - dateA;
  });

  const handleGiveReview = () => {
    onClose();
    if (onNavigateToHome) {
      onNavigateToHome();
    }
  };

  const isRecentActivity = (dateString: string, daysThreshold = 30) => {
    const activityDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - activityDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= daysThreshold;
  };

  const hasRecentExperiences = sortedExperiences.some(exp => 
    isRecentActivity(exp.timestamp || exp.date)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Traveler Profile</DialogTitle>
          <DialogDescription>
            View detailed profile information, travel experiences, and reviews for {user.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto">
          {/* Profile Header */}
          <div className="flex items-start gap-4 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <button
                onClick={() => {
                  onClose();
                  onViewFullProfile?.(user.id);
                }}
                className="text-xl font-semibold hover:underline text-left"
              >
                {user.name}
              </button>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{user.rating}</span>
                </div>
                <Badge variant="secondary">{user.level}</Badge>
              </div>
              
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{user.followers} followers</span>
                </div>
                <div className="flex items-center gap-1">
                  <Coins className="h-4 w-4" />
                  <span>{user.yatraCoins} YatraCoins</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  <span>{user.tripCount} trips</span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-3">
                <Button onClick={() => onConnect(user.id)} className="flex-1">
                  Connect
                </Button>
                <Button variant="outline" onClick={() => onMessage(user.id)}>
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Message
                </Button>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="experiences">Experiences</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about" className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Bio</h3>
                <p className="text-sm text-muted-foreground">{user.bio}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{user.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {user.joinDate}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest) => (
                    <Badge key={interest} variant="outline">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="experiences" className="space-y-4">
              {sortedExperiences.length > 0 ? (
                <>
                  {!hasRecentExperiences && (
                    <Card className="p-4 bg-muted/30 border-dashed">
                      <div className="text-center py-4">
                        <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {user.name.split(' ')[0]} will be sharing their latest travel experiences soon! 
                          Stay tuned for exciting stories and adventures.
                        </p>
                      </div>
                    </Card>
                  )}
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Latest Experiences</h4>
                      {hasRecentExperiences && (
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Recent
                        </Badge>
                      )}
                    </div>
                    
                    {sortedExperiences.slice(0, 3).map((experience) => (
                      <Card key={experience.id} className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{experience.destination}</h4>
                          <div className="flex items-center gap-2">
                            {experience.likes && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Heart className="h-3 w-3" />
                                <span>{experience.likes}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{experience.rating}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{experience.date}</p>
                        <p className="text-sm mb-3">{experience.description}</p>
                        <div className="grid grid-cols-3 gap-2">
                          {experience.photos.slice(0, 3).map((photo, index) => (
                            <ImageWithFallback
                              key={index}
                              src={photo}
                              alt={`${experience.destination} photo ${index + 1}`}
                              className="aspect-square object-cover rounded"
                            />
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <Card className="p-6 text-center bg-muted/30 border-dashed">
                  <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h4 className="font-medium mb-2">No Experiences Yet</h4>
                  <p className="text-sm text-muted-foreground">
                    {user.name.split(' ')[0]} hasn't shared any travel experiences yet. 
                    They'll be posting amazing stories and memories soon!
                  </p>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="gallery" className="space-y-4">
              {sortedGallery.length > 0 ? (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Latest Photos</h4>
                      <Badge variant="outline" className="text-xs">
                        {sortedGallery.length} photos
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {sortedGallery.map((photo, index) => {
                        const photoUrl = typeof photo === 'string' ? photo : photo.url;
                        const likes = typeof photo === 'string' ? 0 : photo.likes || 0;
                        
                        return (
                          <div key={index} className="relative group">
                            <ImageWithFallback
                              src={photoUrl}
                              alt={`Gallery photo ${index + 1}`}
                              className="aspect-square object-cover rounded"
                            />
                            {likes > 0 && (
                              <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs">
                                <Heart className="h-3 w-3 fill-white" />
                                <span>{likes}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <Card className="p-6 text-center bg-muted/30 border-dashed">
                  <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h4 className="font-medium mb-2">No Photos Yet</h4>
                  <p className="text-sm text-muted-foreground">
                    {user.name.split(' ')[0]} hasn't uploaded any travel photos yet. 
                    Stay tuned for beautiful memories from their adventures!
                  </p>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="reviews" className="space-y-4">
              {sortedReviews.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Latest Reviews</h4>
                    <Badge variant="outline" className="text-xs">
                      {sortedReviews.length} reviews
                    </Badge>
                  </div>
                  
                  {sortedReviews.map((review) => (
                    <Card key={review.id} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium">{review.reviewer}</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm mb-2">{review.comment}</p>
                      <p className="text-xs text-muted-foreground">{review.date}</p>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <Card className="p-6 text-center bg-muted/30 border-dashed">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h4 className="font-medium mb-2">No Reviews Yet</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {user.name.split(' ')[0]} hasn't received any reviews yet from fellow travelers.
                    </p>
                  </Card>
                  
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <div className="text-center">
                      <h4 className="font-medium mb-2 text-blue-900">Wanna give a review?</h4>
                      <p className="text-sm text-blue-700 mb-4">
                        Explore our platform, travel with {user.name.split(' ')[0]}, and share your experience!
                      </p>
                      <Button 
                        onClick={handleGiveReview}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Explore Platform
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}