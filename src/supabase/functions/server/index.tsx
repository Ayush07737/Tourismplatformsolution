import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Enable CORS and logging
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));
app.use('*', logger(console.log));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Health check
app.get('/make-server-ce1944e7/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Update user location
app.post('/make-server-ce1944e7/users/location', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken || accessToken === 'undefined') {
      return c.json({ error: 'Authorization token required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const { lat, lng, address, city, country } = await c.req.json();
    
    if (!lat || !lng) {
      return c.json({ error: 'Latitude and longitude are required' }, 400);
    }

    const locationData = {
      userId: user.id,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      address: address || '',
      city: city || '',
      country: country || '',
      lastUpdated: new Date().toISOString()
    };

    await kv.set(`user_location:${user.id}`, locationData);
    
    return c.json({ success: true, location: locationData });
  } catch (error) {
    console.error('Error updating user location:', error);
    return c.json({ error: 'Failed to update location' }, 500);
  }
});

// Get nearby travelers
app.get('/make-server-ce1944e7/travelers/nearby', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const lat = parseFloat(c.req.query('lat') || '0');
    const lng = parseFloat(c.req.query('lng') || '0');
    const radius = parseFloat(c.req.query('radius') || '10'); // km

    if (!lat || !lng) {
      return c.json({ error: 'Latitude and longitude are required' }, 400);
    }

    // Get all user locations
    const userLocations = await kv.getByPrefix('user_location:');
    const travelers = await kv.getByPrefix('user_profile:');
    
    // Calculate nearby travelers
    const nearbyTravelers = [];
    
    for (const location of userLocations) {
      if (!location || !location.value) continue;
      
      const userLoc = location.value;
      const distance = calculateDistance(lat, lng, userLoc.lat, userLoc.lng);
      
      if (distance <= radius) {
        // Find matching user profile
        const profile = travelers.find(t => t.key === `user_profile:${userLoc.userId}`);
        if (profile && profile.value) {
          nearbyTravelers.push({
            ...profile.value,
            location: userLoc,
            distance: distance.toFixed(1)
          });
        }
      }
    }

    return c.json({ travelers: nearbyTravelers });
  } catch (error) {
    console.error('Error fetching nearby travelers:', error);
    return c.json({ error: 'Failed to fetch nearby travelers' }, 500);
  }
});

// Create or update user profile
app.post('/make-server-ce1944e7/users/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken || accessToken === 'undefined') {
      return c.json({ error: 'Authorization token required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const profileData = await c.req.json();
    const profile = {
      ...profileData,
      userId: user.id,
      lastUpdated: new Date().toISOString()
    };

    await kv.set(`user_profile:${user.id}`, profile);
    
    return c.json({ success: true, profile });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// Get user profile
app.get('/make-server-ce1944e7/users/profile/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const profile = await kv.get(`user_profile:${userId}`);
    const location = await kv.get(`user_location:${userId}`);
    
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json({ 
      profile: profile.value, 
      location: location?.value || null 
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// Initialize demo data
app.post('/make-server-ce1944e7/init-demo', async (c) => {
  try {
    const demoUsers = [
      {
        userId: 'demo-1',
        profile: {
          id: 'demo-1',
          name: 'Sarah Chen',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b17d0cd3?w=150&h=150&fit=crop&crop=face',
          rating: 4.8,
          destination: 'Goa',
          travelDate: 'Dec 15-22',
          groupSize: 3,
          bio: 'Adventure seeker who loves beaches, water sports, and good food. Looking for travel buddies to explore Goa!',
          tripCount: 12,
          interests: ['Beach', 'Adventure', 'Photography']
        },
        location: { lat: 19.0896, lng: 72.8656, address: 'Bandra, Mumbai, India' }
      },
      {
        userId: 'demo-2',
        profile: {
          id: 'demo-2',
          name: 'Rahul Sharma',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          rating: 4.6,
          destination: 'Manali',
          travelDate: 'Jan 5-12',
          groupSize: 2,
          bio: 'Mountain lover planning a winter trip to Manali. Experienced trekker looking for like-minded travelers.',
          tripCount: 8,
          interests: ['Mountains', 'Trekking', 'Snow']
        },
        location: { lat: 19.0720, lng: 72.8777, address: 'Fort, Mumbai, India' }
      },
      {
        userId: 'demo-3',
        profile: {
          id: 'demo-3',
          name: 'Priya Patel',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          rating: 4.9,
          destination: 'Kerala',
          travelDate: 'Feb 1-8',
          groupSize: 4,
          bio: 'Culture enthusiast planning to explore Kerala backwaters and traditional art forms.',
          tripCount: 15,
          interests: ['Culture', 'Nature', 'Food']
        },
        location: { lat: 19.0825, lng: 72.8231, address: 'Andheri, Mumbai, India' }
      }
    ];

    for (const user of demoUsers) {
      await kv.set(`user_profile:${user.userId}`, user.profile);
      await kv.set(`user_location:${user.userId}`, {
        ...user.location,
        userId: user.userId,
        lastUpdated: new Date().toISOString()
      });
    }

    return c.json({ success: true, message: 'Demo data initialized' });
  } catch (error) {
    console.error('Error initializing demo data:', error);
    return c.json({ error: 'Failed to initialize demo data' }, 500);
  }
});

// Utility function to calculate distance between two points
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

Deno.serve(app.fetch);