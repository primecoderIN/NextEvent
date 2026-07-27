namespace Application.Organizations.DTOs;

/// <summary>
/// Read model returned by GET /api/organizations/{id}.
/// Flat DTO — no navigation objects, suitable for direct Dapper mapping.
/// </summary>
public class OrganizationDetailDto
{
    public Guid   Id           { get; set; }
    public string Name         { get; set; } = string.Empty;
    public string Slug         { get; set; } = string.Empty;
    public string? Description  { get; set; }
    public string? LogoUrl      { get; set; }
    public string? CoverImageUrl{ get; set; }
    public string? WebsiteUrl   { get; set; }
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }
    public string  Status       { get; set; } = string.Empty;
    public string  OwnerUserId  { get; set; } = string.Empty;
    public string? OwnerDisplayName { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
