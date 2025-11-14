# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FlexFacilities is a K-12 school facilities reservation system built as a monorepo:
- **Backend**: Go API using Connect RPC (gRPC-compatible, not REST)
- **Frontend**: Next.js 16 App Router with React 19 and Server Actions
- **Database**: PostgreSQL with custom embedded migration system
- **Protocol**: Protocol Buffers for type-safe API contracts (shared source of truth)

## Essential Commands

All commands use Task (Taskfile.yml). Install Task: https://taskfile.dev

```bash
# Development
task dev              # Start both backend (Go) and frontend (Next.js) concurrently
task dev:go           # Start Go API only (port 8080, hot-reload with air)
task dev:bun          # Start Next.js only (port 3000)

# Code Generation (REQUIRED after proto changes)
task gen:proto        # Regenerate Go + TypeScript code from .proto files
task gen:types        # Generate Next.js typed routes

# Code Quality
task lint             # Lint all code (Biome for TS, standard Go formatting)
cd app && bun check:fix  # Auto-fix linting issues in frontend

# Testing
cd app && bun test    # Run Vitest tests (frontend)
cd api && go test ./...  # Run Go tests (currently minimal)

# Building
task build            # Build both services for production
cd app && bun build   # Build Next.js only (standalone mode)
cd api && go build    # Build Go API binary

# Database
# Migrations run automatically on server start from api/internal/db/migrations/
# Create new migration: api/internal/db/migrations/XXXX_description.sql
```

## Repository Structure

```
FlexFacilities/
├── api/              # Go backend service (port 8080)
│   ├── cmd/         # CLI commands (unused currently)
│   ├── data/        # Local file storage for uploads
│   ├── internal/    # Core backend code (not importable)
│   │   ├── auth/           # Authentication & authorization
│   │   ├── config/         # Configuration management
│   │   ├── db/             # Database layer & migrations
│   │   ├── handlers/       # RPC service handlers
│   │   ├── lib/            # Internal utilities (logger, workers, email, recur)
│   │   ├── models/         # Domain models with proto converters
│   │   ├── ports/          # Interface definitions (repository pattern)
│   │   ├── proto/          # Generated protobuf code (Go)
│   │   └── server/         # HTTP/RPC server setup
│   ├── pkg/         # Importable packages
│   │   ├── calendar/       # Google Calendar integration
│   │   └── files/          # File storage abstraction
│   ├── app.go       # Application bootstrap
│   └── main.go      # Entry point
├── app/              # Next.js frontend (port 3000)
│   ├── public/      # Static assets
│   └── src/
│       ├── app/            # App Router pages & routes
│       │   ├── api/[...path]/  # Proxy to backend API
│       │   ├── admin/          # Admin dashboard & management
│       │   ├── login/          # Authentication pages
│       │   └── reservation/    # Reservation workflow
│       ├── components/     # React components (shadcn/ui based)
│       ├── lib/            # Frontend utilities
│       │   ├── actions/        # Server Actions for data mutations
│       │   ├── rpc/            # Connect RPC client & generated code
│       │   ├── auth.ts         # Authentication helpers
│       │   └── setHeader.ts    # Cookie management
│       ├── hooks/          # React hooks
│       └── utils/          # Client-side utilities
├── proto/            # Protocol Buffer definitions (source of truth)
│   ├── auth/
│   ├── facilities/
│   ├── reservation/
│   ├── users/
│   └── utility/
├── www/              # Maintenance page server (port 8060)
├── buf.gen.yaml      # Protobuf code generation config
├── buf.yaml          # Buf CLI configuration
├── Taskfile.yml      # Task runner for common operations
└── .env              # Environment variables (not committed)
```

## Key Architectural Patterns

### 1. Connect RPC Communication

The frontend and backend communicate via **Connect RPC** (not REST):

- **Protocol Buffers** define the API contract in `/proto/**/*.proto`
- Code generation via `buf generate`:
  - Go server code → `api/internal/proto/*/`
  - TypeScript client code → `app/src/lib/rpc/proto/`
- RPC calls are type-safe on both ends
- Binary format over HTTP/2 for efficiency

**Frontend Usage Pattern:**
```typescript
// Server Actions use the RPC client
import { client } from '@/lib/rpc';
import { getCookies } from '@/lib/setHeader';

export async function someAction() {
  const { session, token } = await getCookies();
  const authed = client.withAuth(session, token);
  const { data, error } = await authed.facilities().getAllFacilities({});
  // RPCResponse wrapper provides .data and .error
}
```

