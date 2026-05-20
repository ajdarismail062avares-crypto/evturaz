# LuxEstate — AI-Powered Real Estate Platform

> Zillow + Airbnb + Unreal Engine. The future of real estate browsing.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  Next.js 14 · React · TypeScript · Tailwind · Three.js/R3F     │
│  Zustand · Framer Motion · React Hook Form · Mapbox GL          │
└────────────────────────┬────────────────────────────────────────┘
                         │ REST + GraphQL + WebSockets
┌────────────────────────▼────────────────────────────────────────┐
│                         API LAYER                               │
│  Node.js · Express · Socket.IO · JWT Auth · Rate Limiting       │
│  Multer · AWS S3 · Stripe · OpenAI SDK                          │
└──────┬───────────────────────────────────────┬──────────────────┘
       │                                       │
┌──────▼──────┐                       ┌────────▼───────┐
│ PostgreSQL  │                       │     Redis      │
│  (Prisma)   │                       │  Cache/Queues  │
└─────────────┘                       └────────────────┘
```

---

## Folder Structure

```
realestate-platform/
├── frontend/                      # Next.js 14 App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           # Landing page (Hero, Features, CTA)
│   │   │   ├── properties/
│   │   │   │   ├── page.tsx       # SSR listing page
│   │   │   │   ├── PropertiesClient.tsx  # Grid/Map/Split views
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx   # SSR property detail + OG tags
│   │   │   │       ├── PropertyDetailClient.tsx
│   │   │   │       └── tour/
│   │   │   │           └── page.tsx  # Full-screen 3D tour
│   │   │   ├── auth/login/        # JWT login form
│   │   │   ├── auth/register/     # Role-based registration
│   │   │   ├── dashboard/         # User dashboard
│   │   │   └── admin/             # Admin panel
│   │   ├── components/
│   │   │   ├── 3d/
│   │   │   │   ├── FreeWalkMode.tsx    # ★ MAIN 3D ENGINE
│   │   │   │   ├── RoomGeometry.tsx    # Room mesh + furniture
│   │   │   │   ├── OtherPlayer.tsx     # Multiplayer avatars
│   │   │   │   └── TourChat.tsx        # In-tour chat
│   │   │   ├── ui/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── PropertyCard.tsx
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   ├── FilterPanel.tsx
│   │   │   │   └── MortgageCalculator.tsx
│   │   │   ├── map/PropertyMap.tsx     # Mapbox interactive map
│   │   │   └── ai/AIAssistant.tsx      # Floating GPT-4o chat
│   │   ├── store/
│   │   │   ├── auth.ts            # Zustand auth + token persist
│   │   │   └── tour.ts            # Socket.IO tour state
│   │   ├── lib/
│   │   │   ├── api.ts             # Axios instance
│   │   │   └── utils.ts           # cn(), formatPrice(), calculateMortgage()
│   │   └── types/index.ts         # All TypeScript types
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── Dockerfile
│
├── backend/                       # Node.js + Express
│   ├── src/
│   │   ├── index.ts               # Server entry, middleware setup
│   │   ├── routes/
│   │   │   ├── auth.ts            # Register, login, /me, refresh
│   │   │   ├── properties.ts      # CRUD + search + favorites
│   │   │   ├── users.ts           # Profile, dashboard data
│   │   │   ├── tours.ts           # Tour sessions, 3D model upload
│   │   │   ├── ai.ts              # Describe, recommend, chat, stage
│   │   │   ├── payments.ts        # Stripe intents + webhooks
│   │   │   ├── contracts.ts       # Digital contracts + e-signatures
│   │   │   ├── admin.ts           # Stats, moderation, user management
│   │   │   └── upload.ts          # S3 presigned URLs
│   │   ├── middleware/
│   │   │   ├── auth.ts            # JWT middleware + RBAC
│   │   │   └── errorHandler.ts
│   │   ├── services/
│   │   │   └── ai.service.ts      # OpenAI integrations
│   │   ├── websocket/
│   │   │   └── server.ts          # Socket.IO multiplayer tours
│   │   └── lib/prisma.ts
│   ├── prisma/schema.prisma       # Full PostgreSQL schema
│   ├── tsconfig.json
│   └── Dockerfile
│
├── docker-compose.yml             # PostgreSQL + Redis + Backend + Frontend
└── .github/workflows/ci.yml      # GitHub Actions CI/CD
```

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `users` | All user roles (buyer/seller/agent/admin) |
| `properties` | Listings with 3D tour data, pricing, geo |
| `tour_sessions` | Live + scheduled multiplayer tours |
| `favorites` | User-property saves |
| `reviews` | Property ratings |
| `messages` | User-to-user DMs |
| `inquiries` | Buyer → agent contact |
| `saved_searches` | Alert subscriptions |
| `notifications` | Platform alerts |
| `payments` | Stripe transaction records |
| `contracts` | Digital purchase/rental agreements |
| `property_amenities` | Normalized amenity tags |

---

## 3D Free Walk Mode Architecture

```
FreeWalkMode
├── Canvas (React Three Fiber)
│   ├── PointerLockControls  ← mouse look
│   ├── PlayerController     ← WASD + velocity physics
│   ├── SceneLighting        ← dynamic day/dusk/night
│   ├── Sky                  ← procedural atmosphere
│   ├── RoomGeometry[]       ← walls, floors, ceilings, baseboard
│   │   └── FurnitureMesh[]  ← sofas, beds, tables, etc.
│   └── OtherPlayer[]        ← multiplayer avatars (lerped)
├── HUD Overlay
│   ├── Room navigation sidebar
│   ├── Time of day toggle
│   ├── Wall color picker
│   ├── Multiplayer controls
│   └── Mobile joystick
└── TourChat (Socket.IO)
```

**Performance targets:**
- 60fps on mid-range desktop
- 30fps on mobile (reduced geometry)
- LOD switching for rooms not in view
- Shadows: PCFSoftShadowMap @ 2048px

---

## API Reference

### Auth
| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | JWT |
| POST | `/api/auth/refresh` | JWT |

### Properties
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/properties` | Public |
| GET | `/api/properties/:id` | Public |
| POST | `/api/properties` | SELLER/AGENT |
| PATCH | `/api/properties/:id` | Owner/ADMIN |
| DELETE | `/api/properties/:id` | Owner/ADMIN |
| POST | `/api/properties/:id/favorite` | JWT |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/chat` | GPT-4o property Q&A |
| POST | `/api/ai/describe` | Generate listing description |
| GET | `/api/ai/recommendations` | Personalized properties |
| POST | `/api/ai/estimate` | AI price estimation |
| POST | `/api/ai/staging` | Virtual staging suggestions |

### WebSocket Events
| Event | Direction | Description |
|-------|-----------|-------------|
| `join_tour` | Client→Server | Join tour room |
| `tour_move` | Client→Server | Position update |
| `participant_joined` | Server→Client | New user entered |
| `participant_moved` | Server→Client | Position broadcast |
| `chat_message` | Bidirectional | Tour chat |
| `voice_signal` | Bidirectional | WebRTC signaling |

---

## MVP Roadmap

### Phase 1 — Core (Weeks 1–6)
- [x] Database schema & Prisma setup
- [x] JWT auth + RBAC
- [x] Property CRUD + advanced search
- [x] Image upload to S3
- [x] Favorites, reviews, inquiries
- [x] Basic 3D room viewer

### Phase 2 — 3D & AI (Weeks 7–12)
- [x] Free Walk Mode (WASD + pointer lock)
- [x] Multiplayer tours (WebSocket)
- [x] Tour chat
- [x] AI assistant (GPT-4o)
- [x] AI property descriptions
- [x] Mortgage calculator
- [x] Mapbox integration

### Phase 3 — Commerce (Weeks 13–18)
- [x] Stripe payment intents
- [x] Digital contracts + e-signatures
- [ ] Mortgage pre-approval widget
- [ ] Virtual staging marketplace
- [ ] Featured listing payments

### Phase 4 — Scale (Weeks 19–24)
- [ ] LiDAR/Matterport scan import
- [ ] WebRTC voice chat in tours
- [ ] VR headset support (WebXR)
- [ ] AR mode (mobile)
- [ ] Mobile app (React Native)
- [ ] ML recommendation engine
- [ ] Neighborhood data API (crime, schools, walkability)
- [ ] Smart home IoT preview

---

## Cloud Infrastructure

### Recommended Stack (AWS)
```
CloudFront CDN
     ↓
