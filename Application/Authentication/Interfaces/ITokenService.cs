using Domain;

namespace Application.Authentication.Interfaces;

public interface ITokenService
{
    string CreateToken(User user);
    string GenerateRefreshToken();
}