**Backend Handler Pattern:**
```go
// Handlers implement protobuf service interfaces
func (h *FacilityHandler) GetAllFacilities(
  ctx context.Context,
  req *connect.Request[pb.GetAllFacilitiesRequest],
) (*connect.Response[pb.GetAllFacilitiesResponse], error) {
  // Business logic
  // Return proto response
}
```

### 2. Authentication & Authorization

**Multi-Provider OAuth System:**
- Uses custom `flexauth` library (external package by maintainer)
- Supports Microsoft Entra ID (primary), can add more providers
- JWT-based with refresh tokens
- Session storage in PostgreSQL

**Auth Flow:**
1. User clicks "Login with Entra" → `/auth/entra` (Go endpoint)
2. OAuth callback → `/auth/entra/callback` creates JWT + session
3. Cookies set: `flexauth_token` (JWT), `flexauth_session` (session ID)
4. Middleware validates on protected routes

**Middleware Implementation:**
- `api/internal/auth/handler.go::AuthMiddleware` intercepts RPC calls
- Public procedures defined in `requiresAuth()` function
- Extracts user from JWT claims into `AuthCTX` context
- Frontend sends `Authorization: Bearer <jwt>` + `X-Session: <sessionID>` headers

**Frontend Auth:**
- `app/src/lib/auth.ts::auth()` Server Action checks session
- Next.js middleware proxies requests to backend via `/api/[...path]/route.ts`
- Cookies automatically forwarded to backend

### 3. Database Architecture

**PostgreSQL with Custom Migration System:**
- No ORM - uses `sqlx` for Go (raw SQL with struct mapping)
- Migrations in `api/internal/db/migrations/*.sql`
- Embedded filesystem (`embed.FS`) loads migrations at startup
- Version tracking in `schema_migrations` table
- Migrations run automatically on server start

**Repository Pattern (Ports):**
- Interfaces defined in `api/internal/ports/ports.go`
- Implementations in `api/internal/db/*Store.go`
- Clean separation of concerns:
  - `UserStore` - users, sessions, notifications
  - `FacilityStore` - buildings, facilities, categories
  - `ReservationStore` - reservations, dates, fees
  - `BrandingStore` - organization customization

**Data Flow:**
1. RPC Handler receives request
2. Handler calls Store method (repository interface)
3. Store executes SQL, returns domain models
4. Handler converts models to protobuf
5. Response sent to client

### 4. Type Conversion Pattern

**Critical Pattern: Domain Models ↔ Protobuf**

`api/internal/models/models.go` contains:
- Go structs for database entities (with `db` tags for sqlx)
- `ToProto()` methods on structs → convert to protobuf
- `ToModel()` functions → convert from protobuf
- Handles nullable fields, timestamps, numeric conversions

**Example:**
```go
type Facility struct {
  ID        int64  `db:"id"`
  Name      string `db:"name"`
  // ... fields match DB columns
}

func (f *Facility) ToProto() *pbFacilities.Facility {
  return &pbFacilities.Facility{
    Id: f.ID,
    Name: f.Name,
    // ... map all fields
  }
}
```

**Timestamp Handling:**
- Database uses `pgtype.Timestamptz` (PostgreSQL timezone-aware)
- Protobuf uses `string` (RFC3339 format)
- Conversion utilities in `api/internal/lib/utils/time.go`

### 5. Frontend Data Patterns

**Next.js 16 Caching Strategy:**
- Server Actions with `'use cache'` directive
- Cache tags for selective invalidation: `cacheTag('session')`, `cacheTag('reservations')`
- Mutations call `revalidateTag()` to invalidate caches
- Example in `app/src/lib/actions/reservations.ts`

**Client-Side State:**
- Minimal client state, prefers server-driven
- Zustand for complex forms (reservation wizard)
- React Context avoided, uses props/composition

**Component Architecture:**
- shadcn/ui components in `app/src/components/ui/`
- Composition over configuration
- Server Components by default, Client Components (`'use client'`) only when needed

### 6. File Upload System

**Local File Storage:**
- Files stored in `api/data/` directory (configurable via `FILES_PATH`)
- Custom endpoints outside RPC: `/files/images/{building}/{facility}`, `/files/documents/{reservationID}`
- Handler in `api/internal/handlers/files.go`
- Frontend uses standard `multipart/form-data` POST

**File Structure:**
```
api/data/
├── images/
│   ├── {building_id}/
│   │   └── {facility_id}/
│   │       └── {filename}
└── documents/
    └── {reservation_id}/
        └── {filename}
```

