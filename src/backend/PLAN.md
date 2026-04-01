# Miaomiao Backend Architecture Plan

## 1. Architecture Summary

### Overview
A serverless-first backend designed for Netlify Functions with a managed database (Neon PostgreSQL) and cloud storage (Cloudinary). Optimized for small teams with minimal infrastructure overhead.

### Stack Decisions

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Runtime** | Netlify Functions (Node.js) | Zero-config deployment, scales to zero, frontend-friendly hosting |
| **Language** | TypeScript | Type safety, shared types with frontend, maintainability |
| **Database** | Neon PostgreSQL | Serverless Postgres, generous free tier, excellent DX |
| **ORM** | Drizzle ORM | Type-safe, lightweight, migration-friendly |
| **Storage** | Cloudinary | Free tier for images, signed uploads, transformation API |
| **Validation** | Zod | Runtime type safety, frontend-compatible schemas |
| **Auth (V1)** | Device Identity | Simple fingerprinting, no password complexity |

### Tradeoffs Considered

**Why not Supabase?**
- Supabase is excellent but adds another platform to manage
- Neon + Netlify keeps everything in two familiar ecosystems
- Easier to migrate away from if needed

**Why not AWS Lambda directly?**
- Netlify Functions provide better DX for small teams
- Built-in CI/CD with git push
- No IAM complexity

**Why Cloudinary over S3?**
- Image transformations on-the-fly (resizing for mobile)
- Signed upload URLs without complex Lambda@Edge
- Generous free tier sufficient for V1

## 2. Data Model / Schema

### Entity Relationship Diagram

```
Device (device_id PK)
  └── User (id PK, device_id FK)
      ├── Encounter (id PK, user_id FK, cat_id FK nullable)
      │   └── triggers → PossibleMatch
      ├── MyCatProfile (id PK, user_id FK)
      │   └── aggregates from Encounter
      └── UploadedImage (id PK, uploaded_by FK)

DexEntry (id PK, breed unique) - Global/static data
KnowledgeCard (id PK) - Global/static data
PossibleMatch (id PK, encounter_id FK, suggested_cat_id FK)
```

### PostgreSQL Schema

```sql
-- Devices (anonymous identity)
CREATE TABLE devices (
  id TEXT PRIMARY KEY,
  fingerprint TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_seen TIMESTAMP DEFAULT NOW()
);

-- Users (linked to device for V1)
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT REFERENCES devices(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Encounters (the core entity)
CREATE TABLE encounters (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) NOT NULL,
  cat_id TEXT REFERENCES my_cat_profiles(id),
  nickname TEXT NOT NULL,
  breed TEXT NOT NULL,
  location TEXT,
  notes TEXT,
  personality TEXT,
  weather TEXT,
  photo_url TEXT,
  photo_storage_key TEXT,
  recognition_confidence DECIMAL(3,2),
  recognition_provider TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- My Cat Profiles (aggregated view of encounters)
CREATE TABLE my_cat_profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) NOT NULL,
  nickname TEXT NOT NULL,
  breed TEXT NOT NULL,
  first_encounter_date TIMESTAMP,
  last_encounter_date TIMESTAMP,
  encounter_count INTEGER DEFAULT 0,
  favorite_spot TEXT,
  personality_tags TEXT[],
  photo_url TEXT,
  intimacy_level INTEGER DEFAULT 1 CHECK (intimacy_level BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Dex Entries (static/reference data)
CREATE TABLE dex_entries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  breed TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('Common', 'Uncommon', 'Rare', 'Legendary')),
  fun_fact TEXT,
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Dex Discoveries (junction table)
CREATE TABLE user_dex_discoveries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) NOT NULL,
  dex_entry_id TEXT REFERENCES dex_entries(id) NOT NULL,
  discovery_count INTEGER DEFAULT 1,
  first_discovered_at TIMESTAMP DEFAULT NOW(),
  last_discovered_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, dex_entry_id)
);

-- Knowledge Cards (static/reference data)
CREATE TABLE knowledge_cards (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Behavior', 'Health', 'Fun Fact')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Possible Matches (suggestions, not automatic)
CREATE TABLE possible_matches (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id TEXT REFERENCES encounters(id) NOT NULL,
  suggested_cat_id TEXT REFERENCES my_cat_profiles(id) NOT NULL,
  confidence DECIMAL(3,2) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Uploaded Images (tracking)
CREATE TABLE uploaded_images (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by TEXT REFERENCES users(id) NOT NULL,
  storage_provider TEXT NOT NULL DEFAULT 'cloudinary',
  storage_public_id TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  original_filename TEXT,
  mime_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 3. Endpoint Contracts

### POST /api/recognize
**Purpose**: Submit cat photo for AI recognition

**Request**:
```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQ...",
  "filename": "cat-photo.jpg"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "breed": "三花猫",
    "confidence": 0.85,
    "message": "光线太棒了！AI 识别这可能是一位三花猫朋友。",
    "alternatives": [
      {"breed": "橘色虎斑", "confidence": 0.12}
    ]
  }
}
```

**Error Cases**:
- 400: Invalid image format
- 413: Image too large
- 429: Rate limit exceeded
- 503: Recognition service unavailable

### GET /api/dex
**Purpose**: Get all dex entries with user's discovery status

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "d1",
      "breed": "三花猫",
      "description": "三花猫是指被毛通常有 25% 到 75% 的白色...",
      "rarity": "Common",
      "isDiscovered": true,
      "discoveryCount": 3,
      "funFact": "几乎所有的三花猫都是雌性...",
      "photoUrl": "https://..."
    }
  ]
}
```

