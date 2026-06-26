namespace Application.Authentication.DTOs;

public class AuthResult
{
    public required UserDTO User { get; set; }
    public required string RefreshToken { get; set; }
}
