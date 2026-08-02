using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using NextEvent.Modules.Identity.Domain;
using Microsoft.IdentityModel.Tokens;
using NextEvent.Modules.Identity.Application.Authentication.Interfaces;

using NextEvent.Shared.Interfaces;

namespace NextEvent.Modules.Identity.Application.Services;
public class TokenService(IConfiguration config, IDateTimeProvider dateTimeProvider) : ITokenService
{
    public string CreateToken(User user, IList<string> roles, string activeProfile, Guid? organizationId = null)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email!),
            new Claim(ClaimTypes.Name, user.UserName!),
            new Claim("ActiveProfile", activeProfile)
        };

        if (organizationId.HasValue)
        {
            claims.Add(new Claim("OrganizationId", organizationId.Value.ToString()));
        }

        foreach (var role in roles)
        {
            // Add Role claims to the JWT so that [Authorize(Roles = "...")] attributes work properly
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var keyString = config["TokenKey"] ?? throw new Exception("TokenKey not found in config");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

        var issuer = config["Jwt:Issuer"] ?? "NextEvent.API";
        var audience = config["Jwt:Audience"] ?? "NextEvent.Client";

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = dateTimeProvider.UtcNow.AddMinutes(10), // Short lived access token
            SigningCredentials = creds,
            Issuer = issuer,
            Audience = audience
        };

        var tokenHandler = new JwtSecurityTokenHandler();

        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    public string HashRefreshToken(string token)
    {
        var tokenBytes = Encoding.UTF8.GetBytes(token);
        var hashBytes = SHA256.HashData(tokenBytes);
        return Convert.ToBase64String(hashBytes);
    }
}
