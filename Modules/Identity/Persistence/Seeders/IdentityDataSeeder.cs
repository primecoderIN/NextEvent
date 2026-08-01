using Microsoft.AspNetCore.Identity;
using NextEvent.Modules.Identity.Domain;
using NextEvent.Shared.Constants;

namespace NextEvent.Modules.Identity.Persistence.Seeders;

/// <summary>
/// Seeder responsible for seeding ASP.NET Core Identity roles and initial admin/organizer/member accounts.
/// Executes idempotently during application startup.
/// </summary>
public static class IdentityDataSeeder
{
    /// <summary>
    /// Seeds default application roles (Admin, Organizer, Member) and default user accounts if not present.
    /// </summary>
    public static async Task SeedAsync(
        RoleManager<IdentityRole> roleManager,
        UserManager<User> userManager)
    {
        var roles = new List<string> { RoleConstants.Member, RoleConstants.Organizer, RoleConstants.Admin };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        if (!userManager.Users.Any())
        {
            var admin = new User { UserName = "admin", Email = "admin@test.com", DisplayName = "Admin User" };
            await userManager.CreateAsync(admin, "Pa$$w0rd");
            await userManager.AddToRoleAsync(admin, RoleConstants.Admin);

            var organizer = new User { UserName = "organizer", Email = "organizer@test.com", DisplayName = "Organizer User" };
            await userManager.CreateAsync(organizer, "Pa$$w0rd");
            await userManager.AddToRoleAsync(organizer, RoleConstants.Organizer);

            var member = new User { UserName = "member", Email = "member@test.com", DisplayName = "Member User" };
            await userManager.CreateAsync(member, "Pa$$w0rd");
            await userManager.AddToRoleAsync(member, RoleConstants.Member);
        }
    }
}
