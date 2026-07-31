namespace NextEvent.Modules.Organizations.Domain;
public class OrganizationRolePermission
{
    public Guid OrganizationRoleId { get; set; }
    public OrganizationRole? Role { get; set; }
    
    public Guid PermissionId { get; set; }
    public Permission? Permission { get; set; }
}
