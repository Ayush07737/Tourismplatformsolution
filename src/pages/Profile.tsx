import { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { FullProfilePage } from '../components/full-profile-page';
import { ProfileEditPage } from '../components/profile-edit-page';
import { Button } from '../components/ui/button';
import { Loader2 } from 'lucide-react';

export function Profile() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Load user profile data
  useEffect(() => {
    if (user && isLoaded) {
      // Create user profile from Clerk user data (matching createUserProfileFromAuth)
      const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.primaryEmailAddress?.emailAddress || 'Traveler';
      
      const profile = {
        id: user.id,
        name,
        avatar: user.imageUrl ?? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        rating: 4.5, // Default rating for new users
        level: 'Wanderer', // Default level
        followers: 0,
        following: 0,
        yatraCoins: 100, // Starting coins
        bio: 'Adventure awaits! Ready to explore the world and make new friends.',
        location: 'India', // Default location
        joinDate: new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        tripCount: 0, // TODO: Load actual trip count
        interests: ['Adventure', 'Culture', 'Food'],
        gallery: [],
        experiences: [],
        reviews: [],
        stories: [],
        badges: [
          { id: 'b1', name: 'New Explorer', icon: '🎒', description: 'Started your journey' }
        ],
        travelStats: {
          countriesVisited: 0,
          citiesExplored: 0,
          totalDistance: '0 km',
          favTransport: 'Bus'
        }
      };
      setUserProfile(profile);
    }
  }, [user, isLoaded]);

  // Show loading state while user data is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Since we're protected by ProtectedRoute, user should always be available
  if (!user) {
    return null;
  }

  // Show loading state while profile data is being prepared
  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    navigate('/');
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = (updatedUser: any) => {
    setUserProfile(updatedUser);
    setEditing(false);
  };

  const handleLogout = () => {
    signOut({ redirectUrl: window.location.origin });
  };

  // Mock handlers for connect and message (you can implement these as needed)
  const handleConnect = () => {
    // TODO: Implement connect functionality
    console.log('Connect clicked');
  };

  const handleMessage = () => {
    // TODO: Implement message functionality
    console.log('Message clicked');
  };

  if (editing) {
    return (
      <ProfileEditPage
        user={userProfile}
        onBack={() => setEditing(false)}
        onSave={handleSave}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <FullProfilePage
      user={userProfile}
      isOwnProfile={true}
      onBack={handleBack}
      onEdit={handleEdit}
      onLogout={handleLogout}
      onConnect={handleConnect}
      onMessage={handleMessage}
    />
  );
}