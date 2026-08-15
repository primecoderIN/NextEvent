## Database Schema & Entity Relationships

This section documents every domain entity, its columns, foreign key relationships, delete behaviors, and index strategy. Keep this updated whenever a migration is added.

> **Convention:** All deletes are **soft deletes** (`IsDeleted = true`). Hard deletes are never performed. FKs that point to `AspNetUsers` use `Restrict` (cannot delete a user who is referenced) unless otherwise noted.

---

### Entities at a Glance

| Table | PK type | Soft delete | Hard delete | Row-version | Notes |
|---|---|---|---|---|---|
| `AspNetUsers` | `nvarchar(450)` | ❌ | ✅ | ❌ | Managed by ASP.NET Identity |
| `Events` | `uniqueidentifier` | ❌ | ✅ | ❌ | Core event listing |
| `Categories` | `uniqueidentifier` | ❌ | ✅ | ❌ | Event taxonomy |
| `CategorySuggestions` | `uniqueidentifier` | ❌ | ✅ | ❌ | Community proposals |
| `Organizations` | `uniqueidentifier` | ✅ | ❌ | ✅ | Organizer entity |
| `OrganizationMembers` | `uniqueidentifier` | ✅ | ❌ | ❌ | User ↔ Organization join |
| `Permissions` | `uniqueidentifier` | ❌ | ✅ | ❌ | System permissions (events.read) |
| `OrganizationRoles` | `uniqueidentifier` | ✅ | ❌ | ❌ | Roles scoped to an Organization |
| `OrganizationRolePermissions` | `(RoleId, PermId)` | ❌ | ✅ | ❌ | Role ↔ Permission join |
| `OrganizationMemberRoles` | `(MemberId, RoleId)` | ❌ | ✅ | ❌ | Member ↔ Role join |

---

### Entity Details

#### `Events`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `Id` | `uniqueidentifier` | ❌ | PK, client-generated |
| `OrganizationId` | `uniqueidentifier` | ✅ | FK → `Organizations.Id` (`Restrict`). Required via Validation if created by Organizer |
| `Title` | `nvarchar` | ❌ | Required |
| `Description` | `nvarchar` | ❌ | Required |
| `City` | `nvarchar` | ❌ | |
| `Venue` | `nvarchar` | ❌ | |
| `CategoryId` | `uniqueidentifier` | ✅ | FK → `Categories.Id` (`SetNull` on delete) |
| `Date`, `Latitude`, `Longitude`, … | various | varies | |

**Relationships:**
- `OrganizationId` → `Organizations.Id` — `Restrict` (cannot delete org if it has events)
- `CategoryId` → `Categories.Id` — `SetNull` (event stays valid if category is deleted)

> **Design Note:** Why is `OrganizationId` nullable in the DB if it is mandatory to provide one when creating an event?
> 1. **Backward Compatibility:** Older events existed in the database before the Organizations feature was built. A `NOT NULL` constraint would have broken the database migration.
> 2. **Future Flexibility:** Allows the system administrators to create global, platform-level events that do not belong to any specific third-party organization.
> The API layer (`CreateEventCommandValidator`) strictly enforces that all user-created events must have an organization.


---

#### `Categories`

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

#### `CategorySuggestions`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `Id` | `uniqueidentifier` | ❌ | PK |
| `Name` | `nvarchar(200)` | ❌ | |
| `Slug` | `varchar(200)` | ❌ | |
| `Description` | `nvarchar(2000)` | ✅ | |
| `Status` | `int` | ❌ | Enum: `Pending=0`, `Approved=1`, `Rejected=2` |
| `SuggestedById` | `nvarchar(450)` | ❌ | FK → `AspNetUsers.Id` (`Restrict`) |
| `ReviewedById` | `nvarchar(450)` | ✅ | FK → `AspNetUsers.Id` (`Restrict`) |
| `ReviewedAt` | `datetime2(3)` | ✅ | |
| `RejectionReason` | `nvarchar` | ✅ | |
| `ApprovedCategoryId` | `uniqueidentifier` | ✅ | FK → `Categories.Id` (`SetNull`) |
| `OrganizationId` | `uniqueidentifier` | ✅ | Reserved for future use |
| `CreatedAtUtc` | `datetime2(3)` | ❌ | |
| `UpdatedAtUtc` | `datetime2(3)` | ❌ | |

