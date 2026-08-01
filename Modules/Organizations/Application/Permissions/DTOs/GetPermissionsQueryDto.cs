namespace NextEvent.Modules.Organizations.Application.Permissions.DTOs;

/// <summary>
/// Query parameter DTO for requesting system permissions for an organization.
/// </summary>
public class GetPermissionsQueryDto
{
    /// <summary>Unique identifier of the organization context.</summary>
    public Guid OrganizationId { get; set; }
}
