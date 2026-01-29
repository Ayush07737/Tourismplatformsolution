# YatraConnect - Travel Social Platform

YatraConnect is a comprehensive travel social platform designed for Smart India Hackathon (SIH) that revolutionizes how travelers connect, plan, and experience journeys together.

## 🌟 Key Features

### 🗺️ **Real-Time Location Mapping**
- **GPS Integration**: Accurate real-time location detection with fallback options
- **Interactive Map**: OpenStreetMap integration showing real streets and landmarks
- **Traveler Markers**: Live avatar markers showing nearby travelers on the map
- **Distance Calculation**: Precise distance measurements between travelers
- **5-7km Radius Matching**: Find travel partners within optimal proximity

### 👥 **Social Travel Networking**
- **Instagram-like Profiles**: Rich user profiles with galleries, ratings, and experiences
- **Travel Partner Matching**: Algorithm-based matching of compatible travelers
- **Real-time Chat**: Integrated messaging system for connected travelers
- **Trip Planning**: Collaborative trip planning with cost splitting features
- **Rating System**: 5-star rating system for travel experiences and companions

### 💰 **YatraCoin Integration**
- **Digital Currency**: Exclusive payment system for platform transactions
- **Discounts & Rewards**: Special offers and loyalty rewards for active users
- **Cost Splitting**: Seamless expense sharing between travel partners
- **Secure Payments**: Blockchain-based secure transaction system

### 🏝️ **Destination Discovery**
- **Virtual Exploration**: 360° views and virtual tours of destinations
- **Popular Destinations**: Curated list of trending travel locations
- **Detailed Information**: Comprehensive destination guides and reviews
- **Trip Duration & Pricing**: Transparent cost breakdowns and itineraries

## 🛠️ Technical Architecture

### **Frontend Stack**
- **React 18** with TypeScript for type-safe development
- **Tailwind CSS v4** for modern, responsive styling
- **Shadcn/UI** components for consistent design system
- **Lucide React** for beautiful, customizable icons
- **Motion/React** for smooth animations and transitions

### **Backend Infrastructure**
- **Supabase** for real-time database and authentication
- **Edge Functions** for serverless API endpoints
- **PostgreSQL** with real-time subscriptions
- **Key-Value Store** for efficient data caching and retrieval

### **Mapping & Location Services**
- **OpenStreetMap** for detailed map rendering
- **Geolocation API** for GPS location detection
- **Reverse Geocoding** for address resolution
- **Haversine Formula** for accurate distance calculations

### **Real-time Features**
- **WebSocket Connections** for live chat functionality
- **Live Location Updates** with position tracking
- **Dynamic Traveler Discovery** based on real-time locations
- **Push Notifications** for connection requests and messages

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account for backend services
- Modern browser with geolocation support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/yatraconnect.git
   cd yatraconnect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Copy your project credentials to `utils/supabase/info.tsx`
   - Deploy the edge functions from `supabase/functions/`

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📱 Core Components

### **Travel Map (`/components/travel-map.tsx`)**
- Real-time GPS location detection
- Interactive OpenStreetMap with traveler markers
- Dynamic zoom and pan functionality
- User location indicator with pulsing animation
- Traveler profile previews on marker click

### **User Profile Modal (`/components/user-profile-modal.tsx`)**
- Comprehensive user profiles with tabbed interface
- Travel experiences gallery with photos
- Reviews and ratings from other travelers
- Direct messaging and connection capabilities
- YatraCoin balance and trip statistics

### **Location Picker (`/components/location-picker.tsx`)**
- Auto-detect location with GPS
- Manual location entry with suggestions
- Popular cities and destinations quick-select
- Real-time address validation
- Fallback options for accessibility

### **Traveler Cards (`/components/traveler-card.tsx`)**
- Rich traveler information display
- Rating and experience indicators
- Distance and destination information
- Quick connect and message actions
- Interest tags and compatibility scores

## 🔧 Backend API Endpoints

### **Location Management**
- `POST /users/location` - Update user location
- `GET /travelers/nearby` - Find nearby travelers
- `GET /users/profile/:userId` - Get user profile

### **Real-time Features**
- WebSocket connections for live chat
- Location broadcasting for map updates
- Connection request notifications
- Trip planning collaboration tools

## 🎯 Key Differentiators

1. **Real GPS Integration**: Unlike static platforms, YatraConnect uses live GPS data for accurate traveler positioning

2. **Modular Architecture**: Backend-frontend separation ensures scalability for real-world deployment

3. **Smart Matching Algorithm**: 5-7km radius with compatibility scoring based on interests and travel patterns

4. **YatraCoin Economy**: Integrated digital currency system for seamless transactions and rewards

5. **Mobile-First Design**: Responsive design optimized for mobile travel scenarios

6. **Production-Ready**: Full authentication, error handling, and security measures implemented

## 🚀 Demo Features

The platform includes realistic demo data and functionality:

- **Mock Travelers**: Pre-populated with diverse user profiles
- **Real Location Detection**: Works with actual GPS coordinates
- **Interactive Map**: Functional mapping with real geographic data
- **Live Updates**: Real-time traveler position updates
- **Full User Flows**: Complete registration to trip planning workflows

## 🔒 Security & Privacy

- **Location Privacy**: Users control location sharing granularity
- **Secure Authentication**: Supabase Auth with JWT tokens
- **Data Encryption**: End-to-end encryption for sensitive data
- **Privacy Controls**: Granular privacy settings for user profiles

## 🌐 Scalability & Performance

- **Edge Functions**: Serverless architecture for automatic scaling
- **CDN Optimized**: Images and assets served via global CDN
- **Efficient Caching**: Smart caching strategies for optimal performance
- **Mobile Optimized**: Lightweight bundle size for mobile networks

## 📈 Future Roadmap

- **AI Trip Planning**: Machine learning for personalized itineraries
- **AR Integration**: Augmented reality for destination exploration
- **Multi-language Support**: Global platform accessibility
- **Advanced Analytics**: Travel behavior insights and recommendations
- **Integration APIs**: Third-party booking and payment integrations

## 🤝 Contributing

We welcome contributions to YatraConnect! Please follow our contribution guidelines and code of conduct.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🏆 SIH 2024 Submission

YatraConnect addresses the core challenges in the tourism industry by providing:
- **Traveler Safety**: Verified profiles and rating systems
- **Cost Optimization**: Expense sharing and group discounts
- **Cultural Exchange**: Connecting travelers from different backgrounds
- **Local Economy Boost**: Supporting local businesses and guides
- **Sustainable Tourism**: Promoting responsible travel practices

---

**Built with ❤️ for Smart India Hackathon 2024**