Application Load Balancer
     ↓              ↓
EC2/ECS          EC2/ECS
(Frontend)       (Backend)
     ↓
RDS PostgreSQL   ElastiCache Redis   S3 (media)
```

### Scaling Strategy
| Service | Initial | At Scale |
|---------|---------|----------|
| Frontend | Vercel / 2× EC2 t3.medium | CloudFront + ECS Fargate |
| Backend | 2× EC2 t3.large | ECS Fargate auto-scaling |
| Database | RDS t3.medium | RDS Aurora Serverless v2 |
| Cache | ElastiCache t3.micro | ElastiCache cluster |
| Media | S3 + CloudFront | S3 multi-region |
| WebSocket | Single instance | AWS API Gateway WebSocket |

### Cost Estimate (MVP)
| Service | Monthly |
|---------|---------|
| RDS PostgreSQL t3.medium | ~$50 |
| EC2 t3.large × 2 | ~$120 |
| ElastiCache t3.micro | ~$15 |
| S3 + CloudFront (100GB) | ~$10 |
| **Total** | **~$195/mo** |

---

## Monetization Strategy

| Stream | Model | Target |
|--------|-------|--------|
| Featured listings | $49–$199/mo | Agents/sellers |
| Agent subscriptions | $99/mo Pro plan | Realtors |
| Virtual tour hosting | $29/property | Sellers |
| Mortgage referrals | $200–$500/lead | Lenders |
| Transaction fee | 0.5% on digital contracts | Buyers/sellers |
| AI usage | Usage-based tiers | Power users |

---

## Security Practices

- JWT with 7d expiry + refresh tokens
- Bcrypt password hashing (cost factor 12)
- Helmet.js security headers
- Rate limiting: 200 req/15min per IP
- Zod input validation on all endpoints
- Role-based access control (RBAC)
- Stripe webhook signature verification
- S3 presigned URLs (expire in 5min)
- CORS restricted to frontend origin

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/your-org/luxestate.git
cd luxestate

# 2. Start infrastructure
docker-compose up postgres redis -d

# 3. Backend
cd backend
cp .env.example .env   # fill in secrets
npm install
npx prisma migrate dev
npm run dev            # :4000

# 4. Frontend
cd ../frontend
cp .env.example .env.local
npm install
npm run dev            # :3000
```

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS, Framer Motion |
| 3D Engine | Three.js, React Three Fiber, Drei |
| State | Zustand (persist) |
| Forms | React Hook Form + Zod |
| Maps | Mapbox GL, react-map-gl |
| Backend | Node.js, Express, TypeScript |
| ORM | Prisma + PostgreSQL |
| Cache | Redis (ioredis) |
| Real-time | Socket.IO |
| AI | OpenAI GPT-4o-mini |
| Payments | Stripe |
| Storage | AWS S3 |
| Auth | JWT + bcrypt + Google OAuth |
| CI/CD | GitHub Actions |
| Containers | Docker + Docker Compose |

---

*Built for scale. Designed for luxury. Powered by AI.*
