# NextEvent — Onboarding Guide

Welcome to **NextEvent**! This is your starting point. Use the links below to navigate to the specific guide you need.

---

## Quick Start

The entire platform is containerized. One command brings up everything.

```bash
# 1. Clone
git clone https://github.com/primecoderIN/NextEvent.git
cd NextEvent

# 2. Create .env at the project root
SA_PASSWORD=YourStrong!Password
TOKEN_KEY=SuperSecretDevelopmentKeyForNextEventApp123456789012345678901234567890!

# 3. Start all services
docker-compose up --build -d
```

| Service | URL |
|---|---|
| React Frontend | http://localhost:3000 |
| .NET API + Swagger | http://localhost:5000/swagger |
| RabbitMQ Dashboard | http://localhost:15672 (guest/guest) |

> The database is automatically migrated and seeded on first startup. No manual steps needed.

---

## Test Accounts

| Email | Password | Role |
|---|---|---|
| `admin@test.com` | `Pa$$w0rd` | Platform Admin |
| `organizer@test.com` | `Pa$$w0rd` | Organizer |
| `member@test.com` | `Pa$$w0rd` | Member |

---

## Running Without Docker

**Backend:**
```bash
cd API
dotnet watch         # starts at http://localhost:5000
```

**Frontend:**
```bash
cd client
npm install
npm run dev          # starts at http://localhost:3000
```

---

## Documentation Map

| Guide | Description |
|---|---|
| [📁 Folder Structure](./folder-structure.md) | Full annotated backend + frontend directory tree |
| [⚙️ Backend Onboarding](./backend-onboarding.md) | .NET crash course — CQRS, MediatR, EF Core, DI patterns |
| [🎨 Frontend Onboarding](./frontend-onboarding.md) | React Query hooks, routing, auth guards, forms, i18n |
| [🏗️ Architecture Guide](./architecture.md) | Security patterns, BOLA/BFLA prevention, modular monolith design |
| [📡 API Endpoints Catalog](./api-endpoints.md) | All routes with auth requirements and response shapes |
| [🗄️ Database Schema](./database-schema.md) | Tables, columns, FKs, indexes, migration history |
