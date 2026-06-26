namespace Application.Authentication.DTOs;

public class RegisterDTO
{
    public required string DisplayName { get; set; }
    public required string Email { get; set; }
    public required string Password { get; set; }
    public required string UserName { get; set; }
}
