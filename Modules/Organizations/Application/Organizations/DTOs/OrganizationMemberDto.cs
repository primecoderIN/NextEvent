namespace NextEvent.Modules.Organizations.Application.Organizations.DTOs;

public class OrganizationMemberRoleDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class OrganizationMemberDto
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? JoinedAtUtc { get; set; }
    
    public List<OrganizationMemberRoleDto> Roles { get; set; } = new();
}
