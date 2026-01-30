import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Navbar } from './components/navbar';
import { GeoapifyLocationPicker } from './components/geoapify-location-picker';
import { TravelerCard } from './components/traveler-card';
import { DestinationCard } from './components/destination-card';
import { UserProfileModal } from './components/user-profile-modal';
import { FullProfilePage } from './components/full-profile-page';
import { ProfileEditPage } from './components/profile-edit-page';
import { EnhancedProfessionalMap } from './components/enhanced-professional-map';
import { ResponsiveTravelerList } from './components/responsive-traveler-list';
import { UserSearch } from './components/user-search';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Toaster } from './components/ui/sonner';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import { Users, Star, MapPin, Calendar } from 'lucide-react';

// Mock data (mockUser removed; use useAuth().profile for navbar user)
const mockTravelers = [
  {
    id: '1',
    name: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b17d0cd3?w=150&h=150&fit=crop&crop=face',
    rating: 4.8,
    destination: 'Goa',
    travelDate: 'Dec 15-22',
    groupSize: 3,
    distance: '2.3 km',
    bio: 'Adventure seeker who loves beaches, water sports, and good food. Looking for travel buddies to explore Goa!',
    tripCount: 12,
    interests: ['Beach', 'Adventure', 'Photography'],
    lat: 19.0896,
    lng: 72.8656
  },
  {
    id: '2',
    name: 'Rahul Sharma',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    rating: 4.6,
    destination: 'Manali',
    travelDate: 'Jan 5-12',
    groupSize: 2,
    distance: '1.8 km',
    bio: 'Mountain lover planning a winter trip to Manali. Experienced trekker looking for like-minded travelers.',
    tripCount: 8,
    interests: ['Mountains', 'Trekking', 'Snow'],
    lat: 19.0720,
    lng: 72.8777
  },
  {
    id: '3',
    name: 'Priya Patel',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    rating: 4.9,
    destination: 'Kerala',
    travelDate: 'Feb 1-8',
    groupSize: 4,
    distance: '3.1 km',
    bio: 'Culture enthusiast planning to explore Kerala backwaters and traditional art forms.',
    tripCount: 15,
    interests: ['Culture', 'Nature', 'Food'],
    lat: 19.0825,
    lng: 72.8231
  }
];

const mockDestinations = [
  {
    id: '1',
    name: 'Goa Beach Paradise',
    image: 'https://images.unsplash.com/photo-1631684194006-aac5085ecbc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBhZHZlbnR1cmUlMjBtb3VudGFpbiUyMGxhbmRzY2FwZXxlbnwxfHx8fDE3NTc5NDY0MjJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.7,
    location: 'Goa, India',
    duration: '5 Days 4 Nights',
    description: 'Experience the beautiful beaches, vibrant nightlife, and delicious seafood of Goa.',
    highlights: ['Beach', 'Nightlife', 'Water Sports'],
    price: '₹12,000'
  },
  {
    id: '2',
    name: 'Himalayan Adventure',
    image: 'https://images.unsplash.com/photo-1548957175-84f0f9af659e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBncm91cCUyMGZyaWVuZHMlMjBoaWtpbmd8ZW58MXx8fHwxNzU3OTQ2NDI1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.9,
    location: 'Manali, India',
    duration: '7 Days 6 Nights',
    description: 'Trek through scenic mountain trails and experience the beauty of the Himalayas.',
    highlights: ['Trekking', 'Mountains', 'Snow'],
    price: '₹18,000'
  },
  {
    id: '3',
    name: 'Kerala Backwaters',
    image: 'https://images.unsplash.com/photo-1619417889956-c701044fed86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBkZXN0aW5hdGlvbnMlMjBsYW5kbWFya3N8ZW58MXx8fHwxNzU3OTQ2NDI4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.8,
    location: 'Kerala, India',
    duration: '6 Days 5 Nights',
    description: 'Cruise through serene backwaters and experience Kerala\'s rich cultural heritage.',
    highlights: ['Backwaters', 'Culture', 'Ayurveda'],
    price: '₹15,000'
  }
];

