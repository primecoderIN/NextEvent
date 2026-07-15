namespace Application.Organizations.Commands.CreateOrganization;

/// <summary>
/// Fields the client must supply to create a new organization.
/// All optional profile fields can be updated later via PATCH /api/organizations/{id}.
/// </summary>
public class CreateOrganizationDto
{
    /// <summary>Display name of the organization. Max 160 characters.</summary>
    public required string Name { get; set; }

    /// <summary>
    /// URL-friendly slug (e.g. "acme-events"). Max 180 characters.
    /// Must be unique across all organizations.
    /// </summary>
    public required string Slug { get; set; }

    /// <summary>Optional long-form description of the organization.</summary>
    public string? Description { get; set; }

    /// <summary>Optional public website URL.</summary>
    public string? WebsiteUrl { get; set; }

    /// <summary>Optional public contact email.</summary>
    public string? ContactEmail { get; set; }

    /// <summary>Optional public contact phone.</summary>
    public string? ContactPhone { get; set; }
}
