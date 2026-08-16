# Database Schema & Entity Relationships

> **Conventions:**
> - All primary keys are `uniqueidentifier` (GUID), client-generated unless noted.
> - Audit timestamps are `datetime2(3)` — UTC, millisecond precision.
> - Cross-module foreign keys are mapped with `.ExcludeFromMigrations()` to allow EF Core navigation without duplicating table definitions across DbContexts.
> - All deletes on Organizations and Members are **soft deletes** (`IsDeleted = true`). Events and Categories use **hard deletes**.

---

## Module: Events (`evt` schema)

### `Events`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `Id` | `uniqueidentifier` | ❌ | PK, client-generated |
| `Title` | `nvarchar` | ❌ | Required |
| `Description` | `nvarchar` | ❌ | Required |
| `CategoryId` | `uniqueidentifier` | ✅ | FK → `Categories.Id` (`SetNull`) |
| `OrganizationId` | `uniqueidentifier` | ✅ | FK → `org.Organizations.Id` (`Restrict`). Nullable for backward compat & future platform-level events |
| `CreatedByUserId` | `nvarchar(450)` | ✅ | FK → `identity.AspNetUsers.Id` (`Restrict`) |
| `Date` | `datetime2(3)` | ❌ | UTC event start time |
| `TimeZoneId` | `nvarchar` | ❌ | IANA timezone ID (e.g. `"Asia/Kolkata"`). Default `"UTC"` |
| `City` | `nvarchar` | ❌ | |
| `Venue` | `nvarchar` | ❌ | |
| `Latitude` | `float` | ❌ | |
| `Longitude` | `float` | ❌ | |
| `IsCancelled` | `bit` | ❌ | Default `false` |
| `IsSuspended` | `bit` | ❌ | Default `false`. Set by Admin. Hides event from public/member queries |
| `CreatedAtUtc` | `datetime2(3)` | ❌ | |
| `UpdatedAtUtc` | `datetime2(3)` | ✅ | |

**Relationships:**
- `CategoryId` → `Categories.Id` — `SetNull` (event remains valid if category is deleted)
- `OrganizationId` → `org.Organizations.Id` — `Restrict` (cannot delete org with events)

**Indexes:**
| Name | Column(s) | Purpose |
|---|---|---|
| `IX_Events_Date` | `Date` | Fast sorting and filtering by event date |
| `IX_Events_OrganizationId` | `OrganizationId` | List events by organization |

> **Why is `OrganizationId` nullable?** Backward compatibility with events that predate the Organizations feature, plus reserved for future platform-level events not owned by any organization. The API `CreateEventCommandValidator` strictly requires it for all user-created events.

---

### `Categories`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `Id` | `uniqueidentifier` | ❌ | PK |
| `Name` | `nvarchar(200)` | ❌ | |
| `Slug` | `varchar(200)` | ❌ | **Unique** (`UX_Categories_Slug`) |
| `Description` | `nvarchar(2000)` | ✅ | |
| `IsActive` | `bit` | ❌ | Default `true` |
| `SortOrder` | `int` | ❌ | Default `0` |
| `CreatedAtUtc` | `datetime2(3)` | ❌ | |
| `UpdatedAtUtc` | `datetime2(3)` | ❌ | |

**Indexes:** `UX_Categories_Slug` (unique)

---

### `CategorySuggestions`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `Id` | `uniqueidentifier` | ❌ | PK |
| `Name` | `nvarchar(200)` | ❌ | |
| `Slug` | `varchar(200)` | ❌ | |
| `Description` | `nvarchar(2000)` | ✅ | |
| `Status` | `int` | ❌ | Enum: `Pending=0`, `Approved=1`, `Rejected=2` |
| `SuggestedById` | `nvarchar(450)` | ❌ | FK → `identity.AspNetUsers.Id` (`Restrict`) |
| `ReviewedById` | `nvarchar(450)` | ✅ | FK → `identity.AspNetUsers.Id` (`Restrict`) |
| `ReviewedAt` | `datetime2(3)` | ✅ | |
| `RejectionReason` | `nvarchar` | ✅ | |
| `ApprovedCategoryId` | `uniqueidentifier` | ✅ | FK → `Categories.Id` (`SetNull`) |
| `CreatedAtUtc` | `datetime2(3)` | ❌ | |
| `UpdatedAtUtc` | `datetime2(3)` | ❌ | |

