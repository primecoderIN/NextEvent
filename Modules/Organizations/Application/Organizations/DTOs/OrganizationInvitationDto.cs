namespace NextEvent.Modules.Organizations.Application.Organizations.DTOs;

public class OrganizationInvitationDto
{
    public Guid OrganizationId { get; set; }
    public string OrganizationName { get; set; } = string.Empty;
    public string? OrganizationLogoUrl { get; set; }
    public DateTime InvitedAtUtc { get; set; }
}
