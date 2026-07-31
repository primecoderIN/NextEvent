namespace NextEvent.Modules.Organizations.Domain;
public class Permission
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    // e.g. "events.create", "organization.update"
    public string Code { get; set; } = string.Empty;
    
    // e.g. "Create Events", "Update Organization Details"
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    // e.g. "Events", "Settings"
    public string Category { get; set; } = string.Empty;

    // Navigation property
    public ICollection<OrganizationRolePermission> RolePermissions { get; set; } = [];
}
