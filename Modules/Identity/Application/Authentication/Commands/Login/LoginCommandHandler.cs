using NextEvent.Shared.Exceptions;
using NextEvent.Modules.Identity.Application.Authentication.DTOs;
using NextEvent.Modules.Identity.Application.Authentication.Interfaces;
using NextEvent.Modules.Identity.Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NextEvent.Shared.Interfaces;

namespace NextEvent.Modules.Identity.Application.Authentication.Commands.Login;
public class LoginCommandHandler(UserManager<User> userManager, ITokenService tokenService, IOrganizationMemberService memberService, IDateTimeProvider dateTimeProvider) 
    : IRequestHandler<LoginCommand, AuthResult<LoginResponseDto>>
{
    public async Task<AuthResult<LoginResponseDto>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByEmailAsync(request.Email);

        if (user == null || !await userManager.CheckPasswordAsync(user, request.Password))
        {
            throw new UnauthorizedException("Invalid email or password");
        }

        var refreshToken = tokenService.GenerateRefreshToken();
        user.RefreshToken = tokenService.HashRefreshToken(refreshToken);
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

        var userDto = new LoginResponseDto
        {
            DisplayName = user.DisplayName ?? user.UserName!,
            Token = tokenService.CreateToken(user, roles, user.ActiveProfile, user.ActiveProfile == "Organizer" ? activeOrgId : null),
            Username = user.UserName!,
            Image = user.ImageUrl,
            Roles = roles,
            ActiveProfile = user.ActiveProfile,
            AvailableProfiles = availableProfiles
        };

        return new AuthResult<LoginResponseDto>
        {
            User = userDto,
            RefreshToken = refreshToken
        };
    }
}