const mockUserProfile = {
  id: '1',
  name: 'Sarah Chen',
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b17d0cd3?w=150&h=150&fit=crop&crop=face',
  rating: 4.8,
  level: 'Explorer',
  followers: 245,
  following: 189,
  yatraCoins: 1890,
  bio: 'Passionate traveler and adventure seeker. Love exploring new cultures, trying local cuisine, and making friends along the way!',
  location: 'Mumbai, India',
  joinDate: 'March 2023',
  tripCount: 12,
  interests: ['Beach', 'Adventure', 'Photography', 'Food', 'Culture'],
  gallery: [
    { url: 'https://images.unsplash.com/photo-1631684194006-aac5085ecbc4?w=300&h=300&fit=crop', likes: 23, timestamp: '2024-11-15T10:00:00Z' },
    { url: 'https://images.unsplash.com/photo-1548957175-84f0f9af659e?w=300&h=300&fit=crop', likes: 45, timestamp: '2024-11-20T10:00:00Z' },
    { url: 'https://images.unsplash.com/photo-1619417889956-c701044fed86?w=300&h=300&fit=crop', likes: 18, timestamp: '2024-10-05T10:00:00Z' },
    { url: 'https://images.unsplash.com/photo-1631684194006-aac5085ecbc4?w=300&h=300&fit=crop', likes: 12, timestamp: '2024-09-10T10:00:00Z' },
    { url: 'https://images.unsplash.com/photo-1548957175-84f0f9af659e?w=300&h=300&fit=crop', likes: 34, timestamp: '2024-11-25T10:00:00Z' },
    { url: 'https://images.unsplash.com/photo-1619417889956-c701044fed86?w=300&h=300&fit=crop', likes: 29, timestamp: '2024-12-01T10:00:00Z' }
  ],
  experiences: [
    {
      id: '1',
      destination: 'Goa Adventure',
      date: 'November 2024',
      timestamp: '2024-11-15T10:00:00Z',
      rating: 5,
      likes: 23,
      photos: [
        'https://images.unsplash.com/photo-1631684194006-aac5085ecbc4?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1548957175-84f0f9af659e?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1619417889956-c701044fed86?w=300&h=300&fit=crop'
      ],
      description: 'Amazing beach vacation with water sports, beach parties, and incredible sunsets. Met some wonderful travel buddies!'
    },
    {
      id: '2',
      destination: 'Himalayan Trek',
      date: 'September 2024',
      timestamp: '2024-09-10T10:00:00Z',
      rating: 4,
      likes: 18,
      photos: [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1464822759844-d150065514a8?w=300&h=300&fit=crop'
      ],
      description: 'Challenging but rewarding trek through the Himalayas. The views were absolutely breathtaking!'
    }
  ],
  reviews: [
    {
      id: '1',
      reviewer: 'Rahul Kumar',
      rating: 5,
      comment: 'Sarah was an amazing travel companion! Very organized and fun to be around. Highly recommend!',
      date: 'December 2024',
      timestamp: '2024-12-01T10:00:00Z'
    },
    {
      id: '2',
      reviewer: 'Priya Patel',
      rating: 5,
      comment: 'Great travel buddy! Sarah knows how to have fun while keeping everyone safe. Would definitely travel with her again.',
      date: 'October 2024',
      timestamp: '2024-10-15T10:00:00Z',
      reviewerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      tripDestination: 'Goa'
    }
  ],
  stories: [
    {
      id: 's1',
      image: 'https://images.unsplash.com/photo-1631684194006-aac5085ecbc4?w=400&h=600&fit=crop',
      location: 'Goa Beach',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      caption: 'Sunset vibes at the beach! 🌅'
    },
    {
      id: 's2',
      image: 'https://images.unsplash.com/photo-1548957175-84f0f9af659e?w=400&h=600&fit=crop',
      location: 'Mountain Peak',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      caption: 'Made it to the top! 🏔️'
    }
  ],
  badges: [
    { id: 'b1', name: 'First Trip', icon: '🎒', description: 'Completed your first trip' },
    { id: 'b2', name: 'Beach Lover', icon: '🏖️', description: 'Visited 5 beaches' },
    { id: 'b3', name: 'Mountain Climber', icon: '⛰️', description: 'Climbed 3 mountains' },
    { id: 'b4', name: 'Foodie', icon: '🍜', description: 'Tried 20 local cuisines' },
    { id: 'b5', name: 'Photographer', icon: '📸', description: 'Uploaded 50 photos' },
    { id: 'b6', name: 'Social Butterfly', icon: '🦋', description: '100 connections' }
  ],
  travelStats: {
    countriesVisited: 8,
    citiesExplored: 23,
    totalDistance: '12,450 km',
    favTransport: 'Train'
  }
};

// Alternative user profile with minimal data to test empty states
const mockEmptyUserProfile = {
  id: '2',
  name: 'Alex Johnson',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  rating: 4.2,
  level: 'Wanderer',
  followers: 12,
  yatraCoins: 150,
  bio: 'New to YatraConnect! Excited to explore and meet fellow travelers.',
  location: 'Delhi, India',
  joinDate: 'January 2025',
  tripCount: 1,
  interests: ['Adventure', 'Culture'],
  gallery: [],
  experiences: [],
  reviews: []
};

