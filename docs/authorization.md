# Authorization & Security Guide: BOLA and BFLA in NextEvent

This document provides a comprehensive guide on how authorization, Broken Object Level Authorization (BOLA), and Broken Function Level Authorization (BFLA) are handled across the NextEvent platform. 

It breaks down the implementation details on both the Backend and Frontend and maps out the exact conditions and permissions required for every action on every screen.

---

## 1. Security Architecture Concepts

### Platform-Level vs. Tenant-Level Authorization
NextEvent explicitly separates global platform roles from tenant (organization) level roles:
- **Platform Roles (`RoleConstants.Admin`)**: Granted via ASP.NET Identity Roles. Controls access to global platform features (approving organizations, suspending events, viewing all users).
- **Active Profile (`Member` vs `Organizer`)**: A JWT claim that indicates the user's current working context.
- **Organization Permissions (e.g., `events.create`)**: Dynamic, granular permissions stored in the `OrganizationRoles` and `OrganizationRolePermissions` tables. Evaluated strictly against the target `OrganizationId`.

### BFLA (Broken Function Level Authorization)
BFLA occurs when a user can execute an endpoint they shouldn't have access to (e.g., a standard user executing an admin action).
- **Backend Mitigation**: Endpoints are gated at the controller or endpoint level using `[Authorize(Roles = "Admin")]` for Admin actions, or `[Authorize(Policy = "ActiveOrganizer")]` for actions strictly requiring an active Organizer profile.
- **Frontend Mitigation**: Route guards (`<RequireRole>`, `<RequireProfile>`) prevent unauthorized profiles from mounting specific UI trees.

### BOLA (Broken Object Level Authorization)
BOLA (or IDOR) occurs when a user can manipulate a resource belonging to another user or tenant by simply modifying the ID in the request payload.
- **Backend Mitigation**: Handlers **never** trust user-provided organization IDs for mutations. The backend fetches the target entity (e.g., the Event) from the database, extracts its true `OrganizationId`, and validates that the caller holds the required permission (`authorizationService.AuthorizeAsync`) within *that specific* organization.
- **Frontend Mitigation**: UI components dynamically check permissions via `useOrganizationPermissions()`. Buttons and forms are hidden or disabled if the user lacks the specific permission in the active organization context.

---

## 2. Implementation Details

### Backend Implementation
1. **`IOrganizationAuthorizationService`**: The central authority for evaluating tenant permissions. It performs a 4-level Entity Framework join (`User -> Member -> Role -> Permission`) to resolve a user's permissions within a specific organization.
2. **Redis Caching**: To prevent database hammering, the resolved permission array is cached in Redis with a 5-minute TTL. The cache is explicitly invalidated immediately whenever organization roles or member assignments are updated.
3. **Admin Bypass**: For certain queries (like viewing organization members or roles), `GetOrganizationMembersQueryHandler` explicitly bypasses the tenant-level check if the user has the platform `Admin` role:
   ```csharp
   if (!currentUserService.HasRole(RoleConstants.Admin)) {
       await authorizationService.AuthorizeAsync(request.OrganizationId, PermissionConstants.OrganizationView, cancellationToken);
   }
   ```
4. **Endpoint Level Authorization**:
   - `[Authorize(Roles = "Admin")]`: Strictly limits the endpoint to Platform Admins (e.g., Approving an organization).
   - `[Authorize(Policy = "ActiveOrganizer")]`: Limits the endpoint to users who hold both the `Organizer` Identity Role and have their `ActiveProfile` claim set to `Organizer`.

### Frontend Implementation
1. **Route Guards**:
   - `<RequireRole role="Admin">`: Protects `/admin/*` routes.
   - `<RequireProfile profile="Organizer">`: Protects `/organizer/*` routes.
2. **`useOrganizationPermissions` Hook**: 
   - Fetches the active user's permissions array from `/api/organizations/{id}/my-permissions`.
   - Uses **React Query** with a `staleTime` of 10 minutes to serve cached permissions instantly across route navigations without re-fetching.
