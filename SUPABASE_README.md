# Supabase Setup Instructions

## Setting up the Trips Table

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-setup.sql` and run it

This will create:
- The `trips` table with all necessary columns
- Row Level Security (RLS) policies
- Indexes for better performance

## Features Created

### Profile Dropdown (Instagram-style)
- ✅ Clickable profile avatar in top right corner
- ✅ Dropdown menu with Profile, Settings, Messages, Logout
- ✅ Profile navigation to user's own profile page
- ✅ Edit capabilities for own profile

### Shared Trip Visibility
- ✅ Trips stored in Supabase database
- ✅ All users can see public trips
- ✅ Search functionality works across all users
- ✅ Community feed shows trips from all users
- ✅ User-specific trip management (own trips only)

## How to Use

1. **Post a Trip**: Fill out the trip form and click "Post Trip"
2. **View Profile**: Click your avatar in the top right → "View Profile"
3. **Search Trips**: Use the Explore page to search for trips by destination
4. **Community**: Check the Communities page to see all public trips
5. **Manage Trips**: Go to "My Trips" to see and delete your own trips

## Authentication Flow
- Login with Clerk authentication
- Profile data based on authenticated user
- Trips scoped to logged-in user
- Logout clears session properly