### 7. Recurring Reservations

**RRule Pattern (RFC 5545):**
- Uses `github.com/teambition/rrule-go` library
- Stored as `rrule` string in database
- Additional `rdates` and `exdates` arrays for exceptions
- Processed in `api/internal/lib/recur/recur.go`
- Calendar integration via Google Calendar API

**Reservation Date Model:**
- Parent `reservations` table has metadata + rrule
- Child `reservation_dates` table has individual occurrences
- Each date can be approved/denied independently

## Important Integration Points

### 1. Google Calendar Integration
- Located in `api/pkg/calendar/`
- OAuth token stored in config (refresh token)
- Creates events on facility-specific calendars
- Publishes to public calendars for display

### 2. Email System
- SMTP configuration in `api/internal/lib/emails/email.go`
- Used for notifications (approval, denial, reminders)
- Email templates embedded or generated programmatically

### 3. Background Workers
- `api/internal/lib/workers/` contains worker system
- `Janitor` worker cleans up expired sessions/tokens
- Manager runs workers in goroutines with context cancellation

### 4. API Proxy
- `app/src/app/api/[...path]/route.ts` proxies ALL requests to backend
- Preserves cookies, handles redirects
- Allows frontend and backend on different ports in dev
- Production: would use reverse proxy (nginx/caddy)

## Environment Variables

**Critical Variables:**
```bash
# Backend (Go API)
DATABASE_URL=postgres://...           # PostgreSQL connection
AUTH_SECRET=<random-256-bit>          # JWT signing key
AUTH_SALT=<random-256-bit>            # Argon2 salt
ENTRA_CLIENT_ID=<azure-app-id>       # OAuth
ENTRA_CLIENT_SECRET=<azure-secret>
ENTRA_TENANT_ID=<azure-tenant>
GOOGLE_CLIENT_ID=<google-oauth>      # Calendar API
GOOGLE_CLIENT_SECRET=<google-secret>
GOOGLE_REFRESH_TOKEN=<refresh-token>
API_HOST=http://localhost:8080
FRONTEND_URL=http://localhost:3000
TIMEZONE=America/New_York            # Application timezone
FILES_PATH=data                      # File storage directory

# Frontend (Next.js)
FRONTEND_URL=http://localhost:3000   # Used by RPC client
```

## Development Workflow

### Common Tasks (via Taskfile)
```bash
task dev          # Start both backend & frontend (concurrently)
task dev:go       # Start Go API only (air hot-reload)
task dev:bun      # Start Next.js only (bun dev)
task gen:proto    # Regenerate protobuf code
task gen:types    # Generate Next.js typed routes
task lint         # Lint all code
task build        # Build both services
```

### Making Changes

**Adding a New RPC Endpoint:**
1. Define in `.proto` file: `proto/<service>/<service>.proto`
2. Run `task gen:proto` to generate code
3. Implement handler in `api/internal/handlers/<service>.go`
4. Register in `api/internal/server/server.go`
5. Use in frontend via `client.<service>().<method>()`

**Database Schema Changes:**
1. Create new migration: `api/internal/db/migrations/XXXX_name.sql`
2. Use sequential numbers (e.g., 0007_add_feature.sql)
3. Write both UP migration SQL (migrations run automatically)
4. Update models in `api/internal/models/models.go`
5. Update store methods in `api/internal/db/<entity>Store.go`

**Adding a New Page:**
1. Create route in `app/src/app/<route>/page.tsx`
2. Define Server Actions in `app/src/lib/actions/<feature>.ts` if needed
3. Use RPC client to fetch data
4. Server Components by default, use `'use client'` only if interactive

## Security Considerations

1. **CSRF Protection:** Token set in cookie, not currently validated (TODO for maintainer)
2. **Input Validation:** Protobuf provides type safety, but business logic validation in handlers
3. **Authorization:** Role-based (`ADMIN`, `USER`, `STAFF`, `GUEST`) checked in handlers via `AuthCTX`
4. **File Uploads:** No virus scanning, validates file extensions only
5. **SQL Injection:** Prevented by parameterized queries (`sqlx`)

## Performance Notes

- **Connection Pooling:** PostgreSQL connections pooled (25 max, 5 idle)
- **HTTP/2:** Backend uses h2c (HTTP/2 cleartext) for RPC
- **Caching:** Next.js aggressive caching with selective invalidation
- **Turbopack:** Development uses Next.js Turbopack for fast HMR
- **Binary Protocol:** Connect RPC uses binary protobuf (smaller than JSON)