**Indexes:** `IX_CategorySuggestions_Status`

---

### `EventReports`

Introduced in migration `AddEventSuspendAndReport` (2026-08-13).

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `Id` | `uniqueidentifier` | ❌ | PK |
| `EventId` | `uniqueidentifier` | ❌ | FK → `Events.Id` (`Cascade`) |
| `ReportedById` | `nvarchar(450)` | ❌ | FK → `identity.AspNetUsers.Id` (`Restrict`) |
| `Reason` | `nvarchar` | ❌ | The reason the user submitted |
| `CreatedAt` | `datetime2` | ❌ | UTC timestamp of report submission |

**Relationships:**
- `EventId` → `Events.Id` — `Cascade` (deleting an event removes its reports)
- `ReportedById` → `AspNetUsers.Id` — `Restrict`

---

## Module: Organizations (`org` schema)

### `Organizations`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `Id` | `uniqueidentifier` | ❌ | PK |
| `Name` | `varchar(160)` | ❌ | |
| `Slug` | `varchar(180)` | ❌ | **Unique** (`UX_Organizations_Slug`) |
| `Description` | `nvarchar(max)` | ✅ | |
| `LogoUrl` | `nvarchar(max)` | ✅ | |
| `CoverImageUrl` | `nvarchar(max)` | ✅ | |
| `WebsiteUrl` | `nvarchar(max)` | ✅ | |
| `ContactEmail` | `varchar(256)` | ✅ | |
| `ContactPhone` | `varchar(40)` | ✅ | |
| `Status` | `varchar(30)` | ❌ | `pending_verification` \| `active` \| `suspended` \| `rejected` |
| `OwnerUserId` | `nvarchar(450)` | ❌ | FK → `identity.AspNetUsers.Id` (`Restrict`) |
| `VerifiedAtUtc` | `datetime2(3)` | ✅ | Set on admin approval |
| `VerifiedByUserId` | `nvarchar(450)` | ✅ | FK → `identity.AspNetUsers.Id` (`Restrict`) |
| `CreatedAtUtc` | `datetime2(3)` | ❌ | |
| `CreatedByUserId` | `nvarchar(450)` | ❌ | FK → `identity.AspNetUsers.Id` (`Restrict`) |
| `UpdatedAtUtc` | `datetime2(3)` | ✅ | |
| `IsDeleted` | `bit` | ❌ | Default `false` — soft delete |
| `DeletedAtUtc` | `datetime2(3)` | ✅ | |
| `RowVersion` | `rowversion` | ❌ | Optimistic concurrency token |

**Indexes:**
| Name | Columns | Unique |
|---|---|---|
| `UX_Organizations_Slug` | `Slug` | ✅ |
| `IX_Organizations_OwnerUserId` | `OwnerUserId` | ❌ |
| `IX_Organizations_Status` | `Status` | ❌ |

---

### `OrganizationMembers`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `Id` | `uniqueidentifier` | ❌ | PK |
| `OrganizationId` | `uniqueidentifier` | ❌ | FK → `Organizations.Id` (`Cascade`) |
| `UserId` | `nvarchar(450)` | ❌ | FK → `identity.AspNetUsers.Id` (`Restrict`) |
| `Status` | `int` | ❌ | `Invited=0`, `Active=1`, `Declined=2`, `Removed=3` |
| `JoinedAtUtc` | `datetime2(3)` | ✅ | Set when Status → Active |
| `CreatedAtUtc` | `datetime2(3)` | ❌ | |
| `CreatedByUserId` | `nvarchar(450)` | ❌ | |
| `IsDeleted` | `bit` | ❌ | Soft delete |

**Indexes:**
| Name | Columns | Unique | Filter |
|---|---|---|---|
| `IX_OrganizationMembers_OrganizationId` | `OrganizationId` | ❌ | — |
| `IX_OrganizationMembers_UserId` | `UserId` | ❌ | — |
| `UX_OrganizationMembers_Active` | `(OrganizationId, UserId)` | ✅ | `[Status]=1 AND [IsDeleted]=0` |

> **Why a filtered unique index?** Historical rows (Declined, Removed) must be kept for the audit trail. A composite PK would permanently block re-inviting a user. The filter ensures only one *active* membership per user per org at any time.

