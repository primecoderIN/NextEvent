namespace Domain;

/// <summary>
/// Lifecycle status of an <see cref="OrganizationMember"/> record.
///
/// State machine:
///   Invited  → Active   (user accepts the invitation)
///   Invited  → Declined (user declines)
///   Active   → Removed  (owner/admin removes the member)
///
/// Only <see cref="Active"/> memberships participate in the
/// one-active-membership-per-user-per-organization uniqueness rule
/// (see <c>UX_OrganizationMembers_Active</c> filtered index in
/// <see cref="Persistence.AppDBContext"/>).
/// </summary>
public enum OrganizationMemberStatus
{
    /// <summary>User has been invited but has not yet responded.</summary>
    Invited = 0,

    /// <summary>User is a current, active member of the organization.</summary>
    Active = 1,

    /// <summary>User declined the invitation.</summary>
    Declined = 2,

    /// <summary>Membership was removed by an owner or admin.</summary>
    Removed = 3,
}
