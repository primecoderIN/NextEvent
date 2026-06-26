namespace Application.Authentication.DTOs;

public class UserDTO
{
    public required string DisplayName { get; set; }
    public required string Token { get; set; }
    public required string UserName { get; set; }
    public string? Image { get; set; }
}