## Testing Strategy

- **Backend:** No tests currently (maintainer TODO)
- **Frontend:** Vitest configured but minimal tests
- **Manual Testing:** Primary method currently

## Deployment Considerations

- **Docker:** Dockerfiles present but not actively used
- **Standalone Mode:** Next.js builds to standalone output
- **Static Files:** Served by Next.js, images via backend `/files/` routes
- **Database:** PostgreSQL required, migrations run on startup
- **Reverse Proxy:** Recommended in production (both services behind nginx)

## Non-Obvious Decisions

1. **Why Connect RPC over REST?**
   - Type safety from proto → reduced bugs
   - Binary efficiency for mobile/low-bandwidth
   - Streaming support (not used yet)
   - gRPC compatibility without gRPC complexity

2. **Why Custom Migrations over ORM?**
   - Full control over SQL
   - No ORM magic/hidden queries
   - Explicit schema versioning
   - Embedded migrations = single binary deploy

3. **Why Bun over npm/yarn?**
   - Faster package installation
   - Native TypeScript support
   - Drop-in Node.js replacement

4. **Why Monorepo?**
   - Shared proto definitions
   - Atomic commits across stack
   - Single source of truth for types
   - Simplified CI/CD

5. **Why Next.js App Router?**
   - Server Components reduce bundle size
   - Server Actions eliminate boilerplate API routes
   - React 19 features (use cache, etc.)
   - Type-safe routing with `typedRoutes: true`

## Third-Party Dependencies

**Backend Key Libraries:**
- `connectrpc.com/connect` - RPC framework
- `github.com/biohackerellie/flexauth` - OAuth (custom by maintainer)
- `github.com/jmoiron/sqlx` - SQL extensions
- `github.com/jackc/pgx/v5` - PostgreSQL driver
- `github.com/teambition/rrule-go` - Recurring rules
- `google.golang.org/api` - Google Calendar

**Frontend Key Libraries:**
- `@connectrpc/connect-web` - RPC client
- `@radix-ui/*` - Headless UI components
- `next-themes` - Dark mode
- `react-hook-form` + `zod` - Form validation
- `zustand` - State management (minimal use)
- `date-fns` - Date utilities

## Troubleshooting Common Issues

**"Unauthenticated" errors:**
- Check cookies are being sent: `flexauth_token` and `flexauth_session`
- Verify JWT not expired (14 day TTL)
- Check backend logs for token validation failures
- Ensure `AUTH_SECRET` matches between sessions

**RPC connection failures:**
- Verify backend running on port 8080
- Check frontend proxy at `/api/[...path]` working
- Inspect Network tab for 500 errors
- Check backend logs for panics (RecoveryInterceptor catches)

**Migration failures:**
- Check `schema_migrations` table for applied versions
- Ensure SQL syntax valid for PostgreSQL
- Run migrations manually: `psql -f api/internal/db/migrations/XXXX.sql`
- Check for duplicate version numbers

**File upload 404s:**
- Verify `FILES_PATH` directory exists and writable
- Check file path construction in handler
- Ensure request goes to `/files/` not `/api/files/`

## Code Style & Conventions

**Go:**
- Standard Go formatting (`gofmt`)
- Error handling: explicit, no panics (except startup)
- Context propagation: always pass `context.Context`
- Logging: structured via `slog`

**TypeScript:**
- Biome for linting/formatting (not ESLint/Prettier)
- Async/await preferred over callbacks
- Server Actions: `'use server'` at top of file
- Type imports: `import type { ... }`

**Naming:**
- Go: PascalCase for exports, camelCase for private
- TypeScript: camelCase for functions, PascalCase for components
- Database: snake_case for columns
- Proto: snake_case for fields (converted to camelCase in TS, PascalCase in Go)

## Future Enhancements (Maintainer TODOs)

- Add comprehensive test coverage
- Implement CSRF validation
- Add rate limiting on API
- Migrate to hosted file storage (S3-compatible)
- Add WebSocket support for real-time notifications
- Implement search with full-text indexing
- Add audit logging for admin actions
- Create mobile app using same proto definitions

## Getting Help

- Check `README.md` for basic setup
- Review `Taskfile.yml` for available commands
- Inspect proto files for API contracts
- Read migration files to understand schema
- Backend logs: structured JSON in production, text in dev
- Frontend logs: check browser console + Next.js dev server output

---

**Last Updated:** 2025-11-05
**Maintainer:** Ellie Kerns (epklabs.com)
