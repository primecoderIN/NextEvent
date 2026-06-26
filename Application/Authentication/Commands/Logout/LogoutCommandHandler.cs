using Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Application.Authentication.Commands.Logout;

public class LogoutCommandHandler(UserManager<User> userManager) 
    : IRequestHandler<LogoutCommand, Unit>
{
    public async Task<Unit> Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        var user = await userManager.Users.FirstOrDefaultAsync(u => u.RefreshToken == request.Token, cancellationToken);
        
        if (user != null)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = DateTime.UtcNow;
            await userManager.UpdateAsync(user);
        }

        return Unit.Value;
    }
}
