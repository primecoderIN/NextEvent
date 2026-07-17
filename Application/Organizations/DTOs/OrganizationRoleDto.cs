namespace Application.Organizations.DTOs;

public class OrganizationRoleDto
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public bool IsSystemRole { get; set; }
    public List<string> Permissions { get; set; } = [];
}
