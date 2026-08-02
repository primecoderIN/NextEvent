using NextEvent.Shared.Exceptions;
using NextEvent.Shared.Interfaces;
using NextEvent.Modules.Identity.Application.Authentication.DTOs;
using NextEvent.Modules.Identity.Application.Authentication.Interfaces;
using NextEvent.Modules.Identity.Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace NextEvent.Modules.Identity.Application.Authentication.Commands.SwitchProfile;
public class SwitchProfileCommandHandler(
    UserManager<User> userManager, 
    ITokenService tokenService, 
    IOrganizationMemberService memberService,
    ICurrentUserService currentUserService,
    IDateTimeProvider dateTimeProvider) 
    : IRequestHandler<SwitchProfileCommand, AuthResult<LoginResponseDto>>
{
    public async Task<AuthResult<LoginResponseDto>> Handle(SwitchProfileCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = currentUserService.GetCurrentUserId();
        if (currentUserId == null)
        {
            throw new UnauthorizedException("User not authenticated.");
        }

        var user = await userManager.FindByIdAsync(currentUserId);
        if (user == null)
        {
            throw new UnauthorizedException("User not found.");
        }

        var roles = await userManager.GetRolesAsync(user);
        
        var activeOrgId = await memberService.GetActiveOrganizationIdAsync(user.Id, cancellationToken);

        var isOrganizer = roles.Contains(RoleConstants.Organizer) || activeOrgId.HasValue;
        
        var availableProfiles = new List<string> { "Member" };
        if (isOrganizer) availableProfiles.Add("Organizer");

        if (!availableProfiles.Contains(request.Profile))
        {
            throw new UnauthorizedException($"You are not authorized to switch to the {request.Profile} profile.");
        }

        // Update the active profile
        user.ActiveProfile = request.Profile;
        
        // We also want to refresh the token since the frontend relies on receiving a new token & user state when logging in/refreshing
        var newRefreshToken = tokenService.GenerateRefreshToken();
        user.RefreshToken = tokenService.HashRefreshToken(newRefreshToken);
        user.RefreshTokenExpiryTime = dateTimeProvider.UtcNow.AddDays(7);

        await userManager.UpdateAsync(user);

        return new AuthResult<LoginResponseDto>
        {
            RefreshToken = newRefreshToken,
            User = new LoginResponseDto
            {
                DisplayName = user.DisplayName ?? user.UserName!,
                Image = user.ImageUrl,
                Token = tokenService.CreateToken(user, roles, user.ActiveProfile, user.ActiveProfile == "Organizer" ? activeOrgId : null),
                Username = user.UserName!,
                Roles = roles,
                ActiveProfile = user.ActiveProfile,
                AvailableProfiles = availableProfiles
            }
        };
    }
}
