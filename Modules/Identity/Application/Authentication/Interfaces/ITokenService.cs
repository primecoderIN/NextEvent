using NextEvent.Modules.Identity.Domain;

namespace NextEvent.Modules.Identity.Application.Authentication.Interfaces;
public interface ITokenService
{
    string CreateToken(User user, IList<string> roles, string activeProfile, Guid? organizationId = null);
    string GenerateRefreshToken();
}