**Relationships:**
- `SuggestedById` → `AspNetUsers.Id` — `Restrict`
- `ReviewedById` → `AspNetUsers.Id` — `Restrict` (nullable)
- `ApprovedCategoryId` → `Categories.Id` — `SetNull` (nullable)

**Indexes:** `IX_CategorySuggestions_Status`

---

#### `Organizations`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `Id` | `uniqueidentifier` | ❌ | PK, client-generated |
| `Name` | `varchar(160)` | ❌ | |
| `Slug` | `varchar(180)` | ❌ | **Unique** (`UX_Organizations_Slug`) |
| `Description` | `nvarchar(max)` | ✅ | |
| `LogoUrl` | `nvarchar(max)` | ✅ | |
| `CoverImageUrl` | `nvarchar(max)` | ✅ | |
| `WebsiteUrl` | `nvarchar(max)` | ✅ | |
| `ContactEmail` | `varchar(256)` | ✅ | |
| `ContactPhone` | `varchar(40)` | ✅ | |
| `Status` | `varchar(30)` | ❌ | `pending_verification` \| `active` \| `suspended` \| `rejected` |
| `OwnerUserId` | `nvarchar(450)` | ❌ | FK → `AspNetUsers.Id` (`Restrict`) |
| `VerifiedAtUtc` | `datetime2(3)` | ✅ | Set by Admin on approval |
| `VerifiedByUserId` | `nvarchar(450)` | ✅ | FK → `AspNetUsers.Id` (`Restrict`) |
| `CreatedAtUtc` | `datetime2(3)` | ❌ | |
| `CreatedByUserId` | `nvarchar(450)` | ❌ | FK → `AspNetUsers.Id` (`Restrict`) — immutable |
| `UpdatedAtUtc` | `datetime2(3)` | ✅ | |
| `UpdatedByUserId` | `nvarchar(max)` | ✅ | |
| `IsDeleted` | `bit` | ❌ | Default `false` |
| `DeletedAtUtc` | `datetime2(3)` | ✅ | |
| `DeletedByUserId` | `nvarchar(max)` | ✅ | |
| `RowVersion` | `rowversion` | ❌ | Auto-managed optimistic-concurrency token |

**Relationships:**
- `OwnerUserId` → `AspNetUsers.Id` — `Restrict`
- `VerifiedByUserId` → `AspNetUsers.Id` — `Restrict` (nullable)
- `CreatedByUserId` → `AspNetUsers.Id` — `Restrict`

**Indexes:**
| Name | Columns | Unique |
|---|---|---|
| `UX_Organizations_Slug` | `Slug` | ✅ |
| `IX_Organizations_OwnerUserId` | `OwnerUserId` | ❌ |
| `IX_Organizations_Status` | `Status` | ❌ |

---

#### `OrganizationMembers`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `Id` | `uniqueidentifier` | ❌ | PK, client-generated |
| `OrganizationId` | `uniqueidentifier` | ❌ | FK → `Organizations.Id` (`Cascade`) |
| `UserId` | `nvarchar(450)` | ❌ | FK → `AspNetUsers.Id` (`Restrict`) |
| `Status` | `int` | ❌ | Enum: `Invited=0`, `Active=1`, `Declined=2`, `Removed=3`. Default `0` |
| `JoinedAtUtc` | `datetime2(3)` | ✅ | Set when `Status` transitions to `Active` |
| `CreatedAtUtc` | `datetime2(3)` | ❌ | |
| `CreatedByUserId` | `nvarchar(450)` | ❌ | FK → `AspNetUsers.Id` (`Restrict`) — immutable |
| `IsDeleted` | `bit` | ❌ | Default `false` |
| `DeletedAtUtc` | `datetime2(3)` | ✅ | |
| `DeletedByUserId` | `nvarchar(max)` | ✅ | |

**Relationships:**
- `OrganizationId` → `Organizations.Id` — `Cascade` (safety net; orgs are soft-deleted)
- `UserId` → `AspNetUsers.Id` — `Restrict`
- `CreatedByUserId` → `AspNetUsers.Id` — `Restrict`