**State machine:**
```
Invited (0) ──► Active (1) ──► Removed (3)
          └───► Declined (2)
```

---

### `OrganizationRoles`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `Id` | `uniqueidentifier` | ❌ | PK |
| `OrganizationId` | `uniqueidentifier` | ❌ | FK → `Organizations.Id` (`Cascade`) |
| `Name` | `varchar(80)` | ❌ | |
| `Description` | `nvarchar` | ✅ | |
| `IsSystemRole` | `bit` | ❌ | Default `false`. System roles (Owner, Admin, etc.) cannot be deleted |
| `CreatedAtUtc` | `datetime2(3)` | ❌ | |
| `CreatedByUserId` | `nvarchar(450)` | ❌ | |
| `UpdatedAtUtc` | `datetime2(3)` | ✅ | |
| `IsDeleted` | `bit` | ❌ | Soft delete |

**Indexes:** `UX_OrganizationRoles_OrganizationId_Name` (unique composite)

---

### `Permissions`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `Id` | `uniqueidentifier` | ❌ | PK |
| `Code` | `varchar(120)` | ❌ | **Unique** e.g. `events.create`, `roles.manage`, `members.invite` |
| `Name` | `varchar(120)` | ❌ | |
| `Description` | `nvarchar` | ✅ | |
| `Category` | `varchar(80)` | ❌ | Groups permissions by domain |

---

### `OrganizationRolePermissions`

| Column | Type | Notes |
|---|---|---|
| `OrganizationRoleId` | PK + FK → `OrganizationRoles.Id` (`Cascade`) |
| `PermissionId` | PK + FK → `Permissions.Id` (`Cascade`) |

---

### `OrganizationMemberRoles`

| Column | Type | Notes |
|---|---|---|
| `OrganizationMemberId` | PK + FK → `OrganizationMembers.Id` (`Cascade`) |
| `OrganizationRoleId` | PK + FK → `OrganizationRoles.Id` (`Cascade`) |

---

## Module: Identity (`identity` schema)

Managed by ASP.NET Core Identity. Key tables: `AspNetUsers`, `AspNetRoles`, `AspNetUserRoles`.

**Platform Roles:**
- `Admin` — Full platform access
- `Organizer` — Granted when their organization is approved. Enables the `ActiveOrganizer` policy

**Custom User Columns:**
| Column | Notes |
|---|---|
| `ActiveProfile` | `"Member"` or `"Organizer"`. Embedded in JWT as a claim. Drives the `ActiveOrganizer` policy |
| `RefreshToken` | Hashed refresh token stored on the user record |
| `RefreshTokenExpiresAt` | UTC expiry for the refresh token |
| `CreatedAtUtc` | Exact UTC timestamp of user registration |

---

## Migration History

### Events Module
| Migration | Date | Description |
|---|---|---|
| `InitialEvents` | 2026-07-31 | Core Events, Categories, CategorySuggestions tables + MassTransit Outbox |
| `FixMassTransitDowngrade2` | 2026-07-31 | MassTransit schema compatibility fix |
| `FixUserTableMapping` | 2026-07-31 | Cross-module Identity table mapping |
| `RestoreEventConstraints` | 2026-08-01 | Restored FK constraints and indexes |
| `UpdateEventsModelSnapshot` | 2026-08-01 | Model snapshot reconciliation |
| `AddEventsDateIndex` | 2026-08-02 | Added `IX_Events_Date` index for sort performance |
| `AddEventSuspendAndReport` | 2026-08-13 | Added `IsSuspended` to Events; new `EventReports` table |

### Organizations Module
| Migration | Date | Description |
|---|---|---|
| `InitialOrganizations` | 2026-07-31 | Full Organizations RBAC schema: Organizations, Members, Roles, Permissions, join tables |
| `FixMassTransitDowngrade2` | 2026-07-31 | MassTransit compatibility fix |
| `FixOrgContextBase` | 2026-07-31 | Base context table mapping fixes |
| `FixShadowFKColumns` | 2026-07-31 | Shadow FK column cleanup |
| `FixOrgMemberFKColumns` | 2026-07-31 | OrganizationMember FK column fixes |
| `RestoreOrgConstraints` | 2026-08-01 | Restored all FK constraints and unique indexes |
