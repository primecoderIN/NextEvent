namespace NextEvent.Shared.Constants;

public static class RoleConstants
{
    public const string Admin = "Admin";
    public const string Organizer = "Organizer";
    public const string Member = "Member";

    public static readonly IReadOnlyList<string> AllRoles = new[] { Admin, Organizer, Member };
}
