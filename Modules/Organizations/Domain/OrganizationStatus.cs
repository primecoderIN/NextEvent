namespace NextEvent.Modules.Organizations.Domain;

/// <summary>
/// Lifecycle states for an <see cref="Organization"/>.
/// Stored as a string in the database via EF Core value conversion
/// (HasConversion) so the column remains human-readable in SQL queries.
///
/// State machine:
///   PendingVerification → Active        (Admin approves)
///   PendingVerification → Rejected      (Admin rejects)
///   Active              → Suspended     (Admin suspends)
///   Suspended           → Active        (Admin reinstates)
/// </summary>
public enum OrganizationStatus
{
    /// <summary>
    /// The organization has been submitted and is awaiting Admin review.
    /// Default state for all new organizations.
    /// The owner does NOT yet hold the Organizer platform role.
    /// </summary>
    PendingVerification,

    /// <summary>
    /// The organization has been verified by an Admin.
    /// The owner is granted the Organizer platform role when this state is entered.
    /// </summary>
    Active,

    /// <summary>
    /// The organization has been temporarily suspended by an Admin.
    /// Events and memberships are preserved but the organization is hidden from public listing.
    /// </summary>
    Suspended,

    /// <summary>
    /// The organization application was rejected by an Admin.
    /// The owner retains the Member platform role.
    /// </summary>
    Rejected,
}
