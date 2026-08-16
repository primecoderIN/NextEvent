namespace NextEvent.Modules.Identity.Application.Users.DTOs;

public class UserDto
{
    public string Id { get; set; } = null!;
    public string UserName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? DisplayName { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
