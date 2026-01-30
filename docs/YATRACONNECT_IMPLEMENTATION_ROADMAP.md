# YatraConnect Implementation Roadmap

This document maps the full YatraConnect spec to the current codebase and defines implementation phases. Build **one section at a time** and test before moving on.

---

## Current Stack (Already in Project)

| Layer | Current | Spec Suggestion | Note |
|-------|---------|-----------------|------|
| Frontend | React + Vite + TypeScript + Tailwind | React/Next.js + Tailwind | ✅ Keep; add React Router if needed |
| Auth | Mock (`isLoggedIn` state) | JWT + bcrypt + OTP | Implement real auth (Supabase Auth or Node/Express) |
| Database | — | MongoDB/Firebase | Supabase already has projectId/key; can use Supabase DB or add Node API + MongoDB |
| Maps | Geoapify | Google Maps API | Can add Google later or keep Geoapify |
| UI | shadcn/ui, Sonner | Tailwind, toasts | ✅ Already in place |

---

## Spec Sections → Implementation Order

| # | Section | Status | Existing Pieces | To Build |
|---|---------|--------|-----------------|----------|
| **1** | **Registration & Login** | 🟢 Implemented | Navbar login/logout, mock user | ✅ Register/Login/ForgotPassword pages, Supabase Auth, protected routes, redirect to dashboard |
| **2** | **Destination Selection** | 🟡 Partial | `GeoapifyLocationPicker`, destination cards, map | Backend `/api/destinations/search`, OpenWeather, AI recommendations |
| **3** | **Flash Pooling & Matching** | 🟡 Partial | Traveler list, map, profile modal | 2km geofencing, WebSockets, `/api/matching/*`, verified badges, safety filters |
| **4** | **User Profile Viewing** | 🟢 Exists | `FullProfilePage`, `UserProfileModal`, gallery, reviews | Backend `/api/users/:id`, hide sensitive data until mutual accept |
| **5** | **Personal Profile Dashboard** | 🟡 Partial | Profile edit, mock stats | `/api/users/me`, `/api/users/update`, YatraCoin wallet, requests table |
| **6** | **Trip Details** | 🔴 Not started | — | Trip page, itinerary builder, cost split, OpenWeather, sharing |
| **7** | **Payment Gateway** | 🔴 Not started | — | Stripe/Razorpay, YatraCoin (Web3/escrow), `/api/payments/process` |
| **8** | **Chat** | 🔴 Not started | — | Firebase/Socket.io, unlock after mutual accept, report/block |
| **9** | **AI Chatbot & Recommendations** | 🔴 Not started | — | OpenAI/HF API, `/api/ai/recommend`, floating chat UI |
| **10** | **Cultural Heritage Showcase** | 🔴 Not started | — | Gallery, AR.js optional, API for content |
| **11** | **Security (SOS, Emergency)** | 🔴 Not started | — | 112/Twilio, emergency contacts, live location, anomaly alerts |
| **12** | **Weather Widget** | 🔴 Not started | — | OpenWeather API, cache, widget on trip/destination |
| **13** | **Medical Assistant** | 🔴 Not started | — | OpenAI symptom flow, disclaimers, link to emergency |
| **14** | **Room-Sharing Finder** | 🔴 Not started | — | Matching + preferences, payments split |
| **15** | **Manuscript Transcription** | 🔴 Not started | — | react-webcam, Tesseract/ML Kit, Google Translate, AI summary |
| **16** | **App Integration** | 🟡 Partial | Single App, navbar, pages | Protected routes, PWA, i18n, dark mode, Redux/state, admin |

---

## Recommended Phases

### Phase 1 – Core Auth & Access (Section 1)
- Registration form (name, email, phone, password, language, optional ID upload).
- Login (email/password + social: Google/Facebook).
- JWT auth + bcrypt; email/phone OTP verification.
- Forgot password; duplicate/invalid error handling.
- Protected routes; redirect to dashboard on success.
- **Tech choice:** Supabase Auth (fits existing Supabase) **or** Node/Express + MongoDB as per spec.

### Phase 2 – Destination & Matching (Sections 2, 3)
- Destination search API + OpenWeather; AI suggestions.
- Flash pooling: nearby users (2km), WebSockets, request/accept flow, verified/safety filters.

### Phase 3 – Profiles & Trips (Sections 4, 5, 6)
- Profile API with visibility rules; personal dashboard and YatraCoin; trip details, itinerary, cost split.

### Phase 4 – Payments & Chat (Sections 7, 8)
- Payments (Stripe/Razorpay + YatraCoin); chat (Firebase/Socket.io) unlocked after mutual accept.

### Phase 5 – AI & Content (Sections 9, 10, 12, 13, 14, 15)
- AI chatbot, heritage showcase, weather widget, medical assistant, room-sharing, manuscript tool.

### Phase 6 – Safety & Polish (Sections 11, 16)
- SOS, emergency contacts, live location; then global routing, PWA, i18n, dark mode, admin.

---

## Section 1 – Auth (Done)

Implemented with **Clerk** (email + Google and other social logins):
- **`src/main.tsx`** – `ClerkProvider` with `VITE_CLERK_PUBLISHABLE_KEY`; routes: `/login` (SignIn), `/register` (SignUp), `/forgot-password` → redirect to `/login`, `/*` protected.
- **`src/pages/Login.tsx`** – Clerk `<SignIn />` (email, Google, etc.; “Forgot password?” built in).
- **`src/pages/Register.tsx`** – Clerk `<SignUp />`.
- **`src/components/ProtectedRoute.tsx`** – Uses Clerk `useAuth()`; redirects to `/login` if not signed in.
- **`src/App.tsx`** – Uses `useUser()` and `useClerk().signOut` for navbar user and sign-out.
- **`.env.example`** – `VITE_CLERK_PUBLISHABLE_KEY` (get key from [Clerk Dashboard](https://dashboard.clerk.com)).

**To run:**
1. Ensure `.env` has `VITE_CLERK_PUBLISHABLE_KEY=pk_test_...` (Vite only exposes `VITE_` prefixed vars).
2. In [Clerk Dashboard](https://dashboard.clerk.com) → **Paths**: set Sign-in URL to `/login`, Sign-up URL to `/register`.
3. In **Configure** → **Allowed redirect URLs**: add `http://localhost:5173` and your production URL.
4. Enable Email and Google in **User & Authentication** → **Social connections**.
5. Run `npm install` and `npm run dev`.

---

## Next Step

Choose the next section to implement:
2. **Destination Selection** (backend API, OpenWeather, AI recommendations)  
3. **Flash Pooling & Matching** (geofencing, WebSockets, request/accept)  
4–16. Any other section from the table above.
