using Application.Core.Exceptions;
using Application.Core.Interfaces;
using Application.Authentication.DTOs;
using Application.Authentication.Interfaces;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Application.Authentication.Commands.SwitchProfile;

public class SwitchProfileCommandHandler(
    UserManager<User> userManager, 
    ITokenService tokenService, 
    IAppDBContext appDbContext,
    ICurrentUserService currentUserService) 
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
        var isOrganizer = roles.Contains(Domain.Constants.RoleConstants.Organizer) 
            || await appDbContext.Organizations.AnyAsync(o => o.OwnerUserId == user.Id, cancellationToken) 
            || await appDbContext.OrganizationMembers.AnyAsync(m => m.UserId == user.Id && m.Status == Domain.OrganizationMemberStatus.Active, cancellationToken);
        
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
        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTimeOffset.UtcNow.AddDays(7);

        await userManager.UpdateAsync(user);

        return new AuthResult<LoginResponseDto>
        {
            RefreshToken = newRefreshToken,
            User = new LoginResponseDto
            {
                DisplayName = user.DisplayName ?? user.UserName!,
                Image = user.ImageUrl,
                Token = tokenService.CreateToken(user, roles, user.ActiveProfile),
                Username = user.UserName!,
                Roles = roles,
                ActiveProfile = user.ActiveProfile,
                AvailableProfiles = availableProfiles
            }
        };
    }
}
