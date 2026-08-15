## API Endpoints

Base URL: `https://localhost:5001/api`

| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `GET` | `/events` | Anonymous | List public active events (IsCancelled = 0) |
| `GET` | `/events/my` | Platform `Organizer` | List events for current organizer |
| `GET` | `/events/admin` | Platform `Admin` | List all events across the platform |
| `GET` | `/events/{id}` | Anonymous | Get event by ID |
| `POST` | `/events` | Authenticated | Create a new event |
| `PUT` | `/events/{id}` | Authenticated | Edit an existing event (partial update supported) |
| `DELETE` | `/events/{id}` | Authenticated | Delete an event |

### Organizations
| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `POST` | `/organizations` | Authenticated | Create a new organization (seeds default roles) |
| `GET` | `/organizations/{id}` | Anonymous | Get organization details by ID |
| `GET` | `/organizations/{slug}` | Anonymous | Get public organization profile + upcoming events |
| `POST` | `/organizations/{id}/approve` | Platform `Admin` | Approve a pending organization |
| `POST` | `/organizations/{id}/roles` | Org `roles.manage` | Create a custom organization role |
| `PUT` | `/organizations/{id}/roles/{roleId}` | Org `roles.manage` | Update an organization role |
| `POST` | `/organizations/{id}/members/invite` | Org `members.invite` | Invite a user to the organization via email |
| `POST` | `/organizations/{id}/members/accept-invite`| Authenticated | Accept a pending organization invitation |

### Permissions
| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `GET` | `/permissions` | Authenticated | Get catalogue of system permissions available for roles |

### Categories
| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `GET` | `/categories` | Anonymous | Get all categories |
| `POST` | `/categories` | Platform `Admin` | Create a new category |
| `GET` | `/categories/suggestions` | Platform `Admin` | Get category suggestions |
| `POST` | `/categories/suggest` | Authenticated | Suggest a new category |
| `POST` | `/categories/{id}/approve` | Platform `Admin` | Approve a category suggestion |
| `POST` | `/categories/{id}/reject` | Platform `Admin` | Reject a category suggestion |

### Account / Auth
| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `POST` | `/account/register` | Anonymous | Register a new user |
| `POST` | `/account/login` | Anonymous | Login user |
| `POST` | `/account/refresh-token` | Anonymous | Get new access token using httpOnly cookie |
| `POST` | `/account/logout` | Authenticated | Logout user |

### AI
| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `POST` | `/ai/generate-description` | Anonymous | Gemini Pro generates description from details |

All URLs are **lowercase**. All responses use **camelCase** JSON property names and the `ApiResponse<T>` envelope.

---


