using NextEvent.Shared.Exceptions;
using NextEvent.Shared.Interfaces;
using NextEvent.Modules.Identity.Domain;
using Microsoft.AspNetCore.Identity;

namespace NextEvent.Modules.Identity.Application.Services;
/// <summary>
/// API-layer implementation of <see cref="IIdentityService"/>.
/// Wraps <see cref="UserManager{TUser}"/> so the Application layer
/// never takes a direct dependency on ASP.NET Core Identity.
/// </summary>
public class IdentityService(UserManager<User> userManager) : IIdentityService
{
    public async Task AssignRoleAsync(
        string userId,
        string roleName,
        CancellationToken cancellationToken = default)
    {
        var user = await userManager.FindByIdAsync(userId)
            ?? throw new BusinessRuleException($"User '{userId}' was not found. Cannot assign role '{roleName}'.");

        // No-op if the user already holds the role — safe to call repeatedly.
        if (await userManager.IsInRoleAsync(user, roleName))
            return;

        var result = await userManager.AddToRoleAsync(user, roleName);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new BusinessRuleException($"Failed to assign role '{roleName}' to user '{userId}': {errors}");
        }
    }
}
