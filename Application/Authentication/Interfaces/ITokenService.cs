using Domain;

namespace Application.Authentication.Interfaces;

public interface ITokenService
{
    string CreateToken(User user, IList<string> roles, string activeProfile, Guid? organizationId = null);
    string GenerateRefreshToken();
}
