# FlexFacilities

> A free and open-source facility reservation system built for K-12 schools

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://github.com/biohackerellie/FlexFacilities/pkgs/container/flexfacilities-api)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://github.com/biohackerellie/FlexFacilities/pkgs/container/flexfacilities-web)


---

## Overview

FlexFacilities is a comprehensive facility reservation management system designed specifically for K-12 schools. It streamlines the process of booking gymnasiums, auditoriums, conference rooms, and other shared spaces while providing administrators with powerful tools for oversight and approval workflows.

### Key Features

- **🗓️ Google Calendar Integration** - Automatic synchronization with Google resource calendars for real-time availability
- **📁 Document Management** - Upload and manage reservation documents and facility images
- **🔐 Secure Authentication** - Microsoft Entra ID (Azure AD) and email/password with 2FA support
- **👥 Role-Based Access** - Granular permissions for admins, staff, and general users
- **🔄 Recurring Reservations** - Support for complex recurring schedules using RFC 5545 (iCalendar) rules
- **💰 Fee Management** - Track and manage facility rental fees
- **📧 Email Notifications** - Automated notifications for reservation status changes
- **🐳 Easy Deployment** - Fully containerized with Docker for simple deployment
- **🎨 Modern UI** - Built with React 19 and Next.js 16 App Router with dark mode support

## Quick Start with Docker

FlexFacilities is distributed as two Docker images:
- **API**: `ghcr.io/biohackerellie/flexfacilities-api`
- **Web**: `ghcr.io/biohackerellie/flexfacilities-web`

### Prerequisites

- Docker and Docker Compose
- PostgreSQL database (can be containerized or use external provider)
- Google Cloud Project with Calendar API enabled (for calendar sync)
- Microsoft Entra ID app registration (for authentication)

### Docker Compose Example

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  # PostgreSQL Database (optional - can use external provider)
  postgres:
    image: postgres:16-alpine
    container_name: flexfacilities-db
    environment:
      POSTGRES_DB: flexfacilities
      POSTGRES_USER: flexuser
      POSTGRES_PASSWORD: changeme
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U flexuser -d flexfacilities"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # Backend API
  api:
    image: ghcr.io/biohackerellie/flexfacilities-api:latest
    container_name: flexfacilities-api
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      # Database
      DATABASE_URL: postgres://flexuser:changeme@postgres:5432/flexfacilities?sslmode=disable

      # Authentication
      AUTH_SECRET: <generate-random-256-bit-key>
      AUTH_SALT: <generate-random-256-bit-key>
      ENTRA_CLIENT_ID: <your-entra-client-id>
      ENTRA_CLIENT_SECRET: <your-entra-client-secret>
      ENTRA_TENANT_ID: <your-entra-tenant-id>

      # Google Calendar API
      GOOGLE_CLIENT_ID: <your-google-client-id>
      GOOGLE_CLIENT_SECRET: <your-google-client-secret>
      GOOGLE_REFRESH_TOKEN: <your-google-refresh-token>

      # URLs
      API_HOST: http://localhost:8080
      FRONTEND_URL: http://localhost:3000

      # Application
      TIMEZONE: America/New_York
      FILES_PATH: /app/data
    volumes:
      - api_data:/app/data
    ports:
      - "8080:8080"
    restart: unless-stopped

  # Frontend Web Application
  web:
    image: ghcr.io/biohackerellie/flexfacilities-web:latest
    container_name: flexfacilities-web
    depends_on:
      - api
    environment:
      FRONTEND_URL: http://localhost:3000
      NEXT_PUBLIC_API_URL: http://localhost:8080
    ports:
      - "3000:3000"
    restart: unless-stopped

volumes:
  postgres_data:
  api_data:
```

### Launch the Application

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:8080

### Using External PostgreSQL

If you prefer to use an external PostgreSQL provider (AWS RDS, Supabase, Neon, etc.), remove the `postgres` service from the compose file and update the `DATABASE_URL` in the `api` service:

```yaml
api:
  environment:
    DATABASE_URL: postgres://user:password@your-external-host:5432/dbname?sslmode=require
  depends_on: []  # Remove postgres dependency
```

## Environment Variables

### Required Variables (API)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgres://user:pass@host:5432/db` |
| `AUTH_SECRET` | JWT signing key (256-bit random) | Generate with `openssl rand -hex 32` |
| `AUTH_SALT` | Argon2 password salt (256-bit random) | Generate with `openssl rand -hex 32` |
| `ENTRA_CLIENT_ID` | Microsoft Entra application ID | From Azure Portal |
| `ENTRA_CLIENT_SECRET` | Microsoft Entra client secret | From Azure Portal |
| `ENTRA_TENANT_ID` | Microsoft Entra tenant ID | From Azure Portal |
| `API_HOST` | Backend URL | `http://localhost:8080` |
| `FRONTEND_URL` | Frontend URL | `http://localhost:3000` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | (Calendar sync disabled) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | (Calendar sync disabled) |
| `GOOGLE_REFRESH_TOKEN` | Google refresh token | (Calendar sync disabled) |
| `TIMEZONE` | Application timezone | `America/New_York` |
| `FILES_PATH` | File storage directory | `data` |
| `SMTP_HOST` | Email server host | (Email disabled) |
| `SMTP_PORT` | Email server port | `587` |
| `SMTP_USER` | Email username | (Email disabled) |
| `SMTP_PASSWORD` | Email password | (Email disabled) |

## Architecture

FlexFacilities uses a modern monorepo architecture:

- **Backend**: Go API using Connect RPC (gRPC-compatible)
- **Frontend**: Next.js 16 with React 19 and Server Actions
- **Database**: PostgreSQL with embedded migrations
- **Protocol**: Protocol Buffers for type-safe API contracts


## Development Setup

### Prerequisites

- [Go 1.23+](https://go.dev/doc/install)
- [Bun](https://bun.sh) or Node.js 20+
- [Task](https://taskfile.dev) (task runner)
- [Buf](https://buf.build) (Protocol Buffers)
- PostgreSQL 16+

### Local Development

```bash
# Clone the repository
git clone https://github.com/biohackerellie/FlexFacilities.git
cd FlexFacilities

# Install Task
curl -L https://taskfile.dev/install.sh | bash

# Install dependencies
task install
# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development servers (both API and Web)
task dev

# Or start individually:
task dev:go   # Start Go API (port 8080)
task dev:bun  # Start Next.js (port 3000)
```

### Code Generation

After modifying `.proto` files:

```bash
task gen:proto  # Regenerate Go + TypeScript code
task gen:types  # Regenerate Next.js typed routes
```


## Roadmap

### Upcoming Features

- [ ] **Payment Integration**: Migrate from Square to Stripe for online payments
- [ ] **Additional Auth Providers**: Google Workspace, SAML/SSO support
- [ ] **Mobile App**: Native iOS/Android applications
- [ ] **Advanced Reporting**: Analytics dashboard for facility usage

### Current Limitations

- Payment processing requires manual Square setup (Stripe integration in progress)
- Authentication limited to Microsoft Entra ID and email/password with 2FA
- Calendar sync requires Google Calendar API setup (optional)


### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and test thoroughly
4. Run linting: `task lint`
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is licensed under the AGPL v3 License - see the [LICENSE](./LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/biohackerellie/FlexFacilities/issues)
- **Discussions**: [GitHub Discussions](https://github.com/biohackerellie/FlexFacilities/discussions)

## Acknowledgments

- Built with [Connect RPC](https://connectrpc.com)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Authentication powered by [FlexAuth](https://github.com/biohackerellie/flexauth)

---

**Made with ❤️ for K-12 schools** | [Website](https://epklabs.com) | [GitHub](https://github.com/biohackerellie)