export default function App() {
  const { user, profile, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [currentLocation, setCurrentLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedUser, setSelectedUser] = useState<typeof mockUserProfile | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [viewingFullProfile, setViewingFullProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [nearbyTravelers, setNearbyTravelers] = useState(mockTravelers);

  // Navbar expects { name, avatar, yatraCoins, notifications, messages }
  const navbarUser = user && profile ? {
    name: profile.name,
    avatar: profile.avatar ?? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name)}`,
    yatraCoins: profile.yatra_coins ?? 0,
    notifications: 0,
    messages: 0,
  } : undefined;

  const handleConnect = (travelerId: string) => {
    alert(`Sending connection request to traveler ${travelerId}`);
  };

  const handleViewProfile = (travelerId: string) => {
    // Show different user profiles for demo purposes
    // Use empty profile for search results to demonstrate empty states
    const profile = (travelerId.startsWith('search-') || travelerId === '2') 
      ? mockEmptyUserProfile 
      : mockUserProfile;
    setSelectedUser(profile);
    setShowUserProfile(true);
  };

  const handleDestinationClick = (destinationId: string) => {
    alert(`Viewing destination details for ${destinationId}`);
  };

  const handleMessage = (userId: string) => {
    alert(`Opening chat with user ${userId}`);
  };

  const handleLocationDetected = (location: { lat: number; lng: number; address: string }) => {
    setUserLocation({ lat: location.lat, lng: location.lng });
    setCurrentLocation(location.address);
  };

  const handleTravelersUpdate = (updatedTravelers: typeof mockTravelers) => {
    setNearbyTravelers(updatedTravelers);
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleNavigateToHome = () => {
    setCurrentPage('home');
    setViewingFullProfile(false);
    setEditingProfile(false);
  };

  const handleViewFullProfile = (userId: string) => {
    const profile = (userId.startsWith('search-') || userId === '2') 
      ? mockEmptyUserProfile 
      : mockUserProfile;
    setSelectedUser(profile);
    setShowUserProfile(false);
    setViewingFullProfile(true);
  };

  const handleEditProfile = () => {
    setViewingFullProfile(false);
    setEditingProfile(true);
  };

  const handleSaveProfile = (updatedUser: any) => {
    // In a real app, this would save to the backend
    console.log('Saving profile:', updatedUser);
    setSelectedUser(updatedUser);
  };

  const handleBackFromProfile = () => {
    setViewingFullProfile(false);
    setEditingProfile(false);
  };

  const renderHomePage = () => (
    <>
      {/* Hero Section with Video Background */}
      <section className="relative py-16 px-4">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1631684194006-aac5085ecbc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBhZHZlbnR1cmUlMjBtb3VudGFpbiUyMGxhbmRzY2FwZXxlbnwxfHx8fDE3NTc5NDY0MjJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
          >
            <source
              src="https://player.vimeo.com/external/421880636.sd.mp4?s=17e06e6c0e66cdb46e8e0b9b7c01b5da4a3e67e7&profile_id=165&oauth2_token_id=57447761"
              type="video/mp4"
            />
            <source
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
              type="video/mp4"
            />
            {/* Fallback to image if video fails */}
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1631684194006-aac5085ecbc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBhZHZlbnR1cmUlMjBtb3VudGFpbiUyMGxhbmRzY2FwZXxlbnwxfHx8fDE3NTc5NDY0MjJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Travel background"
              className="w-full h-full object-cover"
            />
          </video>
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-2xl mx-auto text-center text-white mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Find Your Perfect Travel Buddy
            </h1>
            <p className="text-lg md:text-xl text-white/90">
              Connect with like-minded travelers, share costs, and create unforgettable memories together
            </p>
          </div>
          
          <div className="max-w-md mx-auto">
            <Card className="p-6">
              <GeoapifyLocationPicker
                onLocationChange={setCurrentLocation}
                onDestinationChange={setDestination}
                onLocationCoordinatesChange={handleLocationDetected}
              />
              <Button className="w-full mt-4" size="lg">
                Find Travel Partners
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">10K+</div>
              <div className="text-sm text-muted-foreground">Active Travelers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-sm text-muted-foreground">Destinations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">25K+</div>
              <div className="text-sm text-muted-foreground">Trips Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">4.8</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Nearby Travelers Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Nearby Travel Partners</h2>
              <p className="text-muted-foreground">Connect with travelers planning trips near you</p>
            </div>
            <Button variant="outline">View All</Button>
          </div>
          
          {/* User Search Component */}
          <UserSearch
            onUserSelect={handleViewProfile}
            onConnect={handleConnect}
            onMessage={handleMessage}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Travel Partners Cards */}
            <div>
              <ResponsiveTravelerList
                travelers={nearbyTravelers}
                onConnect={handleConnect}
                onViewProfile={handleViewProfile}
              />
            </div>
            
            {/* Enhanced Map */}
            <div className="lg:sticky lg:top-8">
              <EnhancedProfessionalMap
                travelers={nearbyTravelers}
                userLocation={userLocation}
                onTravelerClick={handleViewProfile}
                onLocationDetected={handleLocationDetected}
                onTravelersUpdate={handleTravelersUpdate}
                currentLocation={currentLocation}
                destination={destination}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Popular Destinations</h2>
              <p className="text-muted-foreground">Discover amazing places to visit</p>
            </div>
            <Button variant="outline" onClick={() => handleNavigate('explore')}>
              Explore All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockDestinations.map((destination) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                onClick={handleDestinationClick}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How YatraConnect Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Connect, plan, and travel with confidence using our simple 4-step process
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Set Your Destination</h3>
              <p className="text-sm text-muted-foreground">
                Choose where you want to go and when you're planning to travel
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Find Travel Partners</h3>
              <p className="text-sm text-muted-foreground">
                Connect with nearby travelers who share similar interests and plans
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Plan Together</h3>
              <p className="text-sm text-muted-foreground">
                Collaborate on itinerary, share costs, and make arrangements together
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Travel & Review</h3>
              <p className="text-sm text-muted-foreground">
                Enjoy your trip and rate your travel companions for future connections
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );

  const renderExplorePage = () => (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Explore Destinations</h1>
      <p className="text-muted-foreground mb-8">Discover amazing places and plan your next adventure with fellow travelers</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockDestinations.map((destination) => (
          <DestinationCard
            key={destination.id}
            destination={destination}
            onClick={handleDestinationClick}
          />
        ))}
      </div>
    </div>
  );

  const renderMyTripsPage = () => (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">My Trips</h1>
      <p className="text-muted-foreground mb-8">Manage your travel plans and memories</p>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">5</p>
              <p className="text-muted-foreground text-sm">Total Trips</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-muted-foreground text-sm">Completed</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">2</p>
              <p className="text-muted-foreground text-sm">Upcoming</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">4.8</p>
              <p className="text-muted-foreground text-sm">Avg Rating</p>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-medium mb-2">No trips yet</h3>
        <p className="text-muted-foreground mb-4">Start planning your first adventure!</p>
        <Button onClick={() => handleNavigate('explore')}>Explore Destinations</Button>
      </div>
    </div>
  );

  const renderCommunityPage = () => (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Travel Community</h1>
      <p className="text-muted-foreground mb-8">Connect, share, and discover with fellow travelers</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Stories</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1494790108755-2616b17d0cd3?w=40&h=40&fit=crop&crop=face"
                alt="Sarah Chen"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="font-medium">Sarah Chen</p>
                <p className="text-sm text-muted-foreground">Just returned from an amazing Goa trip! The beaches were incredible...</p>
                <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
                alt="Rahul Sharma"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="font-medium">Rahul Sharma</p>
                <p className="text-sm text-muted-foreground">Planning a Manali trek next month. Looking for companions!</p>
                <p className="text-xs text-muted-foreground mt-1">5 hours ago</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Active Groups</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Goa Beach Lovers</p>
                <p className="text-sm text-muted-foreground">245 members</p>
              </div>
              <Button variant="outline" size="sm">Join</Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Himalayan Trekkers</p>
                <p className="text-sm text-muted-foreground">189 members</p>
              </div>
              <Button variant="outline" size="sm">Join</Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Budget Backpackers</p>
                <p className="text-sm text-muted-foreground">312 members</p>
              </div>
              <Button variant="outline" size="sm">Join</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  // Show Full Profile Page
  if (viewingFullProfile && selectedUser) {
    return (
      <FullProfilePage
        user={selectedUser}
        isOwnProfile={selectedUser.id === '1'} // In real app, check against logged-in user
        onBack={handleBackFromProfile}
        onEdit={handleEditProfile}
        onConnect={handleConnect}
        onMessage={handleMessage}
      />
    );
  }

  // Show Profile Edit Page
  if (editingProfile && selectedUser) {
    return (
      <ProfileEditPage
        user={selectedUser}
        onBack={handleBackFromProfile}
        onSave={handleSaveProfile}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <Navbar 
        user={navbarUser}
        currentPage={currentPage}
        onLogin={() => {}}
        onLogout={signOut}
        onNavigate={handleNavigate}
      />
      
      {/* Render different pages based on currentPage */}
      {currentPage === 'home' && renderHomePage()}
      {currentPage === 'explore' && renderExplorePage()}
      {currentPage === 'mytrips' && renderMyTripsPage()}
      {currentPage === 'community' && renderCommunityPage()}

      {/* User Profile Modal */}
      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          isOpen={showUserProfile}
          onClose={() => setShowUserProfile(false)}
          onConnect={handleConnect}
          onMessage={handleMessage}
          onNavigateToHome={handleNavigateToHome}
          onViewFullProfile={handleViewFullProfile}
        />
      )}
    </div>
  );
}