### GET /api/dex/:id
**Purpose**: Get specific dex entry

**Response**: Single DexEntry object

### GET /api/knowledge/:id
**Purpose**: Get knowledge card

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "k1",
    "title": "Why do cats purr?",
    "content": "Cats purr not only when they are happy...",
    "category": "Behavior"
  }
}
```

### GET /api/cats
**Purpose**: Get user's cat profiles

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "c1",
      "nickname": "麻糬 (Mochi)",
      "breed": "三花猫",
      "firstEncounterDate": "2023-09-15",
      "lastEncounterDate": "2023-10-24",
      "encounterCount": 12,
      "favoriteSpot": "阳光庭院",
      "personalityTags": ["活泼", "好奇", "亲人"],
      "photoUrl": "https://...",
      "intimacyLevel": 4
    }
  ]
}
```

### GET /api/cats/:id
**Purpose**: Get specific cat profile with encounters

**Response**: MyCatProfile with `encounters` array

### POST /api/encounters
**Purpose**: Create new encounter

**Request**:
```json
{
  "nickname": "麻糬 (Mochi)",
  "breed": "三花猫",
  "location": "阳光庭院",
  "notes": "她对阳光中舞动的尘埃非常感兴趣...",
  "personality": "活泼",
  "weather": "晴朗",
  "photoUrl": "https://...",
  "recognitionConfidence": 0.85,
  "suggestedCatId": "c1" // optional, from match suggestion
}
```

**Response**: Created Encounter object

### PATCH /api/encounters/:id
**Purpose**: Update encounter (notes, linked cat, etc.)

**Request**: Partial Encounter fields

**Response**: Updated Encounter

### GET /api/timeline
**Purpose**: Get chronological encounter history

**Query Params**: `?limit=20&offset=0&catId=c1`

**Response**:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 45,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

### POST /api/matches/suggest
**Purpose**: Get possible same-cat suggestions for an encounter

**Request**:
```json
{
  "encounterId": "e123"
}
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "m1",
      "currentEncounterId": "e123",
      "suggestedCatId": "c1",
      "confidence": 0.72,
      "reason": "与麻糬 (Mochi) 的毛色图案和位置非常相似。"
    }
  ]
}
```

### POST /api/matches/:id/resolve
**Purpose**: Accept or reject a match suggestion

**Request**:
```json
{
  "action": "accept" | "reject"
}
```

