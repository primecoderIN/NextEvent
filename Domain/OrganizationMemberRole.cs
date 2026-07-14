namespace Domain;

public class OrganizationMemberRole
{
    public Guid OrganizationMemberId { get; set; }
    public OrganizationMember? Member { get; set; }
    
    public Guid OrganizationRoleId { get; set; }
    public OrganizationRole? Role { get; set; }
}
