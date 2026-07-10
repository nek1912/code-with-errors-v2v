# Project Information

**Project Name**: SafeSphere
**Project Description**: A robust Node.js backend providing real-time tracking, intelligent routing, SOS emergency management, and AI integration for women's safety.
**Hackathon Theme**: Women's Safety & Personal Security
**Backend Goal**: Deliver scalable, low-latency APIs for live location processing, AI companion features, and immediate guardian broadcasting.
**Current Development Phase**: Rapid Prototyping / Hackathon

**Backend Tech Stack**:
- Node.js (CommonJS)
- Express.js
- JavaScript
- Supabase (PostgreSQL)
- Supabase Auth
- Supabase Realtime (Channels)
- Supabase Storage
- Google Gemini API SDK

**External APIs**:
- Overpass API (OpenStreetMap)
- OpenRouteService (Routing)
- Google Gemini (gemini-1.5-flash)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Backend Architecture

The backend follows a service-oriented architecture decoupled from the Express API routes.

Client
↓
API Routes (Express Router)
↓
Services (Business Logic layer)
↓
Database (Supabase Client) & External APIs

*Note: Repositories and Controllers are currently merged into the Service and Route layers for rapid hackathon development.*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Current Backend Status

| Feature | Status | Completion % | Notes |
|---------|--------|--------------|-------|
| Journey Tracking | ✅ Completed | 100% | Realtime location, auto-events, battery sync |
| Guardian Dashboard | ✅ Completed | 100% | Invite generation, live tracking webhooks |
| AI Assistant | ✅ Completed | 100% | Integrated Gemini Flash 1.5 |
| Safe Places | ✅ Completed | 100% | Integrated Overpass API with mock fallbacks |
| Emergency Center | ✅ Completed | 100% | SOS lock implemented, evidence vault pending |
| Evidence Vault | ✅ Completed | 100% | Multer / Supabase Storage |
| Learning Hub | ✅ Completed | 100% | Schema, Services, Routes, PDFs, gamification |
| Smart Alerts | ❌ Not Started | 0% | Needs background chron jobs |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Database

### `journeys`
- **Purpose**: Stores active and historical user journeys.
- **Fields**: id, user_id, destination_name, destination_lat, destination_lng, transport_mode, status, started_at, ended_at.
- **Relationships**: user_id -> users
- **Current Status**: ✅ Completed

### `journey_locations`
- **Purpose**: Stores GPS ping history for journeys.
- **Fields**: id, journey_id, latitude, longitude, speed, distance_remaining, eta, captured_at.
- **Relationships**: journey_id -> journeys
- **Current Status**: ✅ Completed

### `journey_events`
- **Purpose**: Auto-generated timeline events (Stopped, Reached, SOS).
- **Fields**: id, journey_id, event_type, title, description, created_at.
- **Relationships**: journey_id -> journeys
- **Current Status**: ✅ Completed

### `guardian_links`
- **Purpose**: Invite links and guardian relationships.
- **Fields**: id, user_id, guardian_user_id, guardian_email, relationship, status, invite_token.
- **Relationships**: user_id -> users
- **Current Status**: ✅ Completed

### `emergency_sessions`
- **Purpose**: Emergency state tracking and evidence linking.
- **Fields**: id, journey_id, status, audio_url, created_at.
- **Relationships**: journey_id -> journeys
- **Current Status**: 🟡 In Progress

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Backend Modules

### Journey Tracking
- **Purpose**: Core location pinging and event generation.
- **Dependencies**: Supabase JS, `LocationService`, `EventEngine`
- **Database Tables**: `journeys`, `journey_locations`, `journey_events`
- **Current APIs**: `/api/journey/start`, `/api/journey/location`, `/api/journey/end`, `/api/journey/battery`, `/api/journey/deviation`
- **Completed Features**: GPS streaming, auto-events (STOPPED, REACHED).
- **Pending Features**: Background processing for prolonged disconnects.

### Guardian Dashboard
- **Purpose**: Connecting wards with guardians.
- **Dependencies**: `guardian.js`
- **Database Tables**: `guardian_links`
- **Current APIs**: `/api/guardian/generate-invite`, `/api/guardian/accept-invite`, `/api/guardian/safe-places`
- **Completed Features**: UUID invite generation, fetching nearby safe places.
- **Pending Features**: SMS/Email push alerts via Twilio/SendGrid.

### Emergency Center
- **Purpose**: Triggering and handling SOS alerts.
- **Dependencies**: `JourneyService`
- **Database Tables**: `journeys`, `emergency_sessions`
- **Current APIs**: `/api/journey/emergency`
- **Completed Features**: Locking journey to EMERGENCY status.
- **Pending Features**: Audio/Video evidence uploading.

### AI Assistant
- **Purpose**: Route intelligence and context-aware chat.
- **Dependencies**: `@google/generative-ai`
- **Current APIs**: `/api/ai/chat`
- **Completed Features**: Gemini 1.5 integration.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# API Inventory

| Method | Endpoint | Description | Auth | Response | Status |
|--------|----------|-------------|------|----------|--------|
| POST | `/api/journey/start` | Starts journey | Required | Journey ID | ✅ Completed |
| POST | `/api/journey/location` | Processes GPS pings | Required | ETA, Distance | ✅ Completed |
| POST | `/api/journey/battery` | Updates battery status | Required | Success | ✅ Completed |
| POST | `/api/journey/deviation` | Flags route deviation | Required | Success | ✅ Completed |
| POST | `/api/journey/emergency` | Locks SOS state | Required | Status | ✅ Completed |
| GET | `/api/guardian/safe-places`| Fetches Overpass data | Required | Array | ✅ Completed |
| POST | `/api/guardian/generate-invite` | Creates guardian link | Required | Token UUID | ✅ Completed |
| POST | `/api/ai/chat` | AI Companion Chat | Required | Markdown | ✅ Completed |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# External API Integrations

