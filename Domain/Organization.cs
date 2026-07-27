namespace Domain;

/// <summary>
/// Represents an Organization in the NextEvent platform.
/// 
/// Ownership model:
///   - <see cref="OwnerUserId"/> is the business owner of the organization.
///     It can be transferred to another active member in the future.
///   - <see cref="CreatedByUserId"/> is an immutable audit field recording
///     who originally submitted the organization — it never changes after insert.
///   - The Organizer ASP.NET Identity role is assigned to the owner only after
///     an Admin sets Status to "active". Until then the submitting user retains
///     the Member role.
/// 
/// Soft-delete pattern:
///   All deletes are logical. Set <see cref="IsDeleted"/> = true and populate
///   <see cref="DeletedAtUtc"/> / <see cref="DeletedByUserId"/>.
///   Hard deletes are never performed on this table.
/// 
/// Concurrency:
///   <see cref="RowVersion"/> is a SQL Server rowversion column managed
///   automatically by the database engine. EF Core uses it as an optimistic
///   concurrency token.
/// </summary>
public class Organization
{
    /// <summary>
    /// Primary key. UUID generated client-side so the ID is known before insert.
    /// Maps to SQL Server uniqueidentifier.
    /// </summary>
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Display name of the organization. Max 160 characters.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// URL-friendly unique identifier for the organization (e.g., "acme-events").
    /// Max 180 characters. Must be unique across all organizations.
    /// </summary>
    public required string Slug { get; set; }

    /// <summary>
    /// Optional long-form description of the organization.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// URL pointing to the organization's logo image. Nullable.
    /// </summary>
    public string? LogoUrl { get; set; }

    /// <summary>
    /// URL pointing to the organization's cover/banner image. Nullable.
    /// </summary>
    public string? CoverImageUrl { get; set; }

    /// <summary>
    /// Public website URL for the organization. Nullable.
    /// </summary>
    public string? WebsiteUrl { get; set; }

    /// <summary>
    /// Public contact email address. Max 256 characters. Nullable.
    /// </summary>
    public string? ContactEmail { get; set; }

    /// <summary>
    /// Public contact phone number. Max 40 characters. Nullable.
    /// </summary>
    public string? ContactPhone { get; set; }

    /// <summary>
    /// Lifecycle status of the organization.
    /// Valid values: pending_verification | active | suspended | rejected.
    /// New organizations always start as "pending_verification".
    /// The Organizer platform role is granted to OwnerUserId only when Status
    /// transitions to "active" by an Admin.
    /// </summary>
    public required string Status { get; set; } = "pending_verification";

    // -------------------------------------------------------------------------
    // Ownership
    // -------------------------------------------------------------------------

    /// <summary>
    /// FK → AspNetUsers.Id.
    /// The user who currently owns and controls this organization.
    /// Restricted delete: a User cannot be deleted while they own an Organization.
    /// </summary>
    public required string OwnerUserId { get; set; }

    /// <summary>
    /// Navigation property for the owner user.
    /// </summary>
    public User? Owner { get; set; }

    // -------------------------------------------------------------------------
    // Verification audit
    // -------------------------------------------------------------------------

    /// <summary>
    /// UTC timestamp of when the organization was verified by an Admin. Nullable.
    /// </summary>
    public DateTime? VerifiedAtUtc { get; set; }

    /// <summary>
    /// FK → AspNetUsers.Id. The Admin who performed the verification. Nullable.
    /// </summary>
    public string? VerifiedByUserId { get; set; }

    /// <summary>
    /// Navigation property for the verifying admin user.
    /// </summary>
    public User? VerifiedBy { get; set; }

    // -------------------------------------------------------------------------
    // Standard audit fields (Architecture.md §3.3 convention)
    // -------------------------------------------------------------------------

    /// <summary>
    /// UTC timestamp of when this record was created. Required.
    /// Maps to SQL Server datetime2(3).
    /// </summary>
    public DateTime CreatedAtUtc { get; set; }

    /// <summary>
    /// FK → AspNetUsers.Id. The user who created this record. Immutable after insert.
    /// </summary>
    public required string CreatedByUserId { get; set; }

    /// <summary>
    /// Navigation property for the creating user.
    /// </summary>
    public User? CreatedBy { get; set; }

    /// <summary>
    /// UTC timestamp of the last update to this record. Nullable.
    /// </summary>
    public DateTime? UpdatedAtUtc { get; set; }

    /// <summary>
    /// FK → AspNetUsers.Id. The user who last updated this record. Nullable.
    /// </summary>
    public string? UpdatedByUserId { get; set; }

    // -------------------------------------------------------------------------
    // Soft delete fields
    // -------------------------------------------------------------------------

    /// <summary>
    /// Soft-delete flag. When true, this record is considered deleted and
    /// should be excluded from all business queries.
    /// </summary>
    public bool IsDeleted { get; set; } = false;

    /// <summary>
    /// UTC timestamp of when this record was soft-deleted. Nullable.
    /// </summary>
    public DateTime? DeletedAtUtc { get; set; }

    /// <summary>
    /// FK → AspNetUsers.Id. The user who performed the soft delete. Nullable.
    /// </summary>
    public string? DeletedByUserId { get; set; }

    // -------------------------------------------------------------------------
    // Concurrency token
    // -------------------------------------------------------------------------

    /// <summary>
    /// SQL Server rowversion column. Automatically incremented by the database
    /// on every insert/update. EF Core uses this as an optimistic concurrency token
    /// to prevent lost-update race conditions.
    /// </summary>
    public byte[] RowVersion { get; set; } = [];
}