3. **`<RequirePermission>` Component / `<Can>` Component**:
   - Wraps sensitive UI elements (e.g., the "Create Event" button, the "Edit Role" modal).
   - Dynamically evaluates if the user's cached permission array includes the required string (e.g., `events.create`). If not, it returns `null` or a fallback UI.

---

## 3. User Scenarios & Capabilities

### Scenario A: The Platform Admin
- **Identity**: Has the ASP.NET Identity role `Admin`.
- **Profile**: Usually operates under the `Member` profile (Admins do not own standard organizations unless they explicitly create one).
- **Capabilities**: Can view all organizations, approve/reject pending organizations, view all events globally, suspend/unsuspend events, view reports, and view platform users.
- **Limitations**: Cannot create events, cannot create organization roles, and cannot invite members to organizations (these are tenant-level mutations).

### Scenario B: Active Organizer (In an Organization)
- **Identity**: Has the ASP.NET Identity role `Organizer`.
- **Profile**: Operating under the `ActiveProfile = Organizer` context.
- **Capabilities**: Can access the `/organizer` dashboard. Their capabilities within the organization are strictly dictated by the custom roles assigned to them by the organization owner. If they are the Owner, they have all permissions. If they are a custom role, they may only have `events.create` but lack `roles.manage`.
- **Limitations**: Cannot access `/admin` routes. Cannot access other organizations' data.

### Scenario C: Logged-in Member (No Organization)
- **Identity**: Standard user account.
- **Profile**: `ActiveProfile = Member`.
- **Capabilities**: Can browse public events, view public organization profiles, buy tickets, and report events.
- **Limitations**: Cannot access `/admin`. Cannot access `/organizer`. Cannot report an event multiple times, and cannot report an event if they belong to the organization that owns it.

---

## 4. Screen-by-Screen Permission Matrix

### Public Screens
| Screen / Action | Required Profile | Required Permission | Notes |
|---|---|---|---|
| View Public Event Detail | Anonymous / Any | None | 404 if event is suspended/cancelled (unless Admin/Owner) |
| View Org Public Profile | Anonymous / Any | None | 404 if Org is not Active |
| Report an Event | Member | None | User cannot belong to the owning organization |

### Admin Screens (`/admin/*`)
| Screen / Action | Required Profile | Required Permission | Notes |
|---|---|---|---|
| View Admin Dashboard | `Admin` Role | None | Gated by `<RequireRole role="Admin">` |
| View Organizations List | `Admin` Role | None | |
| Approve/Reject Org | `Admin` Role | None | Grants `Organizer` role to the org owner |
| View All Events | `Admin` Role | None | |
| Suspend/Unsuspend Event| `Admin` Role | None | |
| View Event Reports | `Admin` Role | None | |
| View All Users | `Admin` Role | None | |

### Organizer Screens (`/organizer/*`)
*All actions below require the user to have `ActiveProfile = Organizer` and an active Organization.*

| Screen / Action | Required Permission (Tenant Level) | Notes |
|---|---|---|
| View Organizer Dashboard | `organization.view` | Fails if user is suspended from the org |
| View My Events List | `events.view` | Only returns events for their specific `OrganizationId` |
| Create Event | `events.create` | `OrganizationId` is automatically attached on the backend |
| Edit Event | `events.update` | Backend loads event to verify it belongs to user's org (BOLA prevention) |
| Delete/Cancel Event | `events.delete` | Backend loads event to verify ownership |
| View Members List | `members.view` | Admins can also view this |
| Invite Member | `members.invite` | Backend verifies caller's `members.invite` permission |
| Update Member Roles | `roles.manage` | Cannot remove the `Owner` system role |
| View Roles List | `roles.view` | Admins can also view this |
| Create Custom Role | `roles.manage` | |
| Edit Custom Role | `roles.manage` | Cannot rename or edit descriptions of System Roles |

## Summary
The combination of controller-level policies (`ActiveOrganizer`), handler-level strict database validation (`authorizationService.AuthorizeAsync`), and dynamic frontend rendering (`useOrganizationPermissions`) ensures that NextEvent is fundamentally secure against both BFLA and BOLA attacks across all user scenarios.
