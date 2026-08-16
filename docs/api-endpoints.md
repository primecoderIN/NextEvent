# API Endpoints Catalog

Base URL: `http://localhost:5000/api`

All URLs are **lowercase**. All responses use **camelCase** JSON and the `ApiResponse<T>` envelope.

> **Auth Legend**
> - `Anonymous` — No token required
> - `Authenticated` — Any valid JWT
> - `ActiveOrganizer` — JWT with `ActiveOrganizer` policy (Organizer role + Organizer active profile)
> - `Admin` — Platform Admin role

---

## 🗓️ Events

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/events` | Anonymous | Paginated list of public, active (non-cancelled, non-suspended) events. Supports filters: `q`, `categoryId`, `city`, `dateFrom`, `dateTo`, `organizationId` |
| `GET` | `/events/my` | ActiveOrganizer | Paginated list of events belonging to the current organizer's organization |
| `GET` | `/events/admin` | Admin | Paginated list of ALL events across the platform. Supports extra `status` filter |
| `GET` | `/events/{id}` | Anonymous | Get event detail by ID. Suspended events return `404` for non-admin/non-organizer callers |
| `POST` | `/events` | ActiveOrganizer | Create a new event |
| `PUT` | `/events/{id}` | ActiveOrganizer | Partially update an event (only provided fields are changed) |
| `DELETE` | `/events/{id}` | ActiveOrganizer | Delete an event |
| `POST` | `/events/{id}/suspend` | Admin | Suspend an event — hides it from public and member queries |
| `POST` | `/events/{id}/unsuspend` | Admin | Lift the suspension on an event |
| `POST` | `/events/{id}/report` | Authenticated | Report an event for moderation review |
| `GET` | `/events/{id}/reports` | Admin | Get all user-submitted reports for a specific event |

---

## 🏢 Organizations

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/organizations` | Admin | Paginated list of all organizations on the platform |
| `POST` | `/organizations` | Authenticated | Create a new organization. Status starts as `pending_verification`. Seeds 5 default system roles |
| `GET` | `/organizations/{id}` | Authenticated | Get organization detail by ID |
| `GET` | `/organizations/{id}/my-permissions` | Authenticated | Retrieves all dynamic permission codes the current authenticated user holds within the specified organization |
| `GET` | `/organizations/my` | Authenticated (Organizer only) | Get the organization owned by the current user |
| `GET` | `/organizations/my-invitations` | Authenticated | Get all pending organization invitations for the current user |
| `GET` | `/organizations/{slug}/profile` | Anonymous | Get public profile of an active organization by slug, including upcoming events |
| `POST` | `/organizations/{id}/approve` | Admin | Approve a pending organization and grant the owner the Organizer role |
| `GET` | `/organizations/{id}/members` | Authenticated (Org Member) / Admin | List all members of an organization |
| `PUT` | `/organizations/{id}/members/{memberId}/roles` | Authenticated | Update role assignments for a member |
| `POST` | `/organizations/{id}/members/invite` | Authenticated (members.invite permission) | Invite a user by email |
| `POST` | `/organizations/{id}/members/accept-invite` | Authenticated | Accept a pending invitation |
| `GET` | `/organizations/{id}/roles` | Authenticated (Org Member) / Admin | List all roles in the organization |

---

## 🔐 Account / Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/account/register` | Anonymous | Register a new user. Sets `refreshToken` HttpOnly cookie |
| `POST` | `/account/login` | Anonymous | Login. Sets `refreshToken` HttpOnly cookie |
| `POST` | `/account/refresh-token` | Anonymous | Issue new access token using `refreshToken` HTTP-only cookie |
| `POST` | `/account/logout` | Authenticated | Invalidate refresh token and clear cookie |
| `POST` | `/account/switch-profile` | Authenticated | Switch active profile between `Member` and `Organizer`. Returns new JWT |

---

## 👥 Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/users` | Admin | Paginated list of all users on the platform, ordered by most recently registered. |

---

## 🏷️ Categories

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/categories` | Anonymous | List all active event categories |
| `POST` | `/categories` | Admin | Create a new official category |
| `GET` | `/categories/suggestions` | Admin | List category suggestions, filterable by `status` (Pending/Approved/Rejected) |
| `POST` | `/categories/suggest` | Authenticated | Submit a new category suggestion for admin review |
| `POST` | `/categories/{id}/approve` | Admin | Approve a suggestion and publish it as an official category |
| `POST` | `/categories/{id}/reject` | Admin | Reject a suggestion with an optional reason |

---

## 🔑 Permissions

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/permissions` | Authenticated | Get the full catalogue of system permissions available to assign to roles |

---

## 🤖 AI

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/ai/generate-description` | Authenticated | Generate an event description using Gemini Pro from title, venue, and category |

---

## API Response Envelope

Every endpoint returns the same JSON shape:

```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": { ... },
  "errors": {}
}
```

| Field | Type | Description |
|---|---|---|
| `success` | `bool` | `true` for 2xx, `false` for all errors |
| `message` | `string` | Human-readable summary |
| `data` | `T \| null` | Response payload (null on error) |
| `errors` | `{ [field]: string[] }` | Validation errors keyed by property name |

### HTTP Status Code Mapping

| Exception | HTTP Status | Scenario |
|---|---|---|
| `ValidationException` | `400 Bad Request` | FluentValidation failures |
| `UnauthorizedException` | `401 Unauthorized` | Missing or invalid JWT |
| `ForbiddenException` | `403 Forbidden` | Authenticated but lacks required role/permission |
| `NotFoundException` | `404 Not Found` | Resource does not exist (also used for security-masked 403s) |
| `BusinessRuleException` | `409 Conflict` | Domain rule violated (e.g. duplicate slug) |
| Unhandled `Exception` | `500 Internal Server Error` | Unexpected server error |
