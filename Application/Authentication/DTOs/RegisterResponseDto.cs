namespace Application.Authentication.DTOs;

public class RegisterResponseDto
{
    public required string Token { get; set; }
    public required string Username { get; set; }
    public required string DisplayName { get; set; }
    public string? Image { get; set; }
    public IEnumerable<string>? Roles { get; set; }
}
