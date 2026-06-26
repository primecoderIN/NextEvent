using Microsoft.AspNetCore.Identity;

namespace Domain;

public class User : IdentityUser
{
    public string? DisplayName {get;set;}

    public string? Bio {get;set;}

    public string? ImageUrl {get;set;}

    public string? RefreshToken {get;set;}

    public DateTime? RefreshTokenExpiryTime {get;set;}

}