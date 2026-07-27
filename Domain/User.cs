using Microsoft.AspNetCore.Identity;

namespace Domain;

/// <summary>
/// Represents the Application User entity in the Domain layer.
/// Inherits from ASP.NET Core Identity's IdentityUser to integrate with authentication,
/// while adding custom properties specific to the NextEvent application.
/// </summary>
public class User : IdentityUser
{
    public string? DisplayName {get;set;}

    public string? Bio {get;set;}

    public string? ImageUrl {get;set;}

    public string? RefreshToken {get;set;}

    public DateTime? RefreshTokenExpiryTime {get;set;}

    public string ActiveProfile { get; set; } = "Member";

}