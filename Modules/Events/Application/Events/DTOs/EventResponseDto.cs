namespace NextEvent.Modules.Events.Application.Events.DTOs;
public class EventResponseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid? CategoryId { get; set; }
    public string Category { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string TimeZoneId { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Venue { get; set; } = string.Empty;
    public bool IsCancelled { get; set; }
    public bool IsSuspended { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    
    // Organization Details
    public Guid? OrganizationId { get; set; }
    public string? OrganizationName { get; set; }
    public string? OrganizationSlug { get; set; }
    public string? OrganizationLogoUrl { get; set; }
}
