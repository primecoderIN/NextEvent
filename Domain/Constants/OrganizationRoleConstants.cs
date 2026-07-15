namespace Domain.Constants;

/// <summary>
/// System role names seeded into every new Organization's OrganizationRoles table.
/// These are the 5 roles listed in Architecture.md §4.2.
///
/// "System roles" (IsSystemRole = true) cannot be renamed or deleted by org admins
/// because the Owner role in particular is load-bearing for ownership transfer logic.
/// </summary>
public static class OrganizationRoleConstants
{
    public const string Owner          = "Owner";
    public const string Admin          = "Admin";
    public const string EventManager   = "Event Manager";
    public const string FinanceManager = "Finance Manager";
    public const string CheckInStaff   = "Check-In Staff";

    /// <summary>
    /// Defines which permissions are pre-assigned to each system role when an
    /// organization is first created. Keys are role names; values are the
    /// permission codes drawn from <see cref="PermissionConstants"/>.
    ///
    /// Design rule: grant the least privilege required for the role's purpose.
    ///   Owner          → every permission (full control)
    ///   Admin          → everything except ownership-transfer (same as owner for now)
    ///   Event Manager  → manage event lifecycle only
    ///   Finance Manager→ view orders and analytics
    ///   Check-In Staff → check in attendees only
    /// </summary>
    public static readonly IReadOnlyDictionary<string, IReadOnlyList<string>> DefaultPermissions =
        new Dictionary<string, IReadOnlyList<string>>
        {
            [Owner] =
            [
                PermissionConstants.OrganizationView,
                PermissionConstants.OrganizationUpdate,
                PermissionConstants.MembersInvite,
                PermissionConstants.MembersRemove,
                PermissionConstants.RolesManage,
                PermissionConstants.EventsCreate,
                PermissionConstants.EventsUpdate,
                PermissionConstants.EventsPublish,
                PermissionConstants.EventsCancel,
                PermissionConstants.OrdersView,
                PermissionConstants.AttendeesCheckin,
                PermissionConstants.CouponsManage,
                PermissionConstants.AnnouncementsManage,
                PermissionConstants.AnalyticsView,
            ],

            [Admin] =
            [
                PermissionConstants.OrganizationView,
                PermissionConstants.OrganizationUpdate,
                PermissionConstants.MembersInvite,
                PermissionConstants.MembersRemove,
                PermissionConstants.RolesManage,
                PermissionConstants.EventsCreate,
                PermissionConstants.EventsUpdate,
                PermissionConstants.EventsPublish,
                PermissionConstants.EventsCancel,
                PermissionConstants.OrdersView,
                PermissionConstants.AttendeesCheckin,
                PermissionConstants.CouponsManage,
                PermissionConstants.AnnouncementsManage,
                PermissionConstants.AnalyticsView,
            ],

            [EventManager] =
            [
                PermissionConstants.OrganizationView,
                PermissionConstants.EventsCreate,
                PermissionConstants.EventsUpdate,
                PermissionConstants.EventsPublish,
                PermissionConstants.EventsCancel,
                PermissionConstants.AttendeesCheckin,
                PermissionConstants.AnnouncementsManage,
            ],

            [FinanceManager] =
            [
                PermissionConstants.OrganizationView,
                PermissionConstants.OrdersView,
                PermissionConstants.AnalyticsView,
                PermissionConstants.CouponsManage,
            ],

            [CheckInStaff] =
            [
                PermissionConstants.OrganizationView,
                PermissionConstants.AttendeesCheckin,
            ],
        };
}
