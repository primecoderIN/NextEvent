namespace NextEvent.Modules.Identity.Application.Authentication.DTOs;
public class AuthResult<T>
{
    public required T User { get; set; }
    public required string RefreshToken { get; set; }
}
