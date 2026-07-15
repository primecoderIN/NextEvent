namespace Domain.Constants;

/// <summary>
/// Canonical permission codes for organization-level RBAC.
///
/// Codes versus Display Names
/// --------------------------
/// A Code (e.g. "events.create") is the stable, machine-readable key that is
/// stored in the database, checked in authorization logic, and embedded in JWTs
/// or policy names. It must NEVER change once deployed because renaming it
/// breaks authorization checks across the whole system.
///
/// A Name (e.g. "Create Events") is the human-readable label shown in the UI
/// (role editor, audit logs). It can be updated freely without touching code.
///
/// Rule of thumb:
///   - Code  → used in [Authorize(Policy = "…")], permission guards, and DB FK.
///   - Name  → used in &lt;label&gt; elements, tooltips, and admin dashboards.
/// </summary>
public static class PermissionConstants
{
    // -----------------------------------------------------------------------
    // Organization settings
    // -----------------------------------------------------------------------
    public const string OrganizationView   = "organization.view";
    public const string OrganizationUpdate = "organization.update";

    // -----------------------------------------------------------------------
    // Members
    // -----------------------------------------------------------------------
    public const string MembersInvite = "organization.members.invite";
    public const string MembersRemove = "organization.members.remove";

    // -----------------------------------------------------------------------
    // Roles
    // -----------------------------------------------------------------------
    public const string RolesManage = "organization.roles.manage";

    // -----------------------------------------------------------------------
    // Events
    // -----------------------------------------------------------------------
    public const string EventsCreate  = "events.create";
    public const string EventsUpdate  = "events.update";
    public const string EventsPublish = "events.publish";
    public const string EventsCancel  = "events.cancel";

    // -----------------------------------------------------------------------
    // Orders & Attendees
    // -----------------------------------------------------------------------
    public const string OrdersView      = "orders.view";
    public const string AttendeesCheckin = "attendees.checkin";

    // -----------------------------------------------------------------------
    // Coupons & Announcements
    // -----------------------------------------------------------------------
    public const string CouponsManage       = "coupons.manage";
    public const string AnnouncementsManage = "announcements.manage";

    // -----------------------------------------------------------------------
    // Analytics
    // -----------------------------------------------------------------------
    public const string AnalyticsView = "analytics.view";

    // -----------------------------------------------------------------------
    // Seed catalogue
    // Each entry: (Code, DisplayName, Description, Category)
    // -----------------------------------------------------------------------
    public static readonly IReadOnlyList<(string Code, string Name, string Description, string Category)> All =
    [
        (OrganizationView,   "View Organization",          "View organization profile and settings.",            "Organization"),
        (OrganizationUpdate, "Update Organization",        "Edit organization details, logo, and contact info.",  "Organization"),

        (MembersInvite,      "Invite Members",             "Send invitations to new team members.",               "Members"),
        (MembersRemove,      "Remove Members",             "Remove or suspend existing team members.",            "Members"),

        (RolesManage,        "Manage Roles",               "Create, edit, and delete organization roles.",        "Roles"),

        (EventsCreate,       "Create Events",              "Draft new events under this organization.",           "Events"),
        (EventsUpdate,       "Update Events",              "Edit existing event details.",                        "Events"),
        (EventsPublish,      "Publish Events",             "Move events from draft to published status.",         "Events"),
        (EventsCancel,       "Cancel Events",              "Cancel a published or upcoming event.",               "Events"),

        (OrdersView,         "View Orders",                "View ticket orders and buyer information.",           "Orders"),
        (AttendeesCheckin,   "Check In Attendees",         "Scan tickets and mark attendees as checked in.",      "Attendees"),

        (CouponsManage,      "Manage Coupons",             "Create, edit, and disable discount coupons.",         "Coupons"),
        (AnnouncementsManage,"Manage Announcements",       "Publish announcements to followers and attendees.",   "Announcements"),

        (AnalyticsView,      "View Analytics",             "Access event performance and revenue analytics.",     "Analytics"),
    ];
}
