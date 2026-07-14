namespace Domain;

/// <summary>
/// Represents a user's membership in an <see cref="Organization"/>.
///
/// ── Uniqueness rule ──────────────────────────────────────────────────────────
/// A user may only hold ONE <see cref="OrganizationMemberStatus.Active"/>
/// membership per organization at any point in time.  This is enforced by a
/// filtered unique index in the database
/// (<c>UX_OrganizationMembers_Active</c>) rather than a plain composite key,
/// for two reasons:
///
///   1. Historical rows (Invited → Declined, then later re-invited → Active)
///      must be retained for the audit trail.  A composite primary key on
///      (OrganizationId, UserId) would prevent a user from ever being
///      re-invited after leaving or declining.
///
///   2. Soft-deleted rows (IsDeleted = true) are excluded from the constraint,
///      so a removed member can rejoin later without conflicting with the
///      archived record.
///
/// The filtered index covers only rows where
///   Status = 1 (Active) AND IsDeleted = 0
/// making it impossible to INSERT or UPDATE a second active membership for the
/// same (OrganizationId, UserId) pair while one already exists.
///
/// ── Ownership ────────────────────────────────────────────────────────────────
/// The owner's membership is automatically created when the Organization is
/// activated.  Removing the owner's membership must first transfer ownership.
///
/// ── Soft-delete ──────────────────────────────────────────────────────────────
/// Hard deletes are never performed.  Set <see cref="IsDeleted"/> = true and
/// populate <see cref="DeletedAtUtc"/> / <see cref="DeletedByUserId"/>.
/// </summary>
public class OrganizationMember
{
    // -------------------------------------------------------------------------
    // Primary key
    // -------------------------------------------------------------------------

    /// <summary>
    /// Surrogate primary key.  UUID generated before insert so the ID is
    /// known client-side and can be used in subsequent commands without a
    /// round-trip.
    /// </summary>
    public Guid Id { get; set; } = Guid.NewGuid();

    // -------------------------------------------------------------------------
    // Core relationship
    // -------------------------------------------------------------------------

    /// <summary>
    /// FK → Organizations.Id.  The organization this membership belongs to.
    /// Cascade delete: if the organization is (hard) deleted, memberships are
    /// removed automatically.  Because we only soft-delete organizations, this
    /// cascade is a safety net only.
    /// </summary>
    public required Guid OrganizationId { get; set; }

    /// <summary>Navigation property for the parent organization.</summary>
    public Organization? Organization { get; set; }

    /// <summary>
    /// FK → AspNetUsers.Id.  The member user.
    /// Restrict delete: a User cannot be deleted while they are an active
    /// member of any organization.
    /// </summary>
    public required string UserId { get; set; }

    /// <summary>Navigation property for the member user.</summary>
    public User? User { get; set; }

    // -------------------------------------------------------------------------
    // Membership state
    // -------------------------------------------------------------------------

    /// <summary>
    /// Lifecycle status of this membership record.
    /// Stored as integer.  See <see cref="OrganizationMemberStatus"/> for the
    /// full state-machine description.
    /// New memberships created via invitation start as
    /// <see cref="OrganizationMemberStatus.Invited"/>;
    /// owner auto-memberships start as
    /// <see cref="OrganizationMemberStatus.Active"/>.
    /// </summary>
    public OrganizationMemberStatus Status { get; set; } = OrganizationMemberStatus.Invited;

    /// <summary>
    /// UTC timestamp of when Status transitioned to
    /// <see cref="OrganizationMemberStatus.Active"/>.
    /// Null for memberships that were never activated (e.g., Declined).
    /// </summary>
    public DateTimeOffset? JoinedAtUtc { get; set; }

    // -------------------------------------------------------------------------
    // Standard audit fields  (Architecture.md §3.3)
    // -------------------------------------------------------------------------

    /// <summary>UTC timestamp of when this record was created.</summary>
    public DateTimeOffset CreatedAtUtc { get; set; }

    /// <summary>
    /// FK → AspNetUsers.Id.  Who created this membership record
    /// (typically the organization owner or an admin for invitations;
    /// the member themselves when self-joining).
    /// Immutable after insert.
    /// </summary>
    public required string CreatedByUserId { get; set; }

    /// <summary>Navigation property for the creating user.</summary>
    public User? CreatedBy { get; set; }

    // -------------------------------------------------------------------------
    // Soft delete fields
    // -------------------------------------------------------------------------

    /// <summary>
    /// Soft-delete flag.  When true, this row is considered archived and
    /// excluded from all business queries.  The active-membership uniqueness
    /// filtered index also excludes soft-deleted rows.
    /// </summary>
    public bool IsDeleted { get; set; } = false;

    /// <summary>UTC timestamp of when this row was soft-deleted. Nullable.</summary>
    public DateTimeOffset? DeletedAtUtc { get; set; }

    /// <summary>
    /// FK → AspNetUsers.Id. The user who performed the soft delete. Nullable.
    /// </summary>
    public string? DeletedByUserId { get; set; }

    // -------------------------------------------------------------------------
    // Navigation properties for RBAC
    // -------------------------------------------------------------------------

    /// <summary>Roles assigned to this member within the organization.</summary>
    public ICollection<OrganizationMemberRole> MemberRoles { get; set; } = [];
}
