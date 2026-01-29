import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  Plus, 
  X, 
  ChevronLeft, 
  ChevronRight,
  MapPin,
  Clock,
  Pause,
  Play
} from 'lucide-react';

interface TravelStory {
  id: string;
  image: string;
  location: string;
  timestamp: string;
  caption?: string;
}

interface TravelStoriesProps {
  stories: TravelStory[];
  userAvatar: string;
  userName: string;
  isOwnProfile?: boolean;
  onAddStory?: () => void;
}

export function TravelStories({ 
  stories, 
  userAvatar, 
  userName,
  isOwnProfile = false,
  onAddStory
}: TravelStoriesProps) {
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const hasStories = stories.length > 0;

  const handleStoryClick = () => {
    if (hasStories) {
      setCurrentStoryIndex(0);
      setShowStoryViewer(true);
      setIsPaused(false);
    } else if (isOwnProfile && onAddStory) {
      onAddStory();
    }
  };

  const handleNext = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else {
      setShowStoryViewer(false);
    }
  };

  const handlePrevious = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const storyTime = new Date(timestamp);
    const diffMs = now.getTime() - storyTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins}m ago`;
    }
    return `${diffHours}h ago`;
  };

  const currentStory = stories[currentStoryIndex];

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          onClick={handleStoryClick}
          className="relative flex flex-col items-center gap-1 group"
        >
          <div className={`relative ${hasStories ? 'ring-2 ring-primary ring-offset-2' : ''} rounded-full`}>
            <Avatar className="h-16 w-16">
              <AvatarImage src={userAvatar} alt={userName} />
              <AvatarFallback>{userName.slice(0, 2)}</AvatarFallback>
            </Avatar>
            {isOwnProfile && (
              <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                <Plus className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
          </div>
          <span className="text-xs max-w-[70px] truncate">
            {isOwnProfile ? 'Your Story' : userName.split(' ')[0]}
          </span>
        </button>
      </div>

      {/* Story Viewer */}
      <Dialog open={showStoryViewer} onOpenChange={setShowStoryViewer}>
        <DialogContent className="max-w-md p-0 bg-black border-0 overflow-hidden">
          <DialogTitle className="sr-only">Viewing {userName}'s travel story</DialogTitle>
          {currentStory && (
            <div className="relative h-[600px] flex items-center justify-center">
              {/* Progress Bars */}
              <div className="absolute top-2 left-2 right-2 flex gap-1 z-10">
                {stories.map((_, index) => (
                  <div 
                    key={index}
                    className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
                  >
                    <div 
                      className={`h-full bg-white transition-all duration-300 ${
                        index < currentStoryIndex ? 'w-full' : 
                        index === currentStoryIndex ? 'w-1/2' : 'w-0'
                      }`}
                    />
                  </div>
                ))}
              </div>

              {/* Header */}
              <div className="absolute top-6 left-4 right-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 border-2 border-white">
                    <AvatarImage src={userAvatar} alt={userName} />
                    <AvatarFallback>{userName.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="text-white text-sm">
                    <div className="font-medium">{userName}</div>
                    <div className="text-xs text-white/80 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getTimeAgo(currentStory.timestamp)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/20"
                    onClick={() => setIsPaused(!isPaused)}
                  >
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/20"
                    onClick={() => setShowStoryViewer(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Story Image */}
              <ImageWithFallback
                src={currentStory.image}
                alt={`Story from ${currentStory.location}`}
                className="w-full h-full object-contain"
              />

              {/* Story Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 z-10">
                <div className="flex items-center gap-1 text-white mb-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-medium">{currentStory.location}</span>
                </div>
                {currentStory.caption && (
                  <p className="text-white text-sm">{currentStory.caption}</p>
                )}
              </div>

              {/* Navigation */}
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 disabled:opacity-0"
                disabled={currentStoryIndex === 0}
              >
                <ChevronLeft className="h-8 w-8 text-white drop-shadow-lg" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
              >
                <ChevronRight className="h-8 w-8 text-white drop-shadow-lg" />
              </button>

              {/* Tap Navigation Areas */}
              <div className="absolute inset-0 flex z-[5]">
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={handlePrevious}
                />
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={handleNext}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}