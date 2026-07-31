namespace NextEvent.Modules.Organizations.Application.Organizations.Commands.CreateOrganizationRole;
public class CreateOrganizationRoleDto
{
    public required string Name { get; set; }
    public string? Description { get; set; }
    public List<string> Permissions { get; set; } = [];
}
