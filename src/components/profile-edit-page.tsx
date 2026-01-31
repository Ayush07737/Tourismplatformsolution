import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  ArrowLeft,
  Upload,
  X,
  Plus,
  Camera,
  MapPin,
  Save,
  Image as ImageIcon,
  Star,
  Calendar,
  Users,
  LogOut
} from 'lucide-react';
import { toast } from 'sonner';

interface ProfileEditPageProps {
  user: any;
  onBack: () => void;
  onSave: (updatedUser: any) => void;
  onLogout?: () => void;
}

export function ProfileEditPage({ user, onBack, onSave, onLogout }: ProfileEditPageProps) {
  const { user: currentUser } = useUser();
  const isOwnProfile = user.id === currentUser?.id;
  const [editedUser, setEditedUser] = useState(user);
  const [activeTab, setActiveTab] = useState('basic');

  // Basic Info
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [location, setLocation] = useState(user.location);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user.interests);

  // New Experience
  const [newExperience, setNewExperience] = useState({
    destination: '',
    date: '',
    rating: 5,
    description: '',
    duration: '',
    photos: [] as string[]
  });

  // New Gallery Photo
  const [newPhoto, setNewPhoto] = useState({
    url: '',
    location: ''
  });

  // New Story
  const [newStory, setNewStory] = useState({
    image: '',
    location: '',
    caption: ''
  });

  const availableInterests = [
    'Beach', 'Adventure', 'Photography', 'Food', 'Culture', 
    'Mountains', 'Trekking', 'Snow', 'Nature', 'Backpacking',
    'Luxury', 'Budget', 'Solo Travel', 'Group Travel', 'Wildlife',
    'History', 'Architecture', 'Water Sports', 'Nightlife', 'Shopping'
  ];

  const handleToggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleAddExperience = () => {
    if (!newExperience.destination || !newExperience.date) {
      toast.error('Please fill in destination and date');
      return;
    }

    const experience = {
      id: Date.now().toString(),
      ...newExperience,
      timestamp: new Date().toISOString(),
      likes: 0
    };

    setEditedUser({
      ...editedUser,
      experiences: [experience, ...editedUser.experiences]
    });

    setNewExperience({
      destination: '',
      date: '',
      rating: 5,
      description: '',
      duration: '',
      photos: []
    });

    toast.success('Experience added successfully!');
  };

  const handleAddPhoto = () => {
    if (!newPhoto.url) {
      toast.error('Please provide a photo URL');
      return;
    }

    const photo = {
      url: newPhoto.url,
      location: newPhoto.location,
      timestamp: new Date().toISOString(),
      likes: 0
    };

    setEditedUser({
      ...editedUser,
      gallery: [photo, ...editedUser.gallery]
    });

    setNewPhoto({ url: '', location: '' });
    toast.success('Photo added successfully!');
  };

  const handleAddStory = () => {
    if (!newStory.image || !newStory.location) {
      toast.error('Please provide story image and location');
      return;
    }

    const story = {
      id: Date.now().toString(),
      image: newStory.image,
      location: newStory.location,
      caption: newStory.caption,
      timestamp: new Date().toISOString()
    };

    setEditedUser({
      ...editedUser,
      stories: [...(editedUser.stories || []), story]
    });

    setNewStory({ image: '', location: '', caption: '' });
    toast.success('Travel story added! It will be visible for 24 hours.');
  };

  const handleSave = () => {
    const updatedUser = {
      ...editedUser,
      name,
      bio,
      location,
      interests: selectedInterests
    };

    onSave(updatedUser);
    toast.success('Profile updated successfully!');
    onBack();
  };

  const handlePhotoUpload = (type: 'experience' | 'gallery' | 'story') => {
    // In a real app, this would open a file picker and upload to a server
    const mockUrl = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop';
    
    if (type === 'experience') {
      setNewExperience({
        ...newExperience,
        photos: [...newExperience.photos, mockUrl]
      });
    } else if (type === 'gallery') {
      setNewPhoto({ ...newPhoto, url: mockUrl });
    } else if (type === 'story') {
      setNewStory({ ...newStory, image: mockUrl });
    }
    
    toast.success('Photo uploaded! (Demo)');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold">Edit Profile</h1>
            </div>
            <div className="flex items-center gap-2">
              {onLogout && isOwnProfile && (
                <Button variant="outline" onClick={onLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </Button>
              )}
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="experiences">Experiences</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="stories">Stories</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Change Avatar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, Country"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell others about yourself and your travel style..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    {bio.length}/500 characters
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Travel Interests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {availableInterests.map((interest) => (
                    <Badge
                      key={interest}
                      variant={selectedInterests.includes(interest) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => handleToggleInterest(interest)}
                    >
                      {interest}
                      {selectedInterests.includes(interest) && (
                        <X className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Experiences Tab */}
          <TabsContent value="experiences" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Travel Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="exp-destination">Destination</Label>
                    <Input
                      id="exp-destination"
                      value={newExperience.destination}
                      onChange={(e) => setNewExperience({ ...newExperience, destination: e.target.value })}
                      placeholder="e.g., Goa Beach Adventure"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exp-date">Date</Label>
                    <Input
                      id="exp-date"
                      type="month"
                      value={newExperience.date}
                      onChange={(e) => setNewExperience({ ...newExperience, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="exp-duration">Duration</Label>
                    <Input
                      id="exp-duration"
                      value={newExperience.duration}
                      onChange={(e) => setNewExperience({ ...newExperience, duration: e.target.value })}
                      placeholder="e.g., 5 days"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exp-rating">Rating (1-5)</Label>
                    <Input
                      id="exp-rating"
                      type="number"
                      min="1"
                      max="5"
                      value={newExperience.rating}
                      onChange={(e) => setNewExperience({ ...newExperience, rating: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exp-description">Description</Label>
                  <Textarea
                    id="exp-description"
                    value={newExperience.description}
                    onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                    placeholder="Share your experience, what you did, where you went..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Photos</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {newExperience.photos.map((photo, index) => (
                      <div key={index} className="relative aspect-square">
                        <ImageWithFallback
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover rounded"
                        />
                        <button
                          onClick={() => setNewExperience({
                            ...newExperience,
                            photos: newExperience.photos.filter((_, i) => i !== index)
                          })}
                          className="absolute -top-2 -right-2 h-5 w-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {newExperience.photos.length < 6 && (
                      <button
                        onClick={() => handlePhotoUpload('experience')}
                        className="aspect-square border-2 border-dashed rounded flex flex-col items-center justify-center hover:bg-muted transition-colors"
                      >
                        <Camera className="h-6 w-6 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground">Add Photo</span>
                      </button>
                    )}
                  </div>
                </div>

                <Button onClick={handleAddExperience} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              </CardContent>
            </Card>

            {/* Existing Experiences */}
            {editedUser.experiences.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Experiences ({editedUser.experiences.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {editedUser.experiences.slice(0, 3).map((exp: any) => (
                    <div key={exp.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{exp.destination}</div>
                          <div className="text-sm text-muted-foreground">{exp.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{exp.rating}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Photo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Upload Photo</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    {newPhoto.url ? (
                      <div className="relative inline-block">
                        <ImageWithFallback
                          src={newPhoto.url}
                          alt="New photo"
                          className="w-48 h-48 object-cover rounded"
                        />
                        <button
                          onClick={() => setNewPhoto({ ...newPhoto, url: '' })}
                          className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handlePhotoUpload('gallery')}
                        className="flex flex-col items-center justify-center"
                      >
                        <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                        <span className="text-sm font-medium">Click to upload photo</span>
                        <span className="text-xs text-muted-foreground">PNG, JPG up to 10MB</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photo-location">Location (Optional)</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="photo-location"
                      value={newPhoto.location}
                      onChange={(e) => setNewPhoto({ ...newPhoto, location: e.target.value })}
                      placeholder="Where was this taken?"
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button onClick={handleAddPhoto} className="w-full" disabled={!newPhoto.url}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Gallery
                </Button>
              </CardContent>
            </Card>

            {/* Gallery Preview */}
            {editedUser.gallery.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Gallery ({editedUser.gallery.length} photos)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2">
                    {editedUser.gallery.slice(0, 8).map((photo: any, index: number) => {
                      const photoUrl = typeof photo === 'string' ? photo : photo.url;
                      return (
                        <ImageWithFallback
                          key={index}
                          src={photoUrl}
                          alt={`Gallery ${index + 1}`}
                          className="aspect-square object-cover rounded"
                        />
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Stories Tab */}
          <TabsContent value="stories" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Travel Story</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-900">
                    <strong>Travel Stories</strong> are a unique way to share your current adventure! 
                    They appear at the top of your profile and disappear after 24 hours.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Story Image</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    {newStory.image ? (
                      <div className="relative inline-block">
                        <ImageWithFallback
                          src={newStory.image}
                          alt="Story preview"
                          className="w-48 h-64 object-cover rounded"
                        />
                        <button
                          onClick={() => setNewStory({ ...newStory, image: '' })}
                          className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handlePhotoUpload('story')}
                        className="flex flex-col items-center justify-center"
                      >
                        <Camera className="h-12 w-12 text-muted-foreground mb-2" />
                        <span className="text-sm font-medium">Upload story image</span>
                        <span className="text-xs text-muted-foreground">Vertical photos work best</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="story-location">Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="story-location"
                      value={newStory.location}
                      onChange={(e) => setNewStory({ ...newStory, location: e.target.value })}
                      placeholder="Where are you right now?"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="story-caption">Caption (Optional)</Label>
                  <Textarea
                    id="story-caption"
                    value={newStory.caption}
                    onChange={(e) => setNewStory({ ...newStory, caption: e.target.value })}
                    placeholder="What's happening on your adventure?"
                    rows={2}
                  />
                </div>

                <Button 
                  onClick={handleAddStory} 
                  className="w-full"
                  disabled={!newStory.image || !newStory.location}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Post Story
                </Button>
              </CardContent>
            </Card>

            {/* Active Stories */}
            {editedUser.stories && editedUser.stories.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Active Stories ({editedUser.stories.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {editedUser.stories.map((story: any) => (
                      <div key={story.id} className="relative aspect-[3/4]">
                        <ImageWithFallback
                          src={story.image}
                          alt={story.location}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 rounded-b-lg">
                          <div className="flex items-center gap-1 text-white text-xs">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{story.location}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}