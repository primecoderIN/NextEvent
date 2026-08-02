using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NextEvent.Modules.Identity.Domain;
using MediatR;

using NextEvent.Modules.Identity.Application.Authentication.Interfaces;
using NextEvent.Shared.Interfaces;

namespace NextEvent.Modules.Identity.Application.Authentication.Commands.Logout;
public class LogoutCommandHandler(UserManager<User> userManager, ITokenService tokenService, IDateTimeProvider dateTimeProvider) 
    : IRequestHandler<LogoutCommand, Unit>
{
    public async Task<Unit> Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        var hashedToken = tokenService.HashRefreshToken(request.Token);
        var user = await userManager.Users.FirstOrDefaultAsync(u => u.RefreshToken == hashedToken, cancellationToken);
        
        if (user != null)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = dateTimeProvider.UtcNow;
            await userManager.UpdateAsync(user);
        }

        return Unit.Value;
    }
}