**Indexes:**
| Name | Columns | Unique | Filter | Purpose |
|---|---|---|---|---|
| `IX_OrganizationMembers_OrganizationId` | `OrganizationId` | ❌ | — | List all members of an org |
| `IX_OrganizationMembers_UserId` | `UserId` | ❌ | — | List all orgs a user belongs to |
| `UX_OrganizationMembers_Active` | `(OrganizationId, UserId)` | ✅ | `[Status]=1 AND [IsDeleted]=0` | **One active membership per user per org** |

**Uniqueness rule — `UX_OrganizationMembers_Active` (filtered unique index)**

A user may hold **at most one `Active` membership** per organization at any point in time. This is enforced at the database level by the filtered unique index above — not a composite primary key — for two reasons:

1. **Audit trail:** Historical rows (`Declined`, `Removed`) must be retained. A composite PK on `(OrganizationId, UserId)` would permanently prevent re-inviting a user after they leave.
2. **Soft deletes:** Soft-deleted rows (`IsDeleted = 1`) are excluded from the filter, so an archived record never blocks a new membership.

The filter `[Status] = 1 AND [IsDeleted] = 0` means only currently-active, non-deleted rows participate in uniqueness. Any attempt to `INSERT` or `UPDATE` a second active membership for the same `(OrganizationId, UserId)` pair is rejected by SQL Server before it reaches the application layer.

**State machine:**
```
Invited (0) ──► Active (1) ──► Removed (3)
          └───► Declined (2)
```

---

#### `Permissions`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `Id` | `uniqueidentifier` | ❌ | PK |
| `Code` | `varchar(120)` | ❌ | **Unique** (`UX_Permissions_Code`) |
| `Name` | `varchar(120)` | ❌ | |
| `Description` | `nvarchar` | ✅ | |
| `Category` | `varchar(80)` | ❌ | |

---

#### `OrganizationRoles`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `Id` | `uniqueidentifier` | ❌ | PK |
| `OrganizationId` | `uniqueidentifier` | ❌ | FK → `Organizations.Id` (`Cascade`) |
| `Name` | `varchar(80)` | ❌ | |
| `Description` | `nvarchar` | ✅ | |
| `IsSystemRole` | `bit` | ❌ | Default `false` |
| `CreatedAtUtc` | `datetime2(3)` | ❌ | |
| `CreatedByUserId` | `nvarchar(450)` | ❌ | FK → `AspNetUsers.Id` (`Restrict`) |
| `UpdatedAtUtc` | `datetime2(3)` | ✅ | |
| `UpdatedByUserId` | `nvarchar(450)` | ✅ | FK → `AspNetUsers.Id` (`Restrict`) |
| `IsDeleted` | `bit` | ❌ | Default `false` |

**Indexes:** `UX_OrganizationRoles_OrganizationId_Name` (unique composite)

---

#### `OrganizationRolePermissions`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `OrganizationRoleId` | `uniqueidentifier` | ❌ | PK Part, FK → `OrganizationRoles.Id` (`Cascade`) |
| `PermissionId` | `uniqueidentifier` | ❌ | PK Part, FK → `Permissions.Id` (`Cascade`) |

---

#### `OrganizationMemberRoles`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `OrganizationMemberId` | `uniqueidentifier` | ❌ | PK Part, FK → `OrganizationMembers.Id` (`Cascade`) |
| `OrganizationRoleId` | `uniqueidentifier` | ❌ | PK Part, FK → `OrganizationRoles.Id` (`Cascade`) |

---

### Migration History

| Migration | Date | Description |
|---|---|---|
| `InitialCreate` | 2026-06-28 | Identity tables + `Events` |
| `AddCategory` | 2026-07-03 | `Categories` table |
| `AddCategoryReferenceToEvent` | 2026-07-03 | `Events.CategoryId` FK |
| `RemoveEventCategoryString` | 2026-07-03 | Dropped legacy string category column |
| `CategorySuggestions` | 2026-07-04 | `CategorySuggestions` table |
| `AddOrganization` | 2026-07-12 | `Organizations` table |
| `AddOrganizationMember` | 2026-07-13 | `OrganizationMembers` table + filtered unique index |
| `UpdateTodatetime2(3)` | 2026-07-14 | Migrated DateTime to datetime2(3) globally |
| `AddOrganizationRBAC` | 2026-07-14 | `Permissions`, `OrganizationRoles`, and RBAC join tables |
| `AddOrganizationIdToEvents` | 2026-07-16 | Added `OrganizationId` FK to `Events` table |


---


