# Miaomiao Backend

Serverless backend for the Miaomiao cat encounter tracking app. Built with Netlify Functions, Neon PostgreSQL, and TypeScript.

## Architecture

- **Runtime**: Netlify Functions (Node.js 20+)
- **Database**: Neon PostgreSQL (serverless Postgres)
- **ORM**: Drizzle ORM
- **Storage**: Cloudinary (image uploads)
- **Validation**: Zod
- **Auth**: Device-based identity (V1)

## Quick Start

### Prerequisites

- Node.js 20+
- A Neon PostgreSQL database
- (Optional) Cloudinary account for image uploads

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your actual values

# Run database migrations
npm run db:migrate

# Seed static data
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | No | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API secret |
| `RECOGNITION_PROVIDER` | No | `mock` (default), `google`, or `aws` |
| `NODE_ENV` | No | `development` or `production` |

## API Endpoints

### Health
- `GET /api/health` - Health check

### Recognition
- `POST /api/recognize` - Submit cat photo for AI recognition

### Dex (Cat Encyclopedia)
- `GET /api/dex` - Get all dex entries with discovery status
- `GET /api/dex/:id` - Get specific dex entry

### Knowledge
- `GET /api/knowledge/:id` - Get knowledge card

### My Cats
- `GET /api/cats` - Get user's cat profiles
- `GET /api/cats/:id` - Get specific cat profile with encounters

### Encounters
- `GET /api/encounters` - Get encounters (with pagination)
- `POST /api/encounters` - Create new encounter
- `PATCH /api/encounters/:id` - Update encounter

### Timeline
- `GET /api/timeline` - Get chronological encounter history

### Matches
- `POST /api/matches/suggest` - Get possible same-cat suggestions
- `POST /api/matches/:id/resolve` - Accept or reject match

### Uploads
- `POST /api/uploads/sign` - Get signed upload parameters

## Authentication

V1 uses device-based authentication. Include these headers with every request:

```
X-Device-Id: your-device-id
X-Device-Fingerprint: your-device-fingerprint
```

The backend will automatically create a user account linked to this device.

## Database Schema

See [PLAN.md](./PLAN.md) for detailed schema documentation.

Key entities:
- **Devices** - Anonymous device identification
- **Users** - Linked to devices (V1: one user per device)
- **Encounters** - Individual cat sightings
- **MyCatProfiles** - Aggregated profiles of known cats
- **DexEntries** - Static cat breed information
- **PossibleMatches** - Suggested same-cat matches

## Scripts

```bash
npm run build        # Compile TypeScript
npm run dev          # Start development server
npm run db:generate  # Generate migration files
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed static data
npm run db:studio    # Open Drizzle Studio
npm run test         # Run tests
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checking
```

## Deployment

### Netlify Setup

1. Connect your GitHub repo to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify UI
5. Deploy!

### First Deploy Checklist

- [ ] `DATABASE_URL` configured
- [ ] Database migrations applied
- [ ] `npm run db:seed` executed
- [ ] Cloudinary credentials added (for image uploads)
- [ ] CORS configured for your frontend domain

## Project Structure

```
backend/
├── netlify/
│   └── functions/
│       └── api.ts          # Main API handler
├── src/
│   ├── db/
│   │   ├── schema.ts       # Drizzle schema
│   │   └── seed.ts         # Seed data
│   ├── lib/
│   │   ├── auth.ts         # Device auth
│   │   ├── db.ts           # Database connection
│   │   ├── errors.ts       # Error classes
│   │   ├── logger.ts       # Structured logging
│   │   └── validation.ts   # Zod schemas
│   ├── services/
│   │   ├── matching.ts     # Match suggestion algorithm
│   │   ├── recognition.ts  # Cat recognition adapter
│   │   └── storage.ts      # Cloudinary integration
│   └── types/
│       └── index.ts        # TypeScript types
├── netlify.toml
├── drizzle.config.ts
└── package.json
```

## License

Apache-2.0
