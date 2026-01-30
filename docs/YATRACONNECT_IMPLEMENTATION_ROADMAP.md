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

Implemented with **Supabase Auth**:
- **`src/lib/supabase.ts`** – Browser Supabase client (uses existing `utils/supabase/info.tsx`).
- **`src/contexts/AuthContext.tsx`** – `useAuth()` with `signUp`, `signIn`, `signOut`, `resetPassword`, `user`, `profile`, `loading`.
- **`src/pages/Login.tsx`** – Email/password login, “Forgot password?” link, placeholders for Google/Facebook.
- **`src/pages/Register.tsx`** – Name, email, phone (optional), password, preferred language; redirect to login after signup.
- **`src/pages/ForgotPassword.tsx`** – Email field, sends reset link via Supabase.
- **`src/components/ProtectedRoute.tsx`** – Redirects unauthenticated users to `/login`, shows spinner while auth loads.
- **Routing** – `main.tsx` uses `react-router-dom`: public routes `/login`, `/register`, `/forgot-password`; all other paths wrapped in `ProtectedRoute` → App. Navbar uses real `user`/`profile` and `signOut`.

**To run:** `npm install` (installs `react-router-dom`), then `npm run dev`. Open the app; you’ll be redirected to `/login` until you sign in. Enable Email auth (and optional confirmation) in Supabase Dashboard → Authentication.

---

## Next Step

Choose the next section to implement:
2. **Destination Selection** (backend API, OpenWeather, AI recommendations)  
3. **Flash Pooling & Matching** (geofencing, WebSockets, request/accept)  
4–16. Any other section from the table above.
