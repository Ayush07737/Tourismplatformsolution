import { useState } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  MapPin, 
  MessageCircle, 
  Bell,
  Coins,
  Menu
} from 'lucide-react';

interface NavbarProps {
  user?: {
    name: string;
    avatar: string;
    yatraCoins: number;
    notifications: number;
    messages: number;
  };
  currentPage?: string;
  onLogin: () => void;
  onNavigate?: (page: string) => void;
  onViewProfile?: () => void;
}

export function Navbar({ user, currentPage = 'home', onLogin, onNavigate, onViewProfile }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => onNavigate?.('home')}
          >
            <MapPin className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">YatraConnect</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Button 
              variant={currentPage === 'explore' ? 'default' : 'ghost'}
              onClick={() => onNavigate?.('explore')}
            >
              Explore
            </Button>
            <Button 
              variant={currentPage === 'mytrips' ? 'default' : 'ghost'}
              onClick={() => onNavigate?.('mytrips')}
            >
              My Trips
            </Button>
            <Button 
              variant={currentPage === 'community' ? 'default' : 'ghost'}
              onClick={() => onNavigate?.('community')}
            >
              Communities
            </Button>
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* YatraCoins */}
                <div className="hidden sm:flex items-center gap-1 px-3 py-1 bg-yellow-50 rounded-full">
                  <Coins className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-700">
                    {user.yatraCoins}
                  </span>
                </div>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {user.notifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {user.notifications}
                    </Badge>
                  )}
                </Button>

                {/* Messages */}
                <Button variant="ghost" size="icon" className="relative">
                  <MessageCircle className="h-5 w-5" />
                  {user.messages > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {user.messages}
                    </Badge>
                  )}
                </Button>

                {/* User Avatar - Clickable to Profile */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full"
                  onClick={onViewProfile}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                      {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={onLogin}>
                  Sign In
                </Button>
                <Button onClick={onLogin}>
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-2">
              <Button 
                variant={currentPage === 'explore' ? 'default' : 'ghost'} 
                className="justify-start"
                onClick={() => {
                  onNavigate?.('explore');
                  setIsMobileMenuOpen(false);
                }}
              >
                Explore
              </Button>
              <Button 
                variant={currentPage === 'mytrips' ? 'default' : 'ghost'} 
                className="justify-start"
                onClick={() => {
                  onNavigate?.('mytrips');
                  setIsMobileMenuOpen(false);
                }}
              >
                My Trips
              </Button>
              <Button 
                variant={currentPage === 'community' ? 'default' : 'ghost'} 
                className="justify-start"
                onClick={() => {
                  onNavigate?.('community');
                  setIsMobileMenuOpen(false);
                }}
              >
                Communities
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}