### POST /api/uploads/sign
**Purpose**: Get signed upload parameters for direct-to-cloudinary upload

**Response**:
```json
{
  "success": true,
  "data": {
    "signature": "...",
    "timestamp": 1234567890,
    "apiKey": "123456789",
    "cloudName": "miaomiao",
    "uploadUrl": "https://api.cloudinary.com/v1_1/miaomiao/image/upload"
  }
}
```

### GET /api/health
**Purpose**: Health check

**Response**:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00Z",
  "services": {
    "database": "connected",
    "storage": "connected"
  }
}
```

## 4. Backend Code Structure

```
backend/
├── netlify/
│   └── functions/
│       ├── api.ts              # Main router/handler
│       ├── recognize.ts        # Cat recognition handler
│       ├── dex.ts              # Dex endpoints
│       ├── cats.ts             # Cat profile endpoints
│       ├── encounters.ts       # Encounter endpoints
│       ├── timeline.ts         # Timeline queries
│       ├── matches.ts          # Match suggestion endpoints
│       ├── uploads.ts          # Upload signing
│       └── health.ts           # Health check
├── src/
│   ├── db/
│   │   ├── schema.ts           # Drizzle schema definitions
│   │   ├── migrations/         # Migration files
│   │   └── seed.ts             # Seed data
│   ├── lib/
│   │   ├── db.ts               # Database connection
│   │   ├── auth.ts             # Device identity auth
│   │   ├── errors.ts           # Error classes
│   │   ├── logger.ts           # Structured logging
│   │   └── validation.ts       # Zod schemas
│   ├── services/
│   │   ├── recognition.ts      # Recognition provider adapter
│   │   ├── storage.ts          # Cloudinary integration
│   │   └── matching.ts         # Matching algorithm
│   └── types/
│       └── index.ts            # Shared types
├── tests/
│   ├── unit/
│   └── integration/
├── netlify.toml
├── drizzle.config.ts
├── package.json
└── tsconfig.json
```

## 5. Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:pass@neon-host/dbname"

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Recognition Provider (Google Vision / AWS Rekognition / etc)
RECOGNITION_PROVIDER="google" # or "aws", "mock"
GOOGLE_VISION_API_KEY="..."   # if using Google

# AWS Rekognition (use MM_ prefix to avoid Netlify reserved names)
MM_AWS_ACCESS_KEY_ID="..."       # if using AWS
MM_AWS_SECRET_ACCESS_KEY="..."
MM_AWS_REGION="us-east-1"

# Optional: For rate limiting
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."

# App
NODE_ENV="production"
API_VERSION="1.0.0"
```

## 6. Tests and Verification

### Unit Tests
- Zod schema validation
- Recognition service adapter
- Matching algorithm
- Auth middleware

### Integration Tests
- Full API flow: recognize → save encounter → get timeline
- Dex discovery tracking
- Match suggestion flow
- Upload signing

### Manual Verification
- Health endpoint responds
- All CRUD operations work
- Image upload flow complete
- Error handling graceful

## 7. Deployment Notes

### Netlify Setup
1. Connect GitHub repo to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify UI
5. Deploy!

### Database Setup
1. Create Neon PostgreSQL project
2. Run migrations: `npm run db:migrate`
3. Seed static data: `npm run db:seed`

### First Deploy Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Dex entries seeded
- [ ] Knowledge cards seeded
- [ ] Health endpoint responding
- [ ] CORS configured for frontend domain

## 8. Open Issues / Future Improvements

### V1 Known Limitations
1. **Recognition**: Currently stubbed/mock - needs real provider integration
2. **Auth**: Device fingerprinting only - no user accounts/passwords
3. **Rate Limiting**: Basic implementation - may need Redis for production scale
4. **Matching Algorithm**: Simple breed + location matching - could use image similarity

### V2+ Ideas
- [ ] Real-time notifications for encounters
- [ ] Social features (share encounters)
- [ ] Advanced matching with image embeddings
- [ ] Push notifications
- [ ] Export data
- [ ] Multi-device sync with user accounts
