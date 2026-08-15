<div align="center">
  <img src="./client/public/logo.svg" alt="NextEvent Logo" width="100" />
  <h1>NextEvent</h1>
  <p><strong>A Next-Generation Event Discovery & Management Platform</strong></p>

  <p>
    <img src="https://img.shields.io/badge/.NET_10-512BD4?style=for-the-badge&logo=dotnet&logoColor=white" alt=".NET 10" />
    <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/SQL_Server-CC2927?style=for-the-badge&logo=microsoft-sql-server&logoColor=white" alt="SQL Server" />
    <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  </p>
</div>

<br />

NextEvent is a full-stack, enterprise-grade event management platform designed to connect event organizers with attendees. Built with a focus on **strict tenant isolation**, **performance**, and **clean architecture**, NextEvent provides a seamless experience for browsing, creating, and managing events.

---

## ✨ Key Capabilities

NextEvent isn't just a basic CRUD app; it solves complex business problems using modern architectural patterns:

- 🏗️ **Modular Monolith Architecture**: The backend is highly cohesive but loosely coupled. Business domains (`Events`, `Organizations`, `Identity`, `AI`) are strictly partitioned into isolated modules with their own schemas, ensuring future readiness for microservices extraction.
- 🔐 **Advanced Tenant Security (BOLA/BFLA Prevention)**: A custom RBAC (Role-Based Access Control) engine strictly gates resources. Organizers are assigned granular permissions (e.g., `events.create`) bound exclusively to their organization, preventing cross-tenant data bleeding or broken object-level authorization (BOLA).
- 🧠 **AI-Assisted Event Generation**: Seamlessly integrates with Google's Gemini Pro to help organizers instantly generate engaging event descriptions based on basic input parameters.
- 🌍 **Internationalization & Localization**: First-class support for `i18next`. Validation schemas (like Zod forms) dynamically regenerate in real-time when the user switches languages, ensuring localized error feedback.
- ⚡ **Optimized Data Fetching**: Powered by React Router v7 Data Routers and TanStack Query (React Query) for aggressive caching, optimistic UI updates, and intelligent background refetching.
- 🎨 **State-of-the-art UI**: A hand-rolled, accessible component system built on Tailwind CSS v4 and Radix UI primitives, featuring dynamic Dark/Light modes, micro-animations, and responsive layouts.

---

## 🛠️ Technology Stack

**Backend (ASP.NET Core)**
* **API Engine**: .NET 10 Web API
* **Architecture**: Clean Architecture & CQRS (Command Query Responsibility Segregation)
* **Mediation**: MediatR (with FluentValidation pipeline behaviors)
* **Data Access**: Entity Framework Core (EF Core) & Dapper
* **Database**: Microsoft SQL Server
* **Messaging**: MassTransit with Transactional Outbox Pattern

**Frontend (React SPA)**
* **Core**: React 19, TypeScript, Vite 8
* **Routing**: React Router v7 (Data Router)
* **State & Fetching**: TanStack Query (React Query v5), Axios
* **Styling**: Tailwind CSS v4, class-variance-authority, clsx
* **UI Primitives**: Radix UI, Lucide Icons, Sonner (Toast)
* **Forms**: React Hook Form, Zod

---

## 🚀 Getting Started

The entire NextEvent platform is fully containerized for a friction-free developer experience.

### 1. Clone the repository
```bash
git clone https://github.com/primecoderIN/NextEvent.git
cd NextEvent
```

### 2. Configure Environment Variables
Create a `.env` file at the root of the project with your development secrets:
```env
SA_PASSWORD=YourStrong!Password
TOKEN_KEY=SuperSecretDevelopmentKeyForNextEventApp1234567890!
```

### 3. Spin up the infrastructure
Run the provided Docker Compose file. This provisions SQL Server, RabbitMQ, Redis, the .NET Backend, and the React Frontend simultaneously.
```powershell
docker-compose up --build -d
```
> *Note: The database is automatically migrated and seeded with initial test data and roles on startup.*

### 4. Access the Application
- **Frontend (React App)**: [http://localhost:3000](http://localhost:3000)
- **Backend API (Swagger)**: [http://localhost:5000/swagger](http://localhost:5000/swagger)
- **RabbitMQ Dashboard**: [http://localhost:15672](http://localhost:15672) (guest/guest)

#### 🧪 Test Accounts
You can log in to explore the different portal experiences:
- `admin@test.com` / `Pa$$w0rd` (Platform Admin)
- `organizer@test.com` / `Pa$$w0rd` (Event Organizer)
- `member@test.com` / `Pa$$w0rd` (Standard Member)

---

## 📚 Documentation

For a deeper dive into the architectural decisions, database schema, and API contracts, please refer to the dedicated documentation files:

* [**Backend Architecture Guide**](./docs/architecture.md) — CQRS, Dependency Flow, Date/Time Conventions, and Error Envelopes.
* [**Database Schema & Entity Relationships**](./docs/database-schema.md) — Detailed overview of schemas, FKs, and Soft Delete strategies.
* [**API Endpoints Catalog**](./docs/api-endpoints.md) — Route summaries and authorization requirements.
* [**Docker & Deployment Setup**](./docs/docker-notes.md) — Multi-stage builds and container networking.

---

## 📝 License
This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.
