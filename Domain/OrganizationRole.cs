namespace Domain;

public class OrganizationRole
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid OrganizationId { get; set; }
    public Organization? Organization { get; set; }
    
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    // System roles (like "Owner") cannot be deleted or modified
    public bool IsSystemRole { get; set; } = false;
    
    // Audit fields
    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
    public string CreatedByUserId { get; set; } = string.Empty;
    public User? CreatedByUser { get; set; }
    
    public DateTimeOffset? UpdatedAtUtc { get; set; }
    public string? UpdatedByUserId { get; set; }
    public User? UpdatedByUser { get; set; }
    
    public bool IsDeleted { get; set; } = false;
    
    // Navigation properties
    public ICollection<OrganizationRolePermission> RolePermissions { get; set; } = [];
    public ICollection<OrganizationMemberRole> MemberRoles { get; set; } = [];
}