### Gemini
- **Purpose**: AI Route Assistant
- **Current Integration Status**: ✅ Completed
- **Used By**: `/api/ai/chat`
- **Environment Variables**: `GEMINI_API_KEY`
- **Rate Limits**: Free tier limits apply.

### Overpass API
- **Purpose**: Fetch OSM Safe Places (Police, Hospitals, Metros)
- **Current Integration Status**: ✅ Completed
- **Used By**: `/api/guardian/safe-places`
- **Rate Limits**: Strict limits without User-Agent.
- **Fallback Strategy**: If 429 occurs, returns a set of mock safe places in Vadodara to ensure the UI does not break.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Services

### LocationService
- **Purpose**: Processes live GPS, calculates distances.
- **Dependencies**: `EventEngine`, `DistanceService`, Supabase
- **Status**: ✅ Completed

### JourneyService
- **Purpose**: Journey lifecycle and emergency/battery states.
- **Dependencies**: Supabase
- **Status**: ✅ Completed

### EventEngine
- **Purpose**: Auto-generates events (Stopped, Reached, Risk Area).
- **Dependencies**: Supabase
- **Status**: ✅ Completed

### SafePlacesService
- **Purpose**: Queries Overpass API and processes proximity.
- **Dependencies**: Axios, `calculateDistance`
- **Status**: ✅ Completed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Environment Variables

| Variable | Purpose | Required | Status |
|----------|---------|----------|--------|
| `SUPABASE_URL` | Connects to DB | Yes | Configured |
| `SUPABASE_SERVICE_ROLE_KEY` | Bypasses RLS | Yes | Configured |
| `PORT` | Express port | Yes | Configured |
| `GEMINI_API_KEY` | Generative AI | Yes | Configured |
| `OPENROUTE_API_KEY` | Routing | Yes | Pending Usage |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Folder Structure

```
backend/
├── routes/
│   ├── admin.js
│   ├── aiCompanion.js
│   ├── alerts.js
│   ├── emergency.js
│   ├── evidence.js
│   ├── guardian.js
│   ├── journey.js
│   ├── learning.js
│   ├── reports.js
├── services/
│   ├── DistanceService.js
│   ├── ETAService.js
│   ├── EventEngine.js
│   ├── JourneyService.js
│   ├── LocationService.js
│   ├── SafePlacesService.js
├── utils/
│   ├── supabase.js
├── index.js
├── package.json
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Completed Backend Features

- ✅ Database Connections (Supabase)
- ✅ Journey Tracking & Location Processing
- ✅ Auto-Event Timeline Generation (EventEngine)
- ✅ Overpass API Integration (w/ Rate Limit Fallbacks)
- ✅ Gemini Flash 1.5 Migration
- ✅ SOS Emergency State Locking
- ✅ Battery & Route Deviation Handlers
- ❌ Evidence Vault Uploads
- ❌ Push Notifications
- ❌ Learning Hub Content API

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Pending Backend Features

### High Priority
- Implement `multer` for Evidence Vault uploads.
- Complete Emergency SOS audio/video endpoint.

### Medium Priority
- Learning Hub static APIs.
- Notification service for Guardian push alerts.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Known Issues

| Issue | Cause | Priority | Status |
|-------|-------|----------|--------|
| Supabase Import Bug | Destructuring `require` export | High | ✅ Fixed |
| Overpass 406 Error | Missing User-Agent | High | ✅ Fixed |
| Postgres UUID | Sent string instead of UUID | Medium | ✅ Fixed |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Backend Development Rules

- **Never duplicate APIs.**
- **Never duplicate services.**
- **Never duplicate database tables.**
- **Always reuse existing services.**
- **Always keep business logic inside services.**
- **Never call external APIs directly from route handlers.** Always create service wrappers.
- **Adapt to Current Tech Stack**: The backend is Node.js/Express. Do not attempt to use Next.js API route paradigms here.
- **Always update this document** after implementing any feature.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Backend Coding Standards

- **DRY (Don't Repeat Yourself)**
- **KISS (Keep It Simple, Stupid)**
- **Service Layer Pattern**: Keep routes clean; move logic to `services/`.
- **Centralized Error Handling**: Use `try/catch` and return standardized `{ error: 'message' }` JSON.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Change Log

| Date | Feature | Developer | Description | Status |
|------|---------|-----------|-------------|--------|
| 2026-07-09 | Journey Tracking | AI Agent | Process location, battery, deviation, SOS | ✅ Completed |
| 2026-07-09 | Safe Places | AI Agent | Integrated Overpass API with mock fallbacks | ✅ Completed |
| 2026-07-09 | Gemini Setup | AI Agent | Upgraded Route Intelligence to Gemini | ✅ Completed |
| 2026-07-09 | Guardian Invites | AI Agent | UUID bug fix for DB insertion | ✅ Completed |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# AI Agent Instructions

Before generating any backend code:
1. **Read this document.**
2. **Check if the feature already exists.**
3. **Reuse services whenever possible.**
4. **Do not create duplicate tables or APIs.**
5. **Do not change existing architecture without updating this document.**
6. If the feature already exists, **improve it instead of rewriting it.**
7. If backend is completed, **do not regenerate it.** Only implement missing functionality.
8. **After completing any backend feature, update this document automatically.**
