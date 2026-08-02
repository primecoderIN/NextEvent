using NextEvent.Shared.Exceptions;
using NextEvent.Modules.Identity.Application.Authentication.DTOs;
using NextEvent.Modules.Identity.Application.Authentication.Interfaces;
using NextEvent.Modules.Identity.Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

using NextEvent.Shared.Interfaces;

namespace NextEvent.Modules.Identity.Application.Authentication.Commands.RefreshToken;
public class RefreshTokenCommandHandler(UserManager<User> userManager, ITokenService tokenService, IOrganizationMemberService memberService, IDateTimeProvider dateTimeProvider) 
    : IRequestHandler<RefreshTokenCommand, AuthResult<LoginResponseDto>>
{
    public async Task<AuthResult<LoginResponseDto>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var hashedRequestToken = tokenService.HashRefreshToken(request.Token);
        var user = await userManager.Users.FirstOrDefaultAsync(u => u.RefreshToken == hashedRequestToken, cancellationToken);

        if (user == null || user.RefreshTokenExpiryTime == null || user.RefreshTokenExpiryTime <= dateTimeProvider.UtcNow)
        {
            throw new UnauthorizedException("Invalid refresh token");
        }

        var newRefreshToken = tokenService.GenerateRefreshToken();
        user.RefreshToken = tokenService.HashRefreshToken(newRefreshToken);
        user.RefreshTokenExpiryTime = dateTimeProvider.UtcNow.AddDays(7);
        
        // Heal legacy accounts (seeded before ActiveProfile existed) where DB contains NULL or empty string
        if (string.IsNullOrEmpty(user.ActiveProfile))
        {
            user.ActiveProfile = "Member";
        }
        
        await userManager.UpdateAsync(user);

        var roles = await userManager.GetRolesAsync(user);

        var activeOrgId = await memberService.GetActiveOrganizationIdAsync(user.Id, cancellationToken);

        var isOrganizer = roles.Contains(RoleConstants.Organizer) || activeOrgId.HasValue;
        var availableProfiles = new List<string> { "Member" };
        if (isOrganizer) availableProfiles.Add("Organizer